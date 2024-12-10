export class EnsureTimeCorrectness{
    constructor(cube,safeMovementFactor){
        this.cube=cube;
        this.safeMovementFactor=safeMovementFactor;
        
    }
    execute(){
        const movement=this.cube.nodeAttributes['movement'];
        for(const [id,mirrorLines] of this.cube.nodeMirrorMap.entries()){
            //set the time cooridinate to 0
            for(const mirrorLine of mirrorLines){
                const nodeList=mirrorLine.nodeList;
                // console.log(mirrorLine)
                movement.get(nodeList[0])[2]=0;
                movement.get(nodeList[nodeList.length-1])[2]=0;
                const finalPositions=this.getFinalPosition(nodeList);
                const factors=new Array(finalPositions.length).fill(1.0);
                for(let i=0;i<nodeList.length-1;i++){
                    this.limitMovement(i,nodeList,finalPositions,factors);
                }
                for(let i=0;i<nodeList.length-1;i++){
                    movement.set(nodeList[i],movement.get(nodeList[i]).map((value,index)=>value*factors[i]))
                }
            }
        }
    }
    getFinalPosition(nodes){
        const movement=this.cube.nodeAttributes['movement'];
        const pos=this.cube.nodeAttributes['nodePosition'];
        const finals=[];
        // console.log(pos)
        for(const node of nodes){
            finals.push(pos.get(node).map((value,index)=>value+movement.get(node)[index]))

        }
        return finals;
    }
    
    limitMovement(i,nodeList,finals,factors){
        const pos=this.cube.nodeAttributes['nodePosition'];
        const a=nodeList[i];
        const b=nodeList[i+1];
        const aPos=pos.get(a);
        const bPos=pos.get(b);
        const halfInitDist=(bPos[2]-aPos[2])*this.safeMovementFactor;
        const aMovZ=finals[i][2]-aPos[2];
        const bMovZ=bPos[2]-finals[i+1][2];
        if(aMovZ>halfInitDist){
            factors[i]=Math.min(factors[i],halfInitDist/aMovZ);
        }
        if(bMovZ>halfInitDist){
            factors[i+1]=Math.min(factors[i+1],halfInitDist/bMovZ);
        }


    }
}