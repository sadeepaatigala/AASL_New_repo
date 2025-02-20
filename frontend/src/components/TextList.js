import React, { useState, useEffect } from 'react';

const TextList = () => {
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    // Fetch texts from the server
    fetch('http://localhost:3000/uploads')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTexts(data.uploads.filter((item) => item.textContent)); // Filter out only texts
        }
      })
      .catch((error) => console.error('Error fetching texts:', error));
  }, []);

  return (
    <div>
      <h2>Texts</h2>
      {texts.length === 0 ? (
        <p>No texts available.</p>
      ) : (
        <ul>
          {texts.map((text, index) => (
            <li key={index}>
              <p>{text.textContent}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TextList;
