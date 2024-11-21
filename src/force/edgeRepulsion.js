import {getUnitVector} from "../utils/vectorOps.js"
export class EdgeRepulsion{
    constructor(cube,desired,temperature){
        this.cube=cube;
        this.desired=desired;
        this.initialExponent = 4;
        this.finalExponent = 2;
        this.temperature=temperature;
    }
    computeExponent(){
        return this.finalExponent + (this.initialExponent - this.finalExponent) * this.temperature;
    }
    computeShift(){
        const force=new Map();
        for(const node of this.cube.nodes){
            force.set(node,[0,0,0]);

        }
        let nodeDone=new Set();
        for(const edge of this.cube.edges){

        }
    }
}