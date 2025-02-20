import React from 'react';

const EmbeddedServer = () => {
  return (
    <div>
      <h1>Embedded Server Component</h1>
      <iframe
        src="http://localhost:3001/server"
        style={{ width: '100%', height: '800px', border: 'none' }}
        title="Server Component"
      ></iframe>
    </div>
  );
};

export default EmbeddedServer;