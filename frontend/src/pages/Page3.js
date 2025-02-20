import React from 'react';
import Navbar from '../components/Navbar';
import EmbeddedServer from '../components/EmbeddedServer';

const Page3 = () => {
  return (
    <div>
      <Navbar />
      <div id="embedded-server-container">
        <EmbeddedServer />
      </div>
    </div>
  );
};

export default Page3;