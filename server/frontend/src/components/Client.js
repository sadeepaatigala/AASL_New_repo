import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function Client() {
    const [pcName, setPcName] = useState('');
    const [files, setFiles] = useState([]); // Stores the list of received files
    const [fileChunks, setFileChunks] = useState({});

    useEffect(() => {
        // Automatically register the client with socket.id as the PC name
        socket.on('connect', () => {
            setPcName(socket.id);
            socket.emit('register', socket.id); // Register using the socket ID as the PC name
        });

        // Listen for incoming file chunks
        socket.on('receiveFileChunk', ({ name, chunk, chunkIndex, totalChunks }) => {
            console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} of ${name}`);
            setFileChunks(prevChunks => {
                const updatedChunks = { ...prevChunks };
                if (!updatedChunks[name]) {
                    updatedChunks[name] = { chunks: [], totalChunks };
                }
                updatedChunks[name].chunks[chunkIndex] = chunk;

                if (updatedChunks[name].chunks.filter(Boolean).length === totalChunks) {
                    const fileData = new Blob(updatedChunks[name].chunks);
                    const newFile = { name, data: fileData };
                    setFiles(prevFiles => [...prevFiles, newFile]);
                    delete updatedChunks[name];
                    console.log(`File ${name} fully received`);
                }

                return updatedChunks;
            });

            // Acknowledge the receipt of the chunk
            socket.emit('chunkReceived', { name, chunkIndex, pcName });
        });

        // Listen for the update of the client list
        socket.on('updateClientList', (clients) => {
            console.log('Connected Clients:', clients);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('receiveFileChunk');
            socket.off('updateClientList');
        };
    }, []);

    const downloadFile = (file) => {
        const blob = new Blob([file.data], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
    };

    const previewFile = (file) => {
        const blob = new Blob([file.data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const fileType = file.name.split('.').pop().toLowerCase();
        const previewBox = document.getElementById('previewBox');

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            previewBox.innerHTML = `<img src="${url}" alt="Preview" width="300" />`;
        } else if (['mp4', 'webm', 'ogg'].includes(fileType)) {
            previewBox.innerHTML = `<video controls width="300"><source src="${url}" type="video/${fileType}">Your browser does not support the video tag.</video>`;
        } else if (fileType === 'pdf') {
            previewBox.innerHTML = `<iframe src="${url}" width="100%" height="500px"></iframe>`;
        } else if (['txt', 'json'].includes(fileType)) {
            const reader = new FileReader();
            reader.onload = () => {
                previewBox.textContent = reader.result;
            };
            reader.readAsText(blob);
        } else {
            previewBox.textContent = 'Preview not available for this file type.';
        }
    };

    const clearFileList = () => {
        setFiles([]);  // Clear the files list
        document.getElementById('previewBox').textContent = '';  // Clear the preview box
        console.log('File list cleared');
    };

    return (
        <div>
            <h1>Client Machine</h1>
            <p>Registered as: {pcName}</p>

            <h3>Files Received:</h3>
            <button onClick={clearFileList} style={{ marginBottom: '10px' }}>
                Clear List
            </button>
            {files.length > 0 ? (
                <ul>
                    {files.map((file, index) => (
                        <li key={index}>
                            {file.name}
                            <button onClick={() => downloadFile(file)}>Download</button>
                            <button onClick={() => previewFile(file)}>Preview</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No files received yet.</p>
            )}

            <h3>Preview:</h3>
            <div id="previewBox" style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px' }}></div>
        </div>
    );
}

export default Client;