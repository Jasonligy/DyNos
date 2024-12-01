import express from 'express';
import path from 'path';
import {readFile,getDyGraph} from './src/samples/VanDeBunt.js';
import {IntervalTree,Interval} from './src/intervalTree/intervalTree.js';
import generateCube from './src/generateCube.js';
import {TimeSpaceCube} from "./src/cube/TimeSpaceCube.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DynosRunner } from './src/runDyNos.js';
// import { draw } from './drawCube.js';

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
app.get('/api/data', (req, res) => {
  // const data = { name: 'Cube', color: 'blue', size: 3 };
  // res.json(data);
  let graph;
  readFile()
  .then((fileData) => {
      graph=getDyGraph(fileData);
    // const data=graph;
    console.log(fileData)
    const cubeBefore=new TimeSpaceCube(graph,-5);
    // const [lines,mirrorIndex]=generateCube();
    const [lines,mirrorIndex]=cubeBefore.outputMatrix();
    const data={array:lines,index:mirrorIndex};
    res.json(data)})
});
app.get('/tt', (req, res) => {

  let graph;
  readFile()
  .then((fileData) => {
      graph=getDyGraph(fileData); // Pass the object to the new function
      // console.log(graph);
      const runner=new DynosRunner(graph,100,5);
      const bcube=runner.cube;
      for(const [id,lines] of bcube.nodeMirrorMap.entries()){
        // console.log(line.nodeList)
        for(const line of lines){
          for(const node of line.nodeList){
            // console.log(node)
            console.log(bcube.nodeAttributes['nodePosition'].get(node))
          }
        }}
      const cube=runner.iterate();
      const nodeList=cube.nodes;
      for(const [id,lines] of cube.nodeMirrorMap.entries()){
        // console.log(line.nodeList)
        for(const line of lines){
          for(const node of line.nodeList){
            // console.log(node)
            // console.log(cube.nodeAttributes['nodePosition'].get(node))
            }
          }
        }

  })
 
    // const data=readFile();  
    // console.log(data.relations)
    // getDyGraph(data);
    // console.log('test')
    // res.sendFile(path.join(__dirname, 'index.html'));
  });










app.get('/check', (req, res) => {
  // generateCube();
  console.log('test')
  // res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/interval', (req, res) => {
  // generateCube();
  console.log('test')
  const tree = new IntervalTree();
  
  // Insert intervals with start, end, and boundary values
  const firstInterval=new Interval(1, 5, [10,10], [20,20]);
  tree.insert(firstInterval); // Interval [1, 5] with values 10 at the start and 20 at the end
  tree.insert(new Interval(2, 4, [100,100], [200,200]));
  // tree.insert(new Interval(6, 10, 25, 30)); // Interval [6, 10] with values 25 at the start and 30 at the end
  // tree.delete(firstInterval);
  // console.log(tree.getAllIntervals(tree.root))
  // Query for interpolated values
  const x = 3; // Query point
  const results = tree.query(tree.root, x);
  
  console.log(`Interpolated values at x = ${x}:`);
  results.forEach(result => {
    const interpolatedValue = result.interpolatedValue;
    console.log(`Interval [${result.interval.start}, ${result.interval.end}] has value: ${interpolatedValue}`);
  });
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