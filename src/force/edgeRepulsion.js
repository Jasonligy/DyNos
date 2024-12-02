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
        const pos=this.cube.nodeAttributes['nodePosition'];
        for(const node of this.cube.nodes){
            force.set(node,[0,0,0]);

        }
        let nodeDone=new Set();
        for(const node of this.cube.nodes){
            const mirrorLineFirst=this.cube.node2mirrorLine.get(node)
            const DyNodeFirst=this.cube.mirrorLine2DyNode(mirrorLineFirst);
            for(const edge of this.cube.edges){
                const mirrorLineSecond=this.cube.edges2mirrorLine.get(edge)
                const DyNodeSecond=this.cube.mirrorLine2DyNode(mirrorLineSecond);
                if(DyNodeFirst!=DyNodeSecond){
                    //距离小于5
                    const begin=edge.sourceNode;
                    const end=edge.targetNode;
                    const beginPos=pos.get(begin);
                    const endPos=pos.get(end);
                    const nodePos=pos.get(node);
                    const distance=magnitude(nodePos,getclosestPoint(nodePos,beginPos,endPos));
                    if(distance<5*this.desired){
                        applyNodeEdgeRepulsion(force,node,nodePos,begin,beginPos,end,endPos)
                    }
                
                    
                }
            }

        }
        for(const[id,value] of overallForce.entries()){
            if(force.has(id)){
                overallForce.set(id,value.map((v,index)=>v+force.get(id)[index]))
            }
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