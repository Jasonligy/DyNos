import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
import {Gravity} from "./force/gravity.js";
import {EdgeAttraction} from "./force/edgeAttraction.js";
import {TimeStraightning} from "./force/timeStraightning.js";
import{DecreasingMaxMovement,MovementAcceleration} from "./constriant/constriant.js"
import { EnsureTimeCorrectness } from "./preMovement/preMovement.js";

export class DynosRunner{
    constructor(dyGraph,number,delta=5){

        this.dygraph=dyGraph
        this.delta=delta
        // console.log(dyGraph)
        this.cube=new TimeSpaceCube(dyGraph,2.122449);
        this.iteration=number;
        this.forceList=[];
        this.getForceList();
        this.getConstriantList();
        this.temperature=1;
        this.initialMaxMovement;
        this.maxMovement;
        //desired distance
        this.desired=this.delta;
        this.expandDistance=2*this.delta;
        this.contractDistance=1.5*this.delta;
        this.safeMovementFactor=0.9;
        this.preMovementList=[new EnsureTimeCorrectness(this.cube,this.safeMovementFactor)];
    }
    getConstriantList(){
        const decreasingMaxMovement=new DecreasingMaxMovement(this.cube,this.initialMaxMovement);
        const movementAcceleration=new MovementAcceleration(this.cube,this.maxMovement);
        this.constraintList=[decreasingMaxMovement];
        // this.constraintList=[decreasingMaxMovement,movementAcceleration];
    }
    getForceList(){
        const gravity=new Gravity(this.cube);
        const timeStraightning = new TimeStraightning(this.cube,this.desired);
        const edgeAttraction=new EdgeAttraction(this.cube,this.desired,this.temperature);
        // this.forceList=[gravity,timeStraightning,edgeAttraction];
        this.forceList=[gravity];
    }
    iterate(){
        for(let i=0;i<100;i++){
            console.log(i)
            this.cube.updateForceMovement();
            this.forceList.forEach((force)=>force.computeShift());
            // this.constraintList.forEach((constraint)=>constraint.computeConstraint());//need change
            this.computeConstriant();
            this.cube.computeMovement();
            this.preMovementList.forEach((preMove)=>preMove.execute());
            this.cube.updateCube();
            this.cube.postProcessing();
            this.cube.getMirrorNode();
            this.temperature=(this.iteration-i)/this.iteration;
            this.forceList.forEach((force)=>force.setTemperature(this.temperature));
            if(i==1){
                console.log('movestart');
                for(const[id,value]of this.cube.nodeAttributes['movement'].entries()){
                    console.log(value)
                }
                console.log('movestart');
            }

        }
        return this.cube
    }
    computeConstriant(){
        let limit=Infinity;
        const mirrorConstriant=this.cube.nodeAttributes['constriant'];
        for(const constriant of this.constraintList){
            const valueObj=constriant.computeConstriant();
            limit=Math.min(limit,valueObj.defaultValue);
            for(const node of this.cube.nodes){
                let nodeMovement=Math.min(mirrorConstriant.get(node),limit);
                nodeMovement=Math.min(nodeMovement,valueObj.nodeConstriant.get(node));
                mirrorConstriant.set(node,nodeMovement);
            }
        }
    }
}