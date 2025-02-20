import React from 'react';
import './Page2.css';
import Navbar from '../components/Navbar';
import MediaDisplay from '../components/mediaDisplay';


const Page2 = () => {
  return (
    
    <div className="container">
      <Navbar /><br></br>
      <h1>Media List</h1><br></br><br></br>

      {/* Media List */}
      <div className="section">
        
        <div className="media-list">
          <MediaDisplay />
        </div>
      </div>
    </div>
  );
};

export default Page2;
