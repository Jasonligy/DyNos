import {betweenAngle, getUnitVector, magnitude} from "../utils/vectorOps.js"
export class DecreasingMaxMovement{
    constructor(cube,initialMaxMovement){
        this.cube=cube;
        this.initialMaxMovement=initialMaxMovement;
        this.temperature=1;
    }
    setTemperature(temperature){
        this.temperature=temperature;
       
    }
    computeConstriant(){
       return {defaultValue:this.temperature*this.initialMaxMovement,nodeConstriant:new Map()}
    }
   
}

export class MovementAcceleration{
    constructor(cube,maxMovement){

        this.cube=cube;
        this.maxMovement=maxMovement;
        this.previousMovements=new Map();
        this.constriant=new Map();
    }
    setTemperature(temperature){
        this.temperature=temperature;
    }
    computeConstriant(){
        this.constriant.clear();
        const force=this.cube.nodeAttributes['force'];
      
        for(const node of this.cube.nodes){
            const currentForce=force.get(node);
            const z=currentForce[2];
            currentForce[2]=0;
            if(magnitude(currentForce)<0.0001){
                this.previousMovements.delete(node)
            }
            currentForce[2]=z;
            let currentLimit;
            if(!this.previousMovements.has(node)){
                currentLimit=this.maxMovement/5;

            }
            else{
                // console.log('try')
                const previousMovement=this.previousMovements.get(node);
                
                
                
                const angleDiff=betweenAngle(currentForce,previousMovement);
                const previousMagnitude=magnitude(previousMovement);
                if(angleDiff.radians<Math.PI/3){
                    // console.log('pi3')
                    currentLimit=Math.min(previousMagnitude * (1 + 2 * (1 - angleDiff.radians / (Math.PI / 3))),this.maxMovement);
                    // console.log(currentLimit)
                }
                else if(angleDiff.radians<Math.PI/2){
                    // console.log('pi2')
                    currentLimit=previousMagnitude;
                    // console.log(currentLimit)
                }
                else{
                    // console.log('pio');
                    currentLimit=previousMagnitude / (1 + 4 * (angleDiff.radians / (Math.PI / 2) - 1));
                    
                    // console.log(currentLimit);
                }

            }
            this.constriant.set(node,currentLimit);
            this.previousMovements.set(node,getUnitVector(currentForce).map((value,index)=>currentLimit*value))
        }
        // console.log(this.constriant);
        return{defaultValue:Infinity,nodeConstriant:this.constriant};
    }
   
}