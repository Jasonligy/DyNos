import {avgVectors,getUnitVector,magnitude,betweenAngle} from "../utils/vectorOps.js"
export class TimeStraightning{
    constructor(cube,desired){
        this.cube=cube;
        this.desired=desired/5;
    }
    setTemperature(temperature){
        this.temperature=temperature;
    }
    computeShift(){
        const overallForce=this.cube.nodeAttributes['force'];
        const force=new Map();
        let sumPosition=[0,0];
        for(const [dyNode,mirrors] of this.cube.nodeMirrorMap ){
            //the implement is different from java
            let allBends=[];
            for(const mirrorLine of mirrors){
                
                allBends.push(...mirrorLine.nodeList);
               
                
            }
            this.computeSmoothingComponent(force,allBends);
            this.computeStraightningComponent(force, allBends);
           
        }
        console.log('timestr');
        
        for(const[id,value] of overallForce.entries()){
            if(force.has(id)){
                console.log(force.get(id));
                
                overallForce.set(id,value.map((v,index)=>v+force.get(id)[index]))
            }
        }

        
    }
    computeSmoothingComponent(force,allBends){
        const pos=this.cube.nodeAttributes['nodePosition'];
        for(let i=0;i<allBends.length;i++ ){
            const node=allBends[i];
            let desired=[];
            if(!force.has(node)){
                force.set(node,[0,0,0])
            }
            if (i == 0 || i == allBends.length - 1) {
                const other = i != 0 ? allBends[i-1] : allBends[1];
                // console.log('other')
                
                const posOther = pos.get(other);
                // console.log(posOther)
                desired=avgVectors(pos.get(node),posOther);
                desired[2]=pos.get(node)[2];
                desired=desired.map((value,index) => (value-pos.get(node)[index]));
                // console.log(desired)
                // console.log(pos.get(node))
            }
            else{
                const posCurrent=pos.get(node);
                const nodeBefore = allBends[i - 1];
                const nodeAfter = allBends[i + 1];
                const posBefore = pos.get(nodeBefore);
                const posAfter = pos.get(nodeAfter);
                const centroid=posCurrent.map((value,index) => (value+posAfter[index]+posBefore[index])/3);
                desired=centroid.map((value,index)=>value-posCurrent[index]);
                
            }
            const vectorMag=magnitude(desired);
            
            
            //when vectormag equals to 0, means the trajectory is perpendicular with time
            if(vectorMag>0.00001){
                const unit=getUnitVector(desired);
                const shift=unit.map((value,index) => Math.pow(vectorMag/this.desired,2)*value);
                force.set(node,shift);
                // console.log('checksame');
                // console.log(shift);
                
                
            }
        }
    }
    computeStraightningComponent(force, allBends){
        const pos=this.cube.nodeAttributes['nodePosition'];
        for(let i=0;i<allBends.length-1;i++ ){
            for(let j=i+1;j<allBends.length;j++ ){
                
                const source=allBends[i];
                const target=allBends[j];
                if(!force.has(source)){
                    force.set(source,[0,0,0])
                }
                if(!force.has(target)){
                    force.set(target,[0,0,0])
                }
                const posSource=pos.get(source);
                const posTarget=pos.get(target);
                const vector3D=posTarget.map((value,index) =>value-posSource[index])
                const vector2D=[vector3D[0],vector3D[1],0];

                //need implement the filter when the vector3D is almost zero
                if(magnitude(vector2D)==0 || vector3D[2]==0){
                    continue
                }
                
                const angle=Math.max(betweenAngle(vector2D,vector3D).radians,0.01);
                const shift=vector2D.map((value,index)=>value*(Math.PI/2-angle)/angle);
                force.set(source,force.get(source).map((value,index)=>value+shift[index]));
                force.set(target,force.get(target).map((value,index)=>value-shift[index]));
            }
        }
    }
}