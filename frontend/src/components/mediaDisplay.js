import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MediaDisplay.css';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for API calls

const MediaDisplay = () => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [imageSearch, setImageSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');

  // Fetch images and videos on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/media`)
      .then(res => {
        const imageFiles = res.data.filter(media => media.type === 'image');
        const videoFiles = res.data.filter(media => media.type === 'video');
        
        // Sort by latest added (createdAt timestamp)
        imageFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        videoFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setImages(imageFiles);
        setVideos(videoFiles);
      })
      .catch(err => console.error('Error fetching media', err));
  }, []);

  // Handle the start of drag
  const handleDragStart = (media) => {
    setDraggedItem(media);
  };

  // Handle the drop event
  const handleDrop = () => {
    if (draggedItem) {
      console.log('Dropped media:', draggedItem);
      setDraggedItem(null);
    }
  };

  // Delete media item
  const handleDelete = (id, type) => {
    const deleteUrl = type === 'image' ? `${API_BASE_URL}/upload/images/${id}` : `${API_BASE_URL}/upload/videos/${id}`;
    
    axios.delete(deleteUrl)
      .then(() => {
        if (type === 'image') {
          setImages(prevImages => prevImages.filter(img => img.id !== id));
        } else {
          setVideos(prevVideos => prevVideos.filter(vid => vid.id !== id));
        }
      })
      .catch(err => console.error('Error deleting media', err));
  };

  // Edit media filename
  const handleEdit = (id, newFilename, type) => {
    const updateUrl = type === 'image' 
      ? `${API_BASE_URL}/upload/images/${id}` 
      : `${API_BASE_URL}/upload/videos/${id}`;

    axios.put(updateUrl, { filename: newFilename })
      .then(() => {
        if (type === 'image') {
          setImages(prevImages => prevImages.map(img => img.id === id ? { ...img, filename: newFilename } : img));
        } else {
          setVideos(prevVideos => prevVideos.map(vid => vid.id === id ? { ...vid, filename: newFilename } : vid));
        }
      })
      .catch(err => console.error('Error updating media', err));
  };

  // Filter images and videos based on search input
  const filteredImages = images.filter(img => img.filename.toLowerCase().includes(imageSearch.toLowerCase()));
  const filteredVideos = videos.filter(vid => vid.filename.toLowerCase().includes(videoSearch.toLowerCase()));

  return (
    <div className="media-display-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <br></br>
      <h2>Uploaded Images</h2>
      <input 
        type="text" 
        placeholder="Search images..." 
        value={imageSearch} 
        onChange={(e) => setImageSearch(e.target.value)} 
        className="search-input"
      />
      <div className="media-folder-container">
        <MediaGrid 
          mediaItems={filteredImages} 
          handleDragStart={handleDragStart} 
          handleDelete={handleDelete} 
          handleEdit={handleEdit} 
          type="image"
        />
      </div>

      
      <br></br><br></br><br></br>
      <h2>Uploaded Videos</h2>
      <input 
        type="text" 
        placeholder="Search videos..." 
        value={videoSearch} 
        onChange={(e) => setVideoSearch(e.target.value)} 
        className="search-input"
      />
      <div className="media-folder-container">
        <MediaGrid 
          mediaItems={filteredVideos} 
          handleDragStart={handleDragStart} 
          handleDelete={handleDelete} 
          handleEdit={handleEdit} 
          type="video"
        />
      </div>
    </div>
  );
};

// Media grid component
const MediaGrid = ({ mediaItems, handleDragStart, handleDelete, handleEdit, type }) => {
  const [editMode, setEditMode] = useState(null);
  const [newFilename, setNewFilename] = useState('');

  // Start editing media filename
  const startEditing = (id, filename) => {
    setEditMode(id);
    setNewFilename(filename);
  };

  // Save the new filename
  const saveEdit = (id) => {
    if (newFilename.trim()) {
      handleEdit(id, newFilename, type);
      setEditMode(null);
    } else {
      alert('Filename cannot be empty');
    }
  };

  return (
    <div className="media-grid-container">
      {mediaItems.map(media => (
        <div className="media-item-container" key={media.id} draggable onDragStart={() => handleDragStart(media)}>
          <div className="media-thumbnail-container">
            <MediaItem media={media} />
          </div>
          {editMode === media.id ? (
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              className="filename-input"
            />
          ) : (
            <p className="media-item-filename">{media.filename}</p>
          )}
          <div className="media-item-actions">
            {editMode === media.id ? (
              <button onClick={() => saveEdit(media.id)} className="save-button">Save</button>
            ) : (
              <button onClick={() => startEditing(media.id, media.filename)} className="edit-button">Edit</button>
            )}
            <button onClick={() => handleDelete(media.id, type)} className="delete-button">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Media item component for displaying images/videos
const MediaItem = ({ media }) => {
  return (
    <div className="media-icon-container">
      {media.type === 'image' ? (
        <img src={`${API_BASE_URL}/uploads/${media.filename}`} alt={media.filename} className="media-image" />
      ) : (
        <video width="100" controls className="media-video">
          <source src={`${API_BASE_URL}/uploads/${media.filename}`} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default MediaDisplay;
