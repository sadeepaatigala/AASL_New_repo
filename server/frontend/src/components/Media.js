import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Media.css'; // Import the CSS file

const API_BASE_URL = 'http://localhost:3001'; // Base URL for API calls

const Media = () => {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Fetch photos and videos
    axios.get(`${API_BASE_URL}/media`)
      .then(res => {
        setPhotos(res.data.photos);
        setVideos(res.data.videos);
      })
      .catch(err => console.error('Error fetching media:', err));
  }, []);

  const handlePreview = (media) => {
    setPreview(media);
  };

  const closePreview = () => {
    setPreview(null);
  };

  return (
    <div className="media-container">
      <h2>Photos</h2>
      <div className="media-grid">
        {photos.map((photo, index) => (
          <div key={index} className="media-item" onClick={() => handlePreview({ type: 'photo', src: `${API_BASE_URL}/uploads/${photo}` })}>
            <img src={`${API_BASE_URL}/uploads/${photo}`} alt={photo} className="media-thumbnail" />
            <div className="media-filename">{photo}</div>
          </div>
        ))}
      </div>

      <h2>Videos</h2>
      <div className="media-grid">
        {videos.map((video, index) => (
          <div key={index} className="media-item" onClick={() => handlePreview({ type: 'video', src: `${API_BASE_URL}/uploads/${video}` })}>
            <video width="200" controls className="media-thumbnail">
              <source src={`${API_BASE_URL}/uploads/${video}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="media-filename">{video}</div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="media-preview" onClick={closePreview}>
          <div className="media-preview-content" onClick={(e) => e.stopPropagation()}>
            {preview.type === 'photo' ? (
              <img src={preview.src} alt="Preview" className="media-preview-image" />
            ) : (
              <video controls className="media-preview-video">
                <source src={preview.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;