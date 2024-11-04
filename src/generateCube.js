import generateGraph from "./generateRandom.js";
import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
export default function generateCube(){
    console.log('begin')
    const graph=generateGraph();
    const cube = new TimeSpaceCube(graph,0.1);
    console.log('finish')
}