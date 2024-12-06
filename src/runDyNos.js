import {TimeSpaceCube} from "./cube/TimeSpaceCube.js";
import {Gravity} from "./force/gravity.js";
import {EdgeAttraction} from "./force/edgeAttraction.js";
import {TimeStraightning} from "./force/timeStraightning.js";
export class DynosRunner{
    constructor(dyGraph,number,desired){

        this.dygraph=dyGraph
        // console.log(dyGraph)
        this.cube=new TimeSpaceCube(dyGraph,10);
        this.iteration=number;
        this.forceList=[];
        this.getForceList();
        this.temperature=1;

        //desired distance
        this.desired=desired;
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
            this.cube.updateForce();
            this.forceList.forEach((force)=>force.computeShift());
            this.cube.updateCube();
            this.temperature=(this.iteration-i)/this.iteration;
            this.forceList.forEach((force)=>force.setTemperature(this.temperature));

        }
        return this.cube
    }
}