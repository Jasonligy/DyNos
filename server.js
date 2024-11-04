import express from 'express';
import path from 'path';
import readFile from './src/samples/VanDeBunt.js';
import generateCube from './src/generateCube.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));  // This serves all files in the root directory, including css and src

// Serve the index.html file
app.get('/', (req, res) => {
  read();  
  console.log('test')
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/tt', (req, res) => {
    readFile();  
    console.log('test')
    // res.sendFile(path.join(__dirname, 'index.html'));
  });
app.get('/check', (req, res) => {
  generateCube();
  console.log('test')
  // res.sendFile(path.join(__dirname, 'index.html'));
});
// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});



// app.use(express.static(path.join(__dirname)));
// res.sendFile(path.join(__dirname, 'index.html'));
// app.use(express.static(path.join(__dirname))); 