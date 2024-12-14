import{Node,Edge}from "../dygraph/Dygraph.js"
import { avgVectors, distance2points, magnitude } from "../utils/vectorOps.js";
export class MirrorLine{
    constructor(dynode,appearInterval){
        this.dynode = dynode;
        // this.startNode=[];
        // this.
        this.interval=appearInterval;
        //the bends of coordinate in the trajectory
        this.coordinateList=[];
        this.mirrorNodeList=[];
        //all the node in that trajectory, need implement the correspond to coordinatelist
        //nodeLIst correspond to the coordinateList, the 
        this.nodeList=[];
        this.segmentList=[];
        this.current2Prev=new Map();
        
    }
    addBend(coordinat){
        this.coordinateList.push(coordinat);
        
        
    }
    contractBend(contractDistance){
        if(this.coordinateList.length<3){
            return
        }
        const newCoordinateList=[];
        newCoordinateList.push(this.coordinateList[0]);
        for(let i=1;i<this.coordinateList.length-1;i++){
            const first=this.coordinateList[newCoordinateList.length-1];
            const second=this.coordinateList[i];
            const third=this.coordinateList[i+1];
            const distance12=distance2points(first,second);
            const distance13=distance2points(first,third);
            const distance23=distance2points(second,third);
            if(distance13<contractDistance||distance23<contractDistance/5||distance12<contractDistance/5){
                // this.nodeList.slice(i,1);
                const firstSegment=this.segmentList[i-1];
                firstSegment.target=this.nodeList[i+1];
                this.segmentList.splice(i,1);
                this.nodeList.slice(i,1);
                continue
            }
            else{
                newCoordinateList.push(this.coordinateList[i])
            }
        }
        newCoordinateList.push(this.coordinateList[this.coordinateList.length-1])
        this.coordinateList=newCoordinateList;
        if(this.segmentList.length!=this.nodeList.length-1){
            throw new Error('segment length is not equal to node list minus 1');
        }
        if(this.coordinateList.length!=this.nodeList.length){
            throw new Error('coordinate list length is not equal to node list ');
        }

    }
    expandBend(expandDistance){
        const newCoordinateList=[];
        newCoordinateList.push(this.coordinateList[0]);
        // console.log('l');
        // console.log(this.coordinateList.length);
        // console.log(this.nodeList.length);
        for(let i=0;i<this.coordinateList.length-1;i++){
            const firstCoord=this.coordinateList[i];
            const secondCoord=this.coordinateList[i+1];  
            // console.log(i)  ;
            // console.log()
            // console.log(secondCoord)
            const dist=distance2points(firstCoord,secondCoord);
            // expandDistance=0.1
            if(dist>expandDistance&&Math.abs(firstCoord[2]-secondCoord[2])>expandDistance/2){

                // console.log('expand')
                let node=new Node();
                this.nodeList.splice(i+1,0,node) ;

                const edge0=this.segmentList[i];
                const targetNode=edge0.targetNode;
                edge0.targetNode=node;   
                const edge1=new Edge(node,targetNode);
                this.segmentList.splice(i+1,0,edge1) ;
                newCoordinateList.push(avgVectors(firstCoord,secondCoord));
            }
            newCoordinateList.push(secondCoord);
        }
        this.coordinateList=newCoordinateList
        if(this.segmentList.length!=this.nodeList.length-1){
            throw new Error('segment length is not equal to node list minus 1');
        }
        if(this.coordinateList.length!=this.nodeList.length){
            throw new Error('coordinate list length is not equal to node list ');
        }
    }
    // updateCoordinate(){
    //     for(const )
    // }
}
//mirrorConnection only made a reference to the end points and its interval
export class MirrorConnection{
    constructor(edge,appearInterval){
        this.edge = edge;
        this.interval=appearInterval;
    }
    addSource(node){
        this.source=node;
    }
    addTarget(node){
        this.target=node
    }
}
export class TimeSpaceCube{
    constructor(dyGraph,tau){
        this.delta=5;
        this.nodes=new Set();
        this.edges=new Set();
        this.nodeAttributes = new Object();
        this.edgeAttributes = new Object();
        this.addDefaultNodeAttributes();
        this.addDefaultEdgeAttributes();
        this.tau=tau
        this.dyGraph=dyGraph;
        this.nodeMirrorMap=new Map();
        this.edgeMirrorMap=new Map();
        const nodes=dyGraph.nodes;
        const edges=dyGraph.edges;
        //create the mirrorline and update the coordinate list as the bend positions
        this.addMirrorLine(nodes);
        // for(const[id,node] of this.){
        //     console.log(dyGraph.nodeAttributes['nodePosition'].get(node))
        //     break
        // }
        this.addMirrorConnection(edges);
        //create mirrornode inside mirrorline and update the node list from coordinate list
        this.getMirrorNode()
        this.expandDistance=2.0*this.delta;
        this.contractDistance=1.5*this.delta;
        this.safetyMovementFactor=0.9
        // const edges=dyGraph.edges;


    }
    addDefaultNodeAttributes(){
        this.nodeAttributes['appearance']=new Map();
        this.nodeAttributes['label']=new Map();
        this.nodeAttributes['nodePosition']=new Map();
        this.nodeAttributes['color']=new Map();
        this.nodeAttributes['force']=new Map();
        this.nodeAttributes['movement']=new Map();
        this.nodeAttributes['constriant']=new Map();
    }
    addDefaultEdgeAttributes(){
        this.edgeAttributes['appearance']=new Map();
        this.edgeAttributes['color']=new Map();
        this.edgeAttributes['strength']=new Map();
        
    }
    computeMovement(){
        const pos=this.nodeAttributes['nodePosition'];
        for(const node of this.nodes){
            const force=this.nodeAttributes['force'].get(node);
            const nodeMovement=this.nodeAttributes['movement'].get(node);
            const constriant=this.nodeAttributes['constriant'].get(node)*this.safetyMovementFactor;
            const mag=magnitude(force);
          
            if(!mag<0.001&&!constriant<0.001){
                let movement=[...force];
                if(mag>constriant){
                    movement=movement.map((value,index)=>value*constriant/mag);

                }
                
                this.nodeAttributes['movement'].set(node,movement);
            }
            // console.log(typeof force)
            // pos.set(node,move.map((value,index)=>value+pos.get(node)[index]));
            // console.log(pos.get(node))
        }


    }
    updateCube(){
        const pos=this.nodeAttributes['nodePosition'];
        const move=this.nodeAttributes['movement'];
        for(const node of this.nodes){
            
            
            pos.set(node,move.get(node).map((value,index)=>value+pos.get(node)[index]));
            
        }
        for(const [id,lines] of this.nodeMirrorMap.entries()){
            let prev=null;
            // console.log(lines)

            for(const line of lines){
                for(let i=0;i<line.coordinateList.length;i++){
                    const node=line.nodeList[i];

                   const nodePos=pos.get(node);
                   line.coordinateList[i]=nodePos;
                }
                
         }
        }

    }
    addMirrorLine(nodes){
        // console.log('begin count');
        for(const [id,node] of nodes.entries()){
            // appears is a list, ststing the appeared slots for the node
            const appears=this.dyGraph.nodeAttributes['appearance'].get(node)
            const intervals=this.dyGraph.nodeAttributes['nodePosition'].get(node);
            // console.log(appears.getAllIntervals(appears.root))
            for(const appearSlot of appears.getAllIntervals(appears.root)){
                let line=new MirrorLine(node,appearSlot);
                //biuld trajectory using mirrorLine, creating bends in the mirrorlines
                // for(const interval of intervals.getAllIntervals(intervals.root)){
                //     console.log('checkall')
                //     // need to check if the right bound of upper level is equal to the left bound of next level.
                //     // convert the time to space, assuming the node position is continous and the appearslot value is equal to the interval bound values
                    
                //     if(appearSlot[0]==interval.start){
                //         line.addBend(interval.valueStart.concat(interval.start*this.tau));
                //     }
                //     if(appearSlot[1]==interval.end){
                //         line.addBend(interval.valueEnd.concat(interval.end*this.tau));
                //         break;
                //     }
                //     if(appearSlot[1]>interval.end){
                //         line.addBend(interval.valueEnd.concat(interval.end*this.tau));
                //     }


                //     // if(appearSlot[0]==interval.leftBound){
                //     //     line.addBend(interval.leftValue.concat(interval.leftBound*this.tau));
                //     // }
                //     // if(appearSlot[1]==interval.rightBound){
                //     //     line.addBend(interval.rightValue.concat(interval.rightBound*this.tau));
                //     //     break;
                //     // }
                //     // if(appearSlot[1]>interval.rightBound){
                //     //     line.addBend(interval.rightValue.concat(interval.rightBound*this.tau));
                //     // }

                // }


                const startPos=intervals.valueAt(appearSlot.start);
                // console.log('cyc;e')
                // console.log(appearSlot.start)
                // console.log(startPos)
                // console.log(startPos.concat(appearSlot.start*this.tau))
                line.addBend(startPos.concat(appearSlot.start*this.tau));
                // console.log(line.coordinateList)
                for(const interval of intervals.getAllIntervals(intervals.root)){
                    if(appearSlot.start<interval.end && appearSlot.end>interval.end){
                        const bendPos=interval.valueEnd;
                        line.addBend(bendPos.concat(interval.valueEnd*this.tau));
                    }
                }

                const endPos=intervals.valueAt(appearSlot.end);
                line.addBend(endPos.concat(appearSlot.end*this.tau));
                // console.log('check add node')
                if(!this.nodeMirrorMap.has(node)){
                    this.nodeMirrorMap.set(node, [line]);}
                else{
                    this.nodeMirrorMap.get(node).push(line);
                }
            }

        }
        console.log('finish count');

    }
    updateForceMovement(){
        this.nodeAttributes['force'].clear();
        this.nodeAttributes['movement'].clear();
        this.nodeAttributes['constriant'].clear();
        for(const node of this.nodes){
            this.nodeAttributes['force'].set(node,[0,0,0]);
            this.nodeAttributes['movement'].set(node,[0,0,0]);
            this.nodeAttributes['constriant'].set(node,Infinity);
        }
 
    }
    getMirrorNode(){
        this.nodes.clear();
        this.edges.clear();
        this.nodeAttributes['nodePosition'].clear();
        for(const [id,lines] of this.nodeMirrorMap.entries()){
            let prev=null;
            // console.log(lines)

            for(const line of lines){
                line.nodeList=[];
                line.segmentList=[]
                // console.log(line)
                for(let coordinate of line.coordinateList){
                    let node=new Node();
                    this.nodes.add(node);
                    this.nodeAttributes['nodePosition'].set(node,coordinate);
                    line.nodeList.push(node);
                    if(prev==null){
                        prev=node;
                    }
                    else{
                        const edge=new Edge(prev,node);
                        this.edges.add(edge);
                        line.segmentList.push(edge);
                        prev=node;
                    }
                    // console.log(this.nodeAttributes['nodePosition'].get(node))
                }
                
         }
        }
    }
    getMirrorNode2(){
        this.nodes.clear();
        this.edges.clear();
        this.nodeAttributes['nodePosition'].clear();
        for(const [id,lines] of this.nodeMirrorMap.entries()){
            let prev=null;
            // console.log(lines)

            for(const line of lines){
                for(let i=0;i<line.coordinateList.length;i++){
                    const node=line.nodeList[i];

                    this.nodes.add(node);
                    this.nodeAttributes['nodePosition'].set(node,line.coordinateList[i]);
                    if(i!=line.coordinateList.length-1){
                        const edge=line.segmentList[i];
                        this.edges.add(edge);
                    }
                }
                
         }
        }
    }
    
    updateCoordinateList(mirrorLine){
        if(mirrorLine.nodeList.length!=mirrorLine.coordinateList.length){
            throw new Error(" the node size of nodeList and coordinateList is not same")
        }
        const pos=this.nodeAttributes['nodePosition']
        for(const i=0;i<mirrorLine.nodeList.length;i++){
            const newCoordinate=pos.get(mirrorLine.nodeList[i]);
            mirrorLine.coordinateList[i]=newCoordinate
        }
    }

    addMirrorConnection(edges){
        //here edges is a list
        // console.log(edges)
        let countConnection=0;
        for(const edge of edges){
            // appears is a list, ststing the appeared slots for the node
            const appears=this.dyGraph.edgeAttributes['appearance'].get(edge)
            // console.log(appears)
            countConnection+= appears.getAllIntervalsWithoutValue(appears.root).length
            // console.log(appears.getAllIntervals(appears.root))
            // console.log(appears.getAllIntervalsWithoutValue(appears.root))
            // console.log('check')
            // const intervals=this.dyGraph.nodeAttributea['nodePosition'].get(node);
            for(const appearSlot of appears.getAllIntervalsWithoutValue(appears.root)){
                const connection = new MirrorConnection(edge,appearSlot);
                //need cautious and update later, now it is pasuodocode
                const source=edge.sourceNode;
                const target=edge.targetNode;
                const middlePoint=(appearSlot.start+appearSlot.end)/2;

                const sourceLines=this.nodeMirrorMap.get(source);
                // console.log(sourceLines.length)
                // console.log(appearSlot)
                for(const sourceLine of sourceLines){
                    // console.log('checks')
                    if(sourceLine.interval.start<=middlePoint&&sourceLine.interval.end>=middlePoint){
                        
                        connection.addSource(sourceLine);
                        break;
                    }
                }
                const targetLines=this.nodeMirrorMap.get(target);
                for(const targetLine of targetLines){
                    
                    if(targetLine.interval.start<=middlePoint&&targetLine.interval.end>=middlePoint){
                        
                        connection.addTarget(targetLine);
                        break;
                    }
                }
                
               
                this.edgeMirrorMap.set(edge,connection);

            }

        }
        console.log('countconnection');
        console.log(countConnection)
        
    }
    postProcessing(){
        for(const [id,trajectories] of this.nodeMirrorMap.entries()){
            //if(temperature() > shutDownTemperature)
            //if (refreshCounter % refreshInterval == 0 ) 
            for(const trajectory of trajectories){
                trajectory.expandBend(this.expandDistance);
            }
        }
        for(const [id,trajectories] of this.nodeMirrorMap.entries()){
            //if(temperature() > shutDownTemperature)
            //if (refreshCounter % refreshInterval == 0 ) 
            for(const trajectory of trajectories){
                trajectory.contractBend(this.contractDistance);
            }
        }         
    }

    outputMatrix(){
        let lines=[];
        let mirrorIndex=[];
        let getH=[]
        // for(const [id,nodeLines] of this.nodeMirrorMap.entries()){
        //     for(const nodeline of nodeLines){
        //         let coordinateList=nodeline.coordinateList;
        //         const index=coordinateList.length;
        //         mirrorIndex.push(index);
        //         // console.log('co')
        //         // console.log(coordinateList)
        //         lines.push(...coordinateList)
        //     }
        // }
        for(const [id,nodeLines] of this.nodeMirrorMap.entries()){
            for(const nodeline of nodeLines){
                let coordinateList=nodeline.coordinateList;
                const index=coordinateList.length;
                mirrorIndex.push(index);
                // console.log('co')
                // console.log(coordinateList)
                lines.push(...this.convertCoordinate(coordinateList))
            }
        }
        console.log('lines');
        console.log(lines.length);
        
        console.log(lines);
        
        return [lines,mirrorIndex];
    }
    //coordinates is a 2D array from the mirror, store the 3D coordinates of each node
    //may adjust the coordinate in the future
    convertCoordinate(coordinates){
        let convertedCoordinates=[]
        for(let coordinate of coordinates){
            const convertedCoordinate=this.fmap3DCoordinates(coordinate,[0,0,-2.122449],[40,40,13.8]);
            
            convertedCoordinates.push(...convertedCoordinate);
        }
        // console.log(convertedCoordinates)
        return convertedCoordinates;
    }
    fmap3DCoordinates(coord,  minVals, maxVals) {
        const [x, y, z] = coord;
    
        // Normalize each axis to 0-1 range
        const normalizedX = (x - minVals[0]) / (maxVals[0] - minVals[0]);
        const normalizedY = (y - minVals[1]) / (maxVals[1] - minVals[1]);
        const normalizedZ = (z - minVals[2]) / (maxVals[2] - minVals[2]);
    
        // Map to the target ranges
        const mappedX = normalizedX * 2 -1;
        const mappedY = normalizedY * 2 -1;
        const mappedZ = normalizedZ * 3 -1;
    
        return [mappedX, mappedZ,mappedY ];
    }
    

}