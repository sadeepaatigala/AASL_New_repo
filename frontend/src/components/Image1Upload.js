import React, { useState } from 'react';

const Image1Upload = () => {
  const [image1, setImage1] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage1(URL.createObjectURL(file)); // Preview image 1
  };

  return (
    <div className="image-upload">
      <h3>Upload Image 1</h3>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image1 && (
        <div>
          <h4>Image 1 Preview:</h4>
          <img src={image1} alt="Uploaded Preview" width="200" />
        </div>
      )}
    </div>
  );
};

export default Image1Upload;
