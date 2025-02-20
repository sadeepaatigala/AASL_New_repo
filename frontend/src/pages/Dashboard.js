// src/pages/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import AddUsers from '../components/AddUsers';
import Navbar from '../components/Navbar'; // Import the Navbar component
import './Dashboard.css';
import backgroundImage from '../10380264_713734275377167_3637431274593138582_o.jpg';

const Dashboard = () => {
  return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Navbar Component */}
      <Navbar />

      {/* Dashboard Main Content */}
      <div className="dashboard-main">
        {/* Left Section: Add Users Component */}
        <div className="left-section">
          <AddUsers />
        </div>

        {/* Right Section: Dashboard Content */}
        <div className="right-section">
          <h3>Welcome to Your Dashboard</h3>
          <div className="button-container">
            <Link to="/page1"><button className="dashboard-button">Upload Media</button></Link>
            <Link to="/page2"><button className="dashboard-button">View Media</button></Link>
            <Link to="/page3"><button className="dashboard-button">Page 3</button></Link>
            <Link to="/page4"><button className="dashboard-button">Page 4</button></Link>
            <Link to="/page5"><button className="dashboard-button">Page 5</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
