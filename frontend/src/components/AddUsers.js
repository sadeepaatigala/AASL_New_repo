import React, { useState } from 'react';
import './AddUsers.css'; // For styling

const AddUsers = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for storing error message
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a user object with username and password
    const userData = { username, password };

    // Send POST request to add the user
    fetch('http://localhost:3000/adduser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Reset error message and display success message
          setErrorMessage('');
          setSuccessMessage('User added successfully!');
        } else {
          // Display error message from the server
          setErrorMessage(data.message);
          setSuccessMessage('');
        }
      })
      .catch((error) => {
        setErrorMessage('An error occurred while adding the user');
        setSuccessMessage('');
        console.error('Error adding user:', error);
      });
  };

  return (
    <div className="add-user-container">
      <h3>Add User</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Error Message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {/* Success Message */}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUsers;
