import {getUnitVector,getIntersection} from "../utils/vectorOps.js"
export class EdgeAttraction{
    constructor(cube,desired){
        this.cube=cube;
        this.desired=desired;
    }
    computeShift(){
        const overallForce=this.cube.nodeAttributes['force'];
        const force=new Map();
        for(const [edge,connection] of this.cube.edgeMirrorMap){
            const dySourceNode=connection.source;
            const dyTargetNode=connection.target;
            const mirrorLineSource=this.cube.nodeMirrorMap.get(dySourceNode);
            const mirrorLineTarget=this.cube.nodeMirrorMap.get(dyTargetNode);
            computeForce(force,connection,mirrorLineSource,mirrorLineTarget);
        }

    }
    computeForce(force,connection,source,target){
        const connectionInterval=connection.interval;
        for(const a of source.segmentList){
            const aInterval=this.segmentInterval(a);      
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
                            const beginningVector = computeConnectingVector(a, b, intersection[0]);
                            const endingVector = computeConnectingVector(a, b, intersection[1]);
                            applyVector(force,beginningVector, intersection[0], a, b, aInterval, bInterval, aRatio, bRatio);
                            applyVector(force,endingVector, intersection[1], a, b, aInterval, bInterval, aRatio, bRatio);

                        }

                    }

                }
            }
        }
    }
    applyVector(force,vector,zPos,a,b,aInt,bInt,aRatio,bRatio){
        const currentDistance

    }
    //get the difference between line segment a and b at timestamp z
    computeConnectingVector(a,b,z){
        const aPoint = valueAtZ(z, a);
        const bPoint = valueAtZ(z, b);
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