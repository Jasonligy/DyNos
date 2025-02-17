import {getUnitVector,getclosestPoint, magnitude} from "../utils/vectorOps.js"
export class EdgeRepulsion{
    constructor(cube,desired,temperature){
        this.cube=cube;
        this.desired=desired;
        this.initialExponent = 1;
        this.finalExponent = 3;
        this.temperature=temperature;
        this.count=0;
    }
    setTemperature(temperature){
        // console.log(temperature)
        this.temperature=temperature;
    }
    computeExponent(){
        return this.finalExponent + (this.initialExponent - this.finalExponent) * this.temperature;}
    computeShift(){
        const checkedNode= new Set();
        const overallForce=this.cube.nodeAttributes['force'];
        const force=new Map();
        const pos=this.cube.nodeAttributes['nodePosition'];
        for(const node of this.cube.nodes){
            force.set(node,[0,0,0]);

        }
        let nodeDone=new Set();
        // console.log('leng');
        // console.log(this.cube.nodes);
        
        
        for(const node of this.cube.nodes){
            // console.log('node');
            
            // console.log(node);
            
            const mirrorLineFirst=this.cube.node2mirrorLine.get(node)
            const DyNodeFirst=this.cube.mirrorLine2DyNode.get(mirrorLineFirst);
            for(const edge of this.cube.edges){
                const mirrorLineSecond=this.cube.edges2mirrorLine.get(edge)
                const DyNodeSecond=this.cube.mirrorLine2DyNode.get(mirrorLineSecond);
                if(DyNodeFirst!=DyNodeSecond){
                    //距离小于5
                    const begin=edge.sourceNode;
                    const end=edge.targetNode;
                    const beginPos=pos.get(begin);
                    const endPos=pos.get(end);
                    const nodePos=pos.get(node);
                    const distance=magnitude(nodePos,getclosestPoint(nodePos,beginPos,endPos));
                    if(distance<9*this.desired){
                        this.applyNodeEdgeRepulsion(force,node,nodePos,begin,beginPos,end,endPos)
                        continue;
                    }
                    this.count++;
                    // console.log(this.count);
                    
                    break;
                    
                }
                else{
                    // console.log('not equal');
                    
                }
            }

        }
        // console.log('pause');
        
        for(const[id,value] of overallForce.entries()){
            if(force.has(id)){
                overallForce.set(id,value.map((v,index)=>v+force.get(id)[index]))
            }
        }
        console.log('repulsion');
        
        for(const [id,value] of overallForce.entries()){
            if(force.has(id)){
                // console.log(force.get(id));
                // console.log(force.get(id)[index]);
                
                console.log(force.get(id));
                 ;
            }
        }

        // console.log(this.count);
        
    }
    computeExponent(){
        // console.log('exponent '+this.temperature )
        // this.count+=1;
        return this.finalExponent + (this.initialExponent - this.finalExponent) * this.temperature;
    }
    applyNodeEdgeRepulsion(force,a,aPos,c,cPos,d,dPos){
        //need implement almost zero for node (a and c) and (a and d);

        const relation=getclosestPoint(aPos,cPos,dPos);
        const closest=relation.closestPoint;
        const nodeEdgeVector=closest.map((value,index)=>value-aPos[index]);
        const unit=getUnitVector(nodeEdgeVector);
        const baseForce=unit.map((value,index)=>value*Math.pow(this.desired/magnitude(nodeEdgeVector),this.computeExponent()));
        console.log('baseforce');
        // console.log(this.desired);
        // console.log(this.computeExponent());
        
        
        // console.log(unit);
        // console.log(magnitude(nodeEdgeVector));
        
        
        console.log(baseForce);
        
        
        //cautious with original one 
        // console.log('pp');
        // console.log(aPos);
        // console.log(dPos);
        // console.log(dPos.map((value,index)=>value-cPos));
        
        
        
        
        
        
        if(relation.isIncluded){
            console.log('include');
            
            const balance=magnitude(closest.map((value,id)=>value-cPos[id]))/
                magnitude(dPos.map((value,id)=>value-cPos[id]));
            
            // console.log('baseforce');
            // console.log(balance);
            force.set(a,force.get(a).map((value,id)=>value-baseForce[id]));
            force.set(c,force.get(c).map((value,id)=>value+baseForce[id]*(1-balance)));
            force.set(d,force.get(d).map((value,id)=>value+baseForce[id]*(balance)));
            
                
        }
        else{
            // console.log('notinclude');
            
            force.set(a,force.get(a).map((value,id)=>value-baseForce[id]));
            force.set(c,force.get(c).map((value,id)=>value+baseForce[id]));
            force.set(d,force.get(d).map((value,id)=>value+baseForce[id]));
        }
    }
}