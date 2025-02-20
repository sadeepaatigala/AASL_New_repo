import React, { useState } from 'react';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideo(URL.createObjectURL(file)); // Preview video
  };

  return (
    <div className="video-upload">
      <h3>Upload Video</h3>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {video && (
        <div>
          <h4>Video Preview:</h4>
          <video width="400" controls>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
