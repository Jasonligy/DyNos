import {getUnitVector,getclosestPoint, magnitude} from "../utils/vectorOps.js"
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
    applyNodeEdgeRepulsion(force,a,aPos,c,cPos,d,dPos){
        //need implement almost zero for node (a and c) and (a and d);

        const relation=getclosestPoint(aPos,cPos,dPos);
        const closest=relation.closestPoint;
        const nodeEdgeVector=closest.map((value,index)=>value-aPos[index]);
        const unit=getUnitVector(nodeEdgeVector);
        const baseForce=unit.map((value,index)=>value*Math.pow(this.desired/magnitude(nodeEdgeVector),computeExponent()));
        //cautious with original one 
        if(relation.isIncluded){
            const balance=magnitude(closest.map((value,index)=>value-cPos))/
                magnitude(dPos.map((value,index)=>value-cPos))
                
        }
    }
}