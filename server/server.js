const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import CORS
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 1e8, // 100MB - for individual chunks
    pingTimeout: 120000, // 2 minutes
    pingInterval: 25000,
    connectTimeout: 60000,
    transports: ['websocket', 'polling'],
    upgradeTimeout: 30000,
});

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON payloads

let clients = {}; // Store connected clients
let fileTransfers = {}; // Store file transfers

// Serve static files from React app build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve media files
const UPLOADS_DIR = path.join(__dirname, '../backend/uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/media', (req, res) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        const photos = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
        const videos = files.filter(file => /\.(mp4|avi|mov|wmv)$/.test(file));
        const textFiles = files.filter(file => /\.(txt)$/.test(file));
        res.json({ photos, videos, textFiles });
    });
});

// Serve frontend for specific routes
app.get('/client', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.get('/server', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Catch-all route to serve React app for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Socket.IO setup
io.on('connection', (socket) => {
    const clientIp = socket.handshake.address; // Extract client IP from handshake
    console.log(`Client connected: ${socket.id} from IP: ${clientIp}`);

    // Automatically register the client with IP as the identifier
    clients[clientIp] = socket.id;
    console.log(`Registered PC: ${clientIp}`);
    io.emit('updateClientList', Object.keys(clients));

    // Handle file transfer initialization
    socket.on('initFileTransfer', ({ name, size, totalChunks, pcName }) => {
        const targetSocket = clients[pcName];
        if (targetSocket) {
            if (!fileTransfers[pcName]) {
                fileTransfers[pcName] = {};
            }
            fileTransfers[pcName][name] = { 
                chunks: new Array(totalChunks), 
                totalChunks,
                receivedChunks: 0,
                size
            };
            io.to(targetSocket).emit('fileTransferStart', { name, size, totalChunks });
        }
    });

    // Handle file chunk sending with error handling and retries
    socket.on('sendFileChunk', ({ name, chunk, chunkIndex, totalChunks, pcName, attempt = 1 }) => {
        const targetSocket = clients[pcName];
        if (targetSocket) {
            try {
                const transfer = fileTransfers[pcName]?.[name];
                if (transfer) {
                    transfer.chunks[chunkIndex] = chunk;
                    transfer.receivedChunks++;
                    
                    io.to(targetSocket).emit('receiveFileChunk', { 
                        name, 
                        chunk, 
                        chunkIndex, 
                        totalChunks,
                        progress: Math.round((transfer.receivedChunks / totalChunks) * 100)
                    });

                    // Acknowledge successful chunk transfer
                    socket.emit('chunkAcknowledged', { name, chunkIndex });

                    if (transfer.receivedChunks === totalChunks) {
                        io.to(targetSocket).emit('fileTransferComplete', { name });
                        delete fileTransfers[pcName][name];
                    }
                }
            } catch (error) {
                console.error(`Error handling chunk for ${name} (attempt ${attempt}):`, error);
                
                // Retry logic for failed chunks (up to 3 attempts)
                if (attempt < 3) {
                    setTimeout(() => {
                        socket.emit('retryChunk', { name, chunkIndex, attempt: attempt + 1 });
                    }, 1000 * attempt); // Exponential backoff
                } else {
                    io.to(targetSocket).emit('fileTransferError', { 
                        name, 
                        error: 'Failed to process file chunk after multiple attempts' 
                    });
                }
            }
        }
    });

    // Handle acknowledgment when a chunk is received
    socket.on('chunkReceived', ({ name, chunkIndex, pcName }) => {
        console.log(`Chunk ${chunkIndex + 1} of ${name} received by ${pcName}`);
        // Send the next chunk if available
        const transfer = fileTransfers[pcName]?.[name];
        if (transfer && chunkIndex + 1 < transfer.totalChunks) {
            const nextChunkIndex = chunkIndex + 1;
            const nextChunk = transfer.chunks[nextChunkIndex];
            io.to(clients[pcName]).emit('receiveFileChunk', { name, chunk: nextChunk, chunkIndex: nextChunkIndex, totalChunks: transfer.totalChunks });
            console.log(`Sending chunk ${nextChunkIndex + 1}/${transfer.totalChunks} of ${name} to ${pcName}`);
        } else {
            console.log(`All chunks of ${name} have been sent to ${pcName}`);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        delete clients[clientIp];
        console.log(`PC ${clientIp} disconnected`);
        io.emit('updateClientList', Object.keys(clients));
    });
});

// Start the server
server.listen(3001, () => {
    console.log('Server running on http://192.168.38.176:3001');
});