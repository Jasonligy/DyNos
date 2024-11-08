import generateGraph from "./generateRandom.js";
import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
export default function generateCube(){
    console.log('begin')
    const graph=generateGraph();
    const cube = new TimeSpaceCube(graph,1);
    console.log('finish')
    const [lines,mirrorIndex]=cube.outputMatrix();
    console.log(lines);
    console.log(mirrorIndex);
    return [lines,mirrorIndex]
}