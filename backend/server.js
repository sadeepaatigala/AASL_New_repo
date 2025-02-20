const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const detectPort = require('detect-port'); // Import detect-port
const http = require('http');

const defaultPort = 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);





// Set up MySQL connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Sadeepa@123',
  database: 'userdb',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Multer storage configuration with actual filenames
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Retain the original file name
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


// Upload route for images
app.post('/upload/images', upload.array('media', 20), (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const query = 'SELECT * FROM media WHERE filename IN (?) AND type = "image"';
  const fileNames = files.map(file => file.originalname);

  // Check if the files already exist in the database
  db.query(query, [fileNames], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // If any of the files already exist, return a message with the duplicate filenames
      const duplicateFiles = results.map(file => file.filename);
      return res.status(400).json({
        message: `The following images already exist: ${duplicateFiles.join(', ')}`,
      });
    }

    // If no duplicates, proceed to insert the files into the database
    const insertQuery = 'INSERT INTO media (filename, type) VALUES ?';
    const values = files.map(file => [file.originalname, 'image']);

    db.query(insertQuery, [values], (err) => {
      if (err) throw err;
      res.json({ message: 'Images uploaded successfully' });
    });
  });
});

// Upload route for videos
app.post('/upload/videos', upload.array('media', 10), (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const query = 'SELECT * FROM media WHERE filename IN (?) AND type = "video"';
  const fileNames = files.map(file => file.originalname);

  // Check if the files already exist in the database
  db.query(query, [fileNames], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // If any of the files already exist, return a message with the duplicate filenames
      const duplicateFiles = results.map(file => file.filename);
      return res.status(400).json({
        message: `The following videos already exist: ${duplicateFiles.join(', ')}`,
      });
    }

    // If no duplicates, proceed to insert the files into the database
    const insertQuery = 'INSERT INTO media (filename, type) VALUES ?';
    const values = files.map(file => [file.originalname, 'video']);

    db.query(insertQuery, [values], (err) => {
      if (err) throw err;
      res.json({ message: 'Videos uploaded successfully' });
    });
  });
});


// DELETE Route for Deleting Images
app.delete('/upload/images/:id', (req, res) => {
  const mediaId = req.params.id;

  const query = 'SELECT * FROM media WHERE id = ? AND type = "image"';
  db.query(query, [mediaId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const filename = results[0].filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Delete the file from the file system
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting file' });

      // Delete from the database
      const deleteQuery = 'DELETE FROM media WHERE id = ?';
      db.query(deleteQuery, [mediaId], (err) => {
        if (err) throw err;
        res.json({ message: 'Image deleted successfully' });
      });
    });
  });
});

// DELETE Route for Deleting Videos
app.delete('/upload/videos/:id', (req, res) => {
  const mediaId = req.params.id;

  const query = 'SELECT * FROM media WHERE id = ? AND type = "video"';
  db.query(query, [mediaId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const filename = results[0].filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Delete the file from the file system
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting file' });

      // Delete from the database
      const deleteQuery = 'DELETE FROM media WHERE id = ?';
      db.query(deleteQuery, [mediaId], (err) => {
        if (err) throw err;
        res.json({ message: 'Video deleted successfully' });
      });
    });
  });
});

// PUT Route for Updating Image Filename
app.put('/upload/images/:id', (req, res) => {
  const { id } = req.params;
  const { filename } = req.body;

  const query = 'SELECT * FROM media WHERE id = ? AND type = "image"';
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const oldFilename = results[0].filename;
    const oldFilePath = path.join(__dirname, 'uploads', oldFilename);
    const newFilePath = path.join(__dirname, 'uploads', filename);

    // Rename the file on the file system
    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) return res.status(500).json({ message: 'Error renaming file' });

      // Update the filename in the database
      const updateQuery = 'UPDATE media SET filename = ? WHERE id = ?';
      db.query(updateQuery, [filename, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Image updated successfully' });
      });
    });
  });
});

// PUT Route for Updating Video Filename
app.put('/upload/videos/:id', (req, res) => {
  const { id } = req.params;
  const { filename } = req.body;

  const query = 'SELECT * FROM media WHERE id = ? AND type = "video"';
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const oldFilename = results[0].filename;
    const oldFilePath = path.join(__dirname, 'uploads', oldFilename);
    const newFilePath = path.join(__dirname, 'uploads', filename);

    // Rename the file on the file system
    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) return res.status(500).json({ message: 'Error renaming file' });

      // Update the filename in the database
      const updateQuery = 'UPDATE media SET filename = ? WHERE id = ?';
      db.query(updateQuery, [filename, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Video updated successfully' });
      });
    });
  });
});

// Get media
app.get('/media', (req, res) => {
  const query = 'SELECT * FROM media';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (results.length > 0) {
      return res.json({ success: true, message: 'Login successful!' });
    } else {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Endpoint to add a new user
app.post('/adduser', (req, res) => {
  const { username, password } = req.body;

  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: 'User is already registered' });
    }

    const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertUserQuery, [username, password], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }

      return res.json({ success: true, message: 'User added successfully!' });
    });
  });
});

// Detect available port and start server
detectPort(defaultPort, (err, availablePort) => {
  if (err) {
    console.error('Error detecting port:', err);
    process.exit(1); 
  }

  const port = availablePort; 
  console.log(`Server will run on port: ${port}`);

  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});


app.listen(5000, () => {
  console.log('Server started on port 5000');
});
