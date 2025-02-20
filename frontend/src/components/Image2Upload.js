import React, { useState } from 'react';

const Image2Upload = () => {
  const [image2, setImage2] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage2(URL.createObjectURL(file)); // Preview image 2
  };

  return (
    <div className="image-upload">
      <h3>Upload Image 2</h3>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image2 && (
        <div>
          <h4>Image 2 Preview:</h4>
          <img src={image2} alt="Uploaded Preview" width="200" />
        </div>
      )}
    </div>
  );
};

export default Image2Upload;
