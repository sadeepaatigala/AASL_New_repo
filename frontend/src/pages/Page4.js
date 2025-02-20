import React, { useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import the Navbar component
import EmbeddedClient from '../components/EmbeddedClient';

const Page4 = () => {
  
    return (
        <div>
          <Navbar /> {/* Add the Navbar component */}
          <div id="embedded-server-container">
            <EmbeddedClient />
          </div>
        </div>
      );

  
};

export default Page4;