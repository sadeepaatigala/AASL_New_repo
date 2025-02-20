import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Media.css'; // Import the CSS file

const API_BASE_URL = 'http://192.168.38.176:3001'; // Base URL for API calls
const socket = io(API_BASE_URL);

const CHUNK_SIZE = 10 * 1024 * 1024; // 10mb

function Server() {
    const [pcName, setPcName] = useState('');
    const [files, setFiles] = useState([]);
    const [registeredPCs, setRegisteredPCs] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [textFiles, setTextFiles] = useState([]);
    const [preview, setPreview] = useState(null);
    const [transferProgress, setTransferProgress] = useState({});
    const [isTransferring, setIsTransferring] = useState(false);
    const [retries, setRetries] = useState({});

    useEffect(() => {
        socket.on('updateClientList', (clientList) => {
            setRegisteredPCs(clientList);
        });

        socket.on('chunkAcknowledged', ({ name, chunkIndex }) => {
            setTransferProgress(prev => ({
                ...prev,
                [name]: Math.round(((chunkIndex + 1) / (files.find(f => f.name === name)?.totalChunks || 1)) * 100)
            }));
        });

        socket.on('retryChunk', ({ name, chunkIndex, attempt }) => {
            const file = files.find(f => f.name === name);
            if (file) {
                sendChunk(file, chunkIndex, attempt);
            }
        });

        socket.on('fileTransferComplete', ({ name }) => {
            console.log(`File ${name} transferred successfully`);
            setTransferProgress(prev => ({ ...prev, [name]: 100 }));
        });

        return () => {
            socket.off('updateClientList');
            socket.off('chunkAcknowledged');
            socket.off('retryChunk');
            socket.off('fileTransferComplete');
        };
    }, [files]);

    useEffect(() => {
        // Fetch photos, videos, and text files
        axios.get(`${API_BASE_URL}/media`)
            .then(res => {
                setPhotos(res.data.photos || []);
                setVideos(res.data.videos || []);
                setTextFiles(res.data.textFiles || []);
            })
            .catch(err => console.error('Error fetching media:', err));
    }, []);

    const handlePreview = (media) => {
        setPreview(media);
    };

    const closePreview = () => {
        setPreview(null);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        addFiles(selectedFiles);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(event.dataTransfer.files);

        const validDroppedFiles = droppedFiles.filter(file =>
            file.type.startsWith('image/') ||
            file.type.startsWith('video/') ||
            file.type === 'application/pdf' ||
            file.type === 'text/plain'
        );

        addFiles(validDroppedFiles);
    };

    const addFiles = (newFiles) => {
        const uniqueFiles = newFiles.filter((newFile) =>
            !files.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size)
        );

        setFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);

        const newPreviews = uniqueFiles.map((file) => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf' || file.type === 'text/plain') {
                return URL.createObjectURL(file);
            }
            return null;
        });

        setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviews]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const clearFiles = () => {
        setFiles([]);
        setPreviewUrls([]);
    };

    const sendChunk = async (file, chunkIndex, attempt = 1) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        
        try {
            const chunk = await readFileChunk(file, start, end);
            
            return new Promise((resolve, reject) => {
                socket.emit('sendFileChunk', {
                    name: file.name,
                    chunk,
                    chunkIndex,
                    totalChunks: Math.ceil(file.size / CHUNK_SIZE),
                    pcName,
                    attempt
                });

                // Longer timeout for larger chunks
                const timeoutDuration = Math.min(30000, chunk.byteLength / 1024 * 10);
                const timeout = setTimeout(() => {
                    reject(new Error('Chunk send timeout'));
                }, timeoutDuration);

                socket.once('chunkAcknowledged', ({ name, chunkIndex: ackIndex }) => {
                    if (name === file.name && chunkIndex === ackIndex) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });
        } catch (error) {
            if (attempt < 3) {
                console.log(`Retrying chunk ${chunkIndex} of ${file.name} (attempt ${attempt + 1})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                return sendChunk(file, chunkIndex, attempt + 1);
            }
            throw error;
        }
    };

    const sendFiles = async () => {
        setIsTransferring(true);

        for (const file of files) {
            try {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                file.totalChunks = totalChunks; // Store for progress calculation

                // Initialize transfer
                socket.emit('initFileTransfer', {
                    name: file.name,
                    size: file.size,
                    totalChunks,
                    pcName
                });

                // Send chunks with dynamic delay based on file size
                for (let i = 0; i < totalChunks; i++) {
                    await sendChunk(file, i);
                    
                    // Dynamic delay based on chunk success rate
                    const delay = Math.min(100, (retries[file.name]?.[i] || 0) * 50);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                console.error(`Error sending file ${file.name}:`, error);
                alert(`Failed to send ${file.name}: ${error.message}`);
            }
        }
        setIsTransferring(false);
    };

    // Helper function to read file chunks
    const readFileChunk = (file, start, end) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file.slice(start, end));
        });
    };

    return (
        <div>
            <h1>Server Machine</h1>

            {/* Media display section */}
            <div className="media-container">
                <h2>Photos</h2>
                <div className="media-grid">
                    {photos.map((photo, index) => (
                        <div key={index} className="media-item" onClick={() => handlePreview({ type: 'photo', src: `${API_BASE_URL}/uploads/${photo}` })} draggable>
                            <img src={`${API_BASE_URL}/uploads/${photo}`} alt={photo} className="media-thumbnail" />
                            <div className="media-filename">{photo}</div>
                        </div>
                    ))}
                </div>

                <h2>Videos</h2>
                <div className="media-grid">
                    {videos.map((video, index) => (
                        <div key={index} className="media-item" onClick={() => handlePreview({ type: 'video', src: `${API_BASE_URL}/uploads/${video}` })} draggable>
                            <video width="200" controls className="media-thumbnail">
                                <source src={`${API_BASE_URL}/uploads/${video}`} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div className="media-filename">{video}</div>
                        </div>
                    ))}
                </div>

                <h2>Text Files</h2>
                <div className="media-grid">
                    {textFiles.map((textFile, index) => (
                        <div key={index} className="media-item" onClick={() => handlePreview({ type: 'text', src: `${API_BASE_URL}/uploads/${textFile}` })} draggable>
                            <p className="media-filename">{textFile}</p>
                        </div>
                    ))}
                </div>

                {preview && (
                    <div className="media-preview" onClick={closePreview}>
                        <div className="media-preview-content" onClick={(e) => e.stopPropagation()}>
                            {preview.type === 'photo' ? (
                                <img src={preview.src} alt="Preview" className="media-preview-image" />
                            ) : preview.type === 'video' ? (
                                <video controls className="media-preview-video">
                                    <source src={preview.src} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : preview.type === 'text' ? (
                                <iframe src={preview.src} width="100%" height="500px"></iframe>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>

            {/* Drag-and-drop area with file preview */}
            <div
                style={{
                    border: '2px dashed #ccc',
                    padding: '30px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
                    cursor: 'pointer',
                    minHeight: '200px',
                    position: 'relative',
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {files.length > 0 ? (
                    <div>
                        {previewUrls.map((url, index) => {
                            const file = files[index];
                            const fileType = file.type.split('/')[0];

                            if (fileType === 'image') {
                                return <img key={index} src={url} alt={file.name} width="100" style={{ margin: '10px' }} />;
                            } else if (fileType === 'video') {
                                return <video key={index} controls width="100" style={{ margin: '10px' }}>
                                    <source src={url} type={file.type} />
                                    Your browser does not support the video tag.
                                </video>;
                            } else if (file.type === 'application/pdf') {
                                return <embed key={index} src={url} type="application/pdf" width="100px" height="120px" />;
                            } else if (file.type === 'text/plain') {
                                return <iframe key={index} src={url} width="100px" height="120px"></iframe>;
                            } else {
                                return <p key={index}>{file.name}</p>;
                            }
                        })}
                    </div>
                ) : (
                    <p>Drag and drop files here or click to select</p>
                )}
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="fileInput"
                />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                    Browse Files
                </label>
            </div>

            {/* Clear files button */}
            {files.length > 0 && (
                <button
                    onClick={clearFiles}
                    style={{
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Clear Files
                </button>
            )}

            {/* Dropdown to select registered PCs */}
            <div>
                <label htmlFor="pcSelect">Select PC:</label>
                <select
                    id="pcSelect"
                    value={pcName}
                    onChange={(e) => setPcName(e.target.value)}
                >
                    <option value="">-- Select a PC --</option>
                    {registeredPCs.map((pc, index) => (
                        <option key={index} value={pc}>
                            {pc}
                        </option>
                    ))}
                </select>
            </div>

            {/* Transfer progress */}
            {Object.entries(transferProgress).map(([fileName, progress]) => (
                <div key={fileName} style={{ marginTop: '10px' }}>
                    <p>{fileName}: {progress}%</p>
                    <div style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '10px'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: '#4CAF50',
                            borderRadius: '10px',
                            transition: 'width 0.3s ease-in-out'
                        }} />
                    </div>
                </div>
            ))}

            {/* Send files button */}
            <button
                onClick={sendFiles}
                disabled={!pcName || files.length === 0 || isTransferring}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: isTransferring ? '#ccc' : (pcName && files.length > 0 ? '#007bff' : '#ccc'),
                    color: '#fff',
                    border: 'none',
                    cursor: pcName && files.length > 0 ? 'pointer' : 'not-allowed',
                }}
            >
                {isTransferring ? 'Sending...' : 'Send Files'}
            </button>

            {/* List of registered PCs */}
            <h2>Registered PCs</h2>
            <ul>
                {registeredPCs.map((pc, index) => (
                    <li key={index}>{pc}</li>
                ))}
            </ul>
        </div>
    );
}

export default Server;