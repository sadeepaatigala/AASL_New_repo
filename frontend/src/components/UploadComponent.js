import React, { useState } from 'react';
import axios from 'axios';
import './UploadComponent.css'; // Importing custom CSS file

const UploadComponent = () => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(new Set());
  const [uploadedVideos, setUploadedVideos] = useState(new Set());

  const handleImageChange = (e) => {
    const newImages = Array.from(e.target.files);
    const uniqueImages = newImages.filter((image) => 
      !uploadedImages.has(image.name)
    );

    if (uniqueImages.length > 0) {
      setImages([...images, ...uniqueImages]);
      uniqueImages.forEach((image) => uploadedImages.add(image.name));
    } else {
      alert("You have already uploaded this image.");
    }
  };

  const handleVideoChange = (e) => {
    const newVideos = Array.from(e.target.files);
    const uniqueVideos = newVideos.filter((video) => 
      !uploadedVideos.has(video.name)
    );

    if (uniqueVideos.length > 0) {
      setVideos([...videos, ...uniqueVideos]);
      uniqueVideos.forEach((video) => uploadedVideos.add(video.name));
    } else {
      alert("You have already uploaded this video.");
    }
  };

  const uploadFiles = async (files, type) => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('media', files[i]);
    }

    try {
      const res = await axios.post(`http://localhost:5000/upload/${type}`, formData);
      alert(res.data.message);
    } catch (err) {
      console.error(`Error uploading ${type}s`, err);
    }
  };

  const handleUploadImages = () => {
    uploadFiles(images, 'images');
  };

  const handleUploadVideos = () => {
    uploadFiles(videos, 'videos');
  };

  return (
    <div className="upload-container">
      <h2 className="upload-header">Upload Media</h2>

      <div className="upload-section">
        <h3 className="upload-subheader">Upload Images</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
        />
        <button onClick={handleUploadImages} className="upload-button">
          Upload Images
        </button>
      </div>

      <div className="upload-section">
        <h3 className="upload-subheader">Upload Videos</h3>
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={handleVideoChange}
          className="file-input"
        />
        <button onClick={handleUploadVideos} className="upload-button">
          Upload Videos
        </button>
      </div>
    </div>
  );
};

export default UploadComponent;
