// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; // Ensure to create this for styling
import logo from '../WhatsApp_Image_2024-10-24_at_11.42.15-removebg-preview.png'; // Import your logo image

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        {/* Replace the text with the image */}
        <img src={logo} alt="Logo" className="logo-image" />
      </div>
      <ul className="nav-links">
        <li><Link to="/Dashboard">Dashboard</Link></li>
        <li><Link to="/page1">Upload Media</Link></li>
        <li><Link to="/page2">View Media</Link></li>
        <li><Link to="/page3">Page 3</Link></li>
        <li><Link to="/page4">Page 4</Link></li>
        <li><Link to="/page5">Page 5</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
