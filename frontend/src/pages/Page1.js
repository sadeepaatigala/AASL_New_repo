// src/pages/Page1.js
import React from 'react';
import UploadComponent from '../components/UploadComponent';
import '../css/Page1.css';
import Navbar from '../components/Navbar';

const Page1 = () => {
  return (
    <div className="page-container">
      {/* Add Navbar at the top */}
      <Navbar />

      {/* Upload Component Section */}
      <UploadComponent />
    </div>
  );
};

export default Page1;
