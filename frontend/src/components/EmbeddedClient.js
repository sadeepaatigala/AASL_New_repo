import React from 'react';

const EmbeddedClient = () => {
  return (
    <div>
      <h1>Embedded Client Component</h1>
      <iframe
        src="http://localhost:3001/client"
        style={{ width: '100%', height: '500px', border: 'none' }}
        title="Client Component"
      ></iframe>
    </div>
  );
};

export default EmbeddedClient;