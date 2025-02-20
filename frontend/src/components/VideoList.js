import React, { useState, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa'; // Importing a play icon

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch videos from the server
    fetch('http://localhost:3000/uploads')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setVideos(data.uploads.filter((item) => item.video)); // Filter out only videos
        }
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  return (
    <div>
      <h2>Videos</h2>
      {videos.length === 0 ? (
        <p>No videos available.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {videos.map((video, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FaPlay style={{ marginRight: '5px' }} />
              <span>{video.video}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideoList;
