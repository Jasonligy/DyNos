import {getUnitVector} from "../utils/vectorOps.js"
export class Gravity{
    constructor(cube){
        this.cube=cube;
    }
    setTemperature(temperature){
        this.temperature=temperature;
    }
    computeShift(){
        let sumPosition=[0,0]
        const totalNodes=this.cube.nodes.size;
        for(const node of this.cube.nodes){
            sumPosition[0]+=this.cube.nodeAttributes['nodePosition'].get(node)[0];
            sumPosition[1]+=this.cube.nodeAttributes['nodePosition'].get(node)[1];
        }
        const center=[sumPosition[0]/totalNodes,sumPosition[1]/totalNodes];
        const force=this.cube.nodeAttributes['force'];
        for(const node of this.cube.nodes){
            
            const coordinate=this.cube.nodeAttributes['nodePosition'].get(node);
            // console.log([center[0]-coordinate[0],center[1]-coordinate[1],0])
            // const gravity=getUnitVector([center[0]-coordinate[0],center[1]-coordinate[1],0])
            // const result = force.get(node).map((value, index) => value + gravity[index]);
            // force.set(node,result);
        }
        for(const node of this.cube.nodes){
            
            const coordinate=this.cube.nodeAttributes['nodePosition'].get(node);
            // console.log([center[0]-coordinate[0],center[1]-coordinate[1],0])
            const gravity=getUnitVector([center[0]-coordinate[0],center[1]-coordinate[1],0])
            // console.log(force)
            const result = force.get(node).map((value, index) => value + gravity[index]);
            force.set(node,result);
            // console.log(result)
        }
    }
   
}