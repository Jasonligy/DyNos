import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
import {Gravity} from "./force/gravity.js";
import {EdgeAttraction} from "./force/edgeAttraction.js";
import { EdgeRepulsion } from "./force/edgeRepulsion.js";
import {TimeStraightning} from "./force/timeStraightning.js";
import{DecreasingMaxMovement,MovementAcceleration} from "./constriant/constriant.js"
import { EnsureTimeCorrectness } from "./preMovement/preMovement.js";

export class DynosRunner{
    constructor(dyGraph,number,delta=1){

        this.dygraph=dyGraph
        this.delta=delta
        // this.tau=2.122448979591837;
        this.tau=1.0833333333333335;
        // console.log(dyGraph)
        // this.cube=new TimeSpaceCube(dyGraph,2.122448979591837);
        // this.cube=new TimeSpaceCube(dyGraph,0.875);
        this.cube=new TimeSpaceCube(dyGraph,this.tau);
        this.iteration=number;
        this.forceList=[];
        this.desired=this.delta;
        this.getForceList();
        
        this.temperature=1;
        this.initialMaxMovement=10;
        this.maxMovement=2*this.delta;
        this.getConstriantList();
        //desired distance
        
        this.expandDistance=2*this.delta;
        this.contractDistance=1.5*this.delta;
        this.safeMovementFactor=0.9;
        this.preMovementList=[new EnsureTimeCorrectness(this.cube,this.safeMovementFactor)];
        // this.preMovementList=[];
    }
    getConstriantList(){
        const decreasingMaxMovement=new DecreasingMaxMovement(this.cube,this.maxMovement);
        const movementAcceleration=new MovementAcceleration(this.cube,this.maxMovement);
        this.constraintList=[];
        this.constraintList=[decreasingMaxMovement,movementAcceleration];
    }
    getForceList(){
        const gravity=new Gravity(this.cube);
        const timeStraightning = new TimeStraightning(this.cube,this.desired);
        const edgeAttraction=new EdgeAttraction(this.cube,this.desired,this.temperature,this.tau);
        const edgeRepulsion=new EdgeRepulsion(this.cube,this.desired,this.temperature);
        this.forceList=[gravity,edgeAttraction,edgeRepulsion,];
        // this.forceList=[gravity,edgeAttraction,edgeRepulsion,timeStraightning];
        // this.forceList=[edgeRepulsion];
    }
    iterate(){
        console.log('begin');
        for(const [id,value]of this.dygraph.nodes){
            console.log(this.dygraph.nodeAttributes['nodePosition'].get(value));
        }
        for(const[id,value]of this.cube.nodeAttributes['nodePosition'].entries()){
            console.log(value)
            
        }
        const numberofiteration=50;
        for(let i=0;i<numberofiteration;i++){
            console.log(i);
            
            
            // console.log('epoch'+i)
            // this.temperature=(this.iteration-i)/this.iteration;
            this.forceList.forEach((force)=>force.setTemperature(this.temperature));
            this.constraintList.forEach((constraint)=>constraint.setTemperature(this.temperature));
        
            this.cube.updateForceMovement();
            this.forceList.forEach((force)=>force.computeShift());
            // console.log('force!');
            
            // for(const[id,value]of this.cube.nodeAttributes['force'].entries()){
            //     console.log(value)
                
            // }
            // this.constraintList.forEach((constraint)=>constraint.computeConstraint());//need change
            // if(i==0){
            //     console.log('movestart');
            //     // for(const[id,value]of this.cube.nodeAttributes['movement'].entries()){
            //     for(const[id,value]of this.cube.nodeAttributes['force'].entries()){
            //         console.log(value)
                    
            //     }
            //     console.log('moveend');
            //     // console.log(c);
                
            // }

            this.computeConstriant();
            this.cube.computeMovement();
            this.preMovementList.forEach((preMove)=>preMove.execute());

            this.cube.updateCube();
            this.cube.postProcessing();
            this.cube.getMirrorNode2();
               let c=0;
            if(i==99){
                console.log('movestart');
                // for(const[id,value]of this.cube.nodeAttributes['movement'].entries()){
                // for(const[id,value]of this.cube.nodeAttributes['constriant'].entries()){
                // for(const[id,value]of this.cube.nodeAttributes['force'].entries()){
                
                // console.log('moveend');
                // console.log(c);
                
            }
            this.temperature=(numberofiteration-i-1)/numberofiteration;
            // console.log('after');
            
            // for(const[id,value]of this.cube.nodeAttributes['nodePosition'].entries()){
            //     console.log(value)
                
            // }
        }
        console.log('end');
        for(const[id,value]of this.cube.nodeAttributes['nodePosition'].entries()){
            console.log(value)
            
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
                if(valueObj.nodeConstriant.has(node)){
                    nodeMovement=Math.min(nodeMovement,valueObj.nodeConstriant.get(node));
                }
                mirrorConstriant.set(node,nodeMovement);
                // mirrorConstriant.set(node,Infinity);
            }
        }
    }
}