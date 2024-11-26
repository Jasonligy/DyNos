import {getUnitVector,getIntersection,magnitude} from "../utils/vectorOps.js"
export class EdgeAttraction{
    constructor(cube,desired,temperature){
        this.cube=cube;
        this.desired=desired;
        this.initialExponent = 4;
        this.finalExponent = 2;
        this.temperature=temperature;
    }
    setTemperature(temperature){
        this.temperature=temperature;
    }
    computeShift(){
        const overallForce=this.cube.nodeAttributes['force'];
        const force=new Map();
        for(const [edge,connection] of this.cube.edgeMirrorMap){
            const mirrorLineSource=connection.source;
            const mirrorLineTarget=connection.target;
            // const mirrorLineSource=this.cube.nodeMirrorMap.get(dySourceNode);
            // const mirrorLineTarget=this.cube.nodeMirrorMap.get(dyTargetNode);
            this.computeForce(force,connection,mirrorLineSource,mirrorLineTarget);
        }

        for(const [id,value] of overallForce.entries()){
            if(force.has(id)){
                overallForce.set(id,value.map((v,index)=>v+force.get(id)[index]));
            }
        }

    }
    computeForce(force,connection,source,target){
        const connectionInterval=[connection.interval.start,connection.interval.end];
        // console.log(source)
        for(const a of source.segmentList){
            // console.log('has segment')
            const aInterval=this.segmentInterval(a);
            // console.log(connectionInterval)      
            const aIntersection=getIntersection(aInterval,connectionInterval);
            if(aIntersection!=null){
                for(const b of target.segmentList){
                    const bInterval=this.segmentInterval(b);         
                    const bIntersection=getIntersection(bInterval,connectionInterval);
                    if(bIntersection!=null){
                        const intersection=getIntersection(aIntersection,bIntersection);
                        if(intersection!=null){
                            const aWidth=aInterval[1]-aInterval[0];
                            const bWidth=bInterval[1]-bInterval[0];
                            const allWidth=intersection[1]-bIntersection[0];
                            const aRatio = aWidth == 0 ? 1 : allWidth / aWidth;
                            const bRatio = bWidth == 0 ? 1 : allWidth / bWidth;
                            const beginningVector = this.computeConnectingVector(a, b, intersection[0]);
                            const endingVector = this.computeConnectingVector(a, b, intersection[1]);
                            this.applyVector(force,beginningVector, intersection[0], a, b, aInterval, bInterval, aRatio, bRatio);
                            this.applyVector(force,endingVector, intersection[1], a, b, aInterval, bInterval, aRatio, bRatio);

                        }

                    }

                }
            }
        }
    }
    computeExponent(){
        return this.finalExponent + (this.initialExponent - this.finalExponent) * this.temperature;
    }
    applyVector(force,vector,zPos,a,b,aInt,bInt,aRatio,bRatio){
        const aWidth=aInt[1]-aInt[0];
        const bWidth=bInt[1]-bInt[0];
        const currentDistance=magnitude(vector);
        //need implement almost zero
        const unit=getUnitVector(vector);
        const baseForce=unit.map((value,index)=>value*Math.pow(currentDistance / this.desired,this.computeExponent()));
        const aBalance=(zPos-aInt[0])/aWidth;
        const bBalance=(zPos-bInt[0])/bWidth;
        const aSourceForce=baseForce.map((value,index)=>value*aRatio*(1-aBalance));
        const aTargetForce=baseForce.map((value,index)=>value*aRatio*(aBalance));
        const bSourceForce=baseForce.map((value,index)=>value*(-bRatio*(1-bBalance)));
        const bTargetForce=baseForce.map((value,index)=>value*(-bRatio*(bBalance)));
        if(!force.has(a.sourceNode)){
            force.set(a.sourceNode,aSourceForce);
        }else{
            force.set(a.sourceNode,aSourceForce.map((value,index)=>value+force.get(a.sourceNode)[index]));
        }
        if(!force.has(a.targetNode)){
            force.set(a.targetNode,aTargetForce);
        }else{
            force.set(a.targetNode,aTargetForce.map((value,index)=>value+force.get(a.targetNode)[index]));
        }

        if(!force.has(b.sourceNode)){
            force.set(b.sourceNode,bSourceForce);
        }else{
            force.set(b.sourceNode,bSourceForce.map((value,index)=>value+force.get(b.sourceNode)[index]));
        }
        if(!force.has(b.targetNode)){
            force.set(b.targetNode,bTargetForce);
        }else{
            force.set(b.targetNode,bTargetForce.map((value,index)=>value+force.get(b.targetNode)[index]));
        }
        
    }
    //get the difference between line segment a and b at timestamp z
    computeConnectingVector(a,b,z){
        const aPoint = this.valueAtZ(z, a);
        const bPoint = this.valueAtZ(z, b);
        return bPoint.map((value,index)=>value-aPoint[index])
    }
    //get the position at time z of edge
    valueAtZ(z,edge){
        const pos=this.cube.nodeAttributes['nodePosition'];
        const sourcePos=pos.get(edge.sourceNode);
        const targetPos=pos.get(edge.targetNode);
        const interpolationFactor = (z - sourcePos[2]) / (targetPos[2] - sourcePos[2]);
        return targetPos.map((value,id)=>(value-sourcePos[id])*interpolationFactor+sourcePos[id])

    }
    segmentInterval(edge){
        const pos=this.cube.nodeAttributes['nodePosition'];
        const sourcePos=pos.get(edge.sourceNode);
        const targetPos=pos.get(edge.targetNode);
        //get z coordinate of the source node and target node
        return [sourcePos[2],targetPos[2]];
    }
    
}