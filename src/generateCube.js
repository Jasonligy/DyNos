import generateGraph from "./generateRandom.js";
import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
import {DynosRunner} from "./runDyNos.js"
// import {readFile,getDyGraph} from './samples/VanDeBunt.js';
export default function generateCube(){
    // let graph;
    // let cubeBefore,cubeAfter;
    // readFile()
    // .then((fileData) => {
    //     graph=getDyGraph(fileData); // Pass the object to the new function
    //     // console.log(graph);
    //     cubeBefore=new TimeSpaceCube(graph,0.2);
    //     const [lines,mirrorIndex]=cube.outputMatrix();
    //     return [lines,mirrorIndex]
    //     // const runner=new DynosRunner(graph,100,0.2);
    //     // cubeAfter=runner.iterate();

    // })



   
    console.log('begin')
    const graph=generateGraph();
    console.log(graph.edges.size);
    const cube = new TimeSpaceCube(graph,1);
    console.log(cube.nodeMirrorMap.size)
    console.log('finish')
    const [lines,mirrorIndex]=cube.outputMatrix();
    console.log(lines);
    console.log(mirrorIndex);
    return [lines,mirrorIndex]
}