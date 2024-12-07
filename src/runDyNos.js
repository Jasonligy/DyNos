import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
import {Gravity} from "./force/gravity.js";
import {EdgeAttraction} from "./force/edgeAttraction.js";
import {TimeStraightning} from "./force/timeStraightning.js";
import{DecreasingMaxMovement,MovementAcceleration} from "./constriant/constriant.js"
import { EnsureTimeCorrectness } from "./preMovement/preMovement.js";

export class DynosRunner{
    constructor(dyGraph,number,desired){

        this.dygraph=dyGraph
        this.delta=5.0
        // console.log(dyGraph)
        this.cube=new TimeSpaceCube(dyGraph,10);
        this.iteration=number;
        this.forceList=[];
        this.getForceList();
        this.temperature=1;
        this.initialMaxMovement;
        this.maxMovement;
        //desired distance
        this.desired=desired;
        this.expandDistance;
        this.contractDistance;
        this.preMovementList=[new EnsureTimeCorrectness(this.cube,this.safeMovementFactor)];
    }
    getConstraintList(){
        const decreasingMaxMovement=new DecreasingMaxMovement(this.cube,this.initialMaxMovement);
        const movementAcceleration=new MovementAcceleration(this.cube,this.maxMovement);
        this.constraintList=[decreasingMaxMovement,movementAcceleration];
    }
    getForceList(){
        const gravity=new Gravity(this.cube);
        const timeStraightning = new TimeStraightning(this.cube,this.desired);
        const edgeAttraction=new EdgeAttraction(this.cube,this.desired,this.temperature);
        // this.forceList=[gravity,timeStraightning,edgeAttraction];
        this.forceList=[edgeAttraction];
    }
    iterate(){
        for(let i=0;i<1;i++){
            // console.log(i)
            this.cube.updateForceMovement();
            this.forceList.forEach((force)=>force.computeShift());
            // this.constraintList.forEach((constraint)=>constraint.computeConstraint());//need change
            this.computeConstriant()
            this.preMovementList.forEach((preMove)=>preMove.execute());
            this.cube.updateCube();
            this.cube.postProcessing();
            this.cube.getMirrorNode();
            this.temperature=(this.iteration-i)/this.iteration;
            this.forceList.forEach((force)=>force.setTemperature(this.temperature));

        }
        return this.cube
    }
    computeConstriant(){
        let limit=Infinity;
        const constriant=this.cube.nodeAttributes['constriant'];
        for(constriant of this.constraintList){
            valueObj=constriant.computeConstriant();
            limit=Math.min(limit,valueObj.defaultValue);
            for(const node of this.cube.nodes){
                let nodeMovement=Math.min(constriant.get(node),limit);
                nodeMovement=Math.min(nodeMovement,valueObj.nodeConstriant.get(node));
                constriant.set(node,nodeMovement);
            }
        }
    }
}