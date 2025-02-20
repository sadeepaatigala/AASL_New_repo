import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MediaDisplay = () => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/media')
      .then(res => {
        const imageFiles = res.data.filter(media => media.type === 'image');
        const videoFiles = res.data.filter(media => media.type === 'video');
        setImages(imageFiles);
        setVideos(videoFiles);
      })
      .catch(err => console.error('Error fetching media', err));
  }, []);

  return (
    <div>
      <h2>Uploaded Images</h2>
      <div>
        {images.map(img => (
          <img key={img.id} src={`http://localhost:5000/uploads/${img.filename}`} alt="media" width="200" />
        ))}
      </div>

      <h2>Uploaded Videos</h2>
      <div>
        {videos.map(video => (
          <video key={video.id} width="300" controls>
            <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
      </div>
    </div>
  );
};

export default MediaDisplay;
