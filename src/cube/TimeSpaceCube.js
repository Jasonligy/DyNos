import{DyGraph,Node,Edge}from "../dygraph/Dygraph.js"
import { avgVectors, distance2points, magnitude,checkTriVectors } from "../utils/vectorOps.js";
import {Interval,IntervalTree}from "../intervalTree/intervalTree.js"
// import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
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
        // console.log(this.segmentList.length);
        // console.log(this.nodeList.length);
        let contractCount=0;
        for(let i=1;i<this.coordinateList.length-1;i++){
            const first=this.coordinateList[newCoordinateList.length-1];
            const second=this.coordinateList[i];
            const third=this.coordinateList[i+1];
            const distance12=distance2points(first,second);
            const distance13=distance2points(first,third);
            const distance23=distance2points(second,third);
            if(distance13<contractDistance||distance23<contractDistance/5||distance12<contractDistance/5){
                // this.nodeList.slice(i,1);
                const firstSegment=this.segmentList[i-contractCount-1];
                firstSegment.targetNode=this.nodeList[i-contractCount+1];
                this.segmentList.splice(i-contractCount,1);
                this.nodeList.splice(i-contractCount,1);
                contractCount++;
                continue
            }
            else{
                newCoordinateList.push(this.coordinateList[i])
            }
        }
        newCoordinateList.push(this.coordinateList[this.coordinateList.length-1])
        this.coordinateList=newCoordinateList;
        
        
        
        
        if(this.segmentList.length!=this.nodeList.length-1){
            console.log(this.segmentList.length);
        // console.log(this.nodeList.length);
            throw new Error('segment length is not equal to node list minus 1');
        }
        if(this.coordinateList.length!=this.nodeList.length){
            throw new Error('coordinate list length is not equal to node list ');
        }

    }
    expandBend(expandDistance){
        const newCoordinateList=[];
        newCoordinateList.push(this.coordinateList[0]);
        // console.log(this.segmentList.length);
        // console.log(this.nodeList.length);
        // console.log('l');
        // console.log(this.coordinateList.length);
        // console.log(this.nodeList.length);
        let expandCount=0;
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
                this.nodeList.splice(i+expandCount+1,0,node) ;

                const edge0=this.segmentList[i+expandCount];
                const targetNode=edge0.targetNode;
                edge0.targetNode=node;   
                const edge1=new Edge(node,targetNode);
                this.segmentList.splice(i+expandCount+1,0,edge1) ;
                const mid=avgVectors(firstCoord,secondCoord);
                newCoordinateList.push(avgVectors(firstCoord,secondCoord));
                checkTriVectors(mid,firstCoord,secondCoord)
                expandCount++;
            }
            newCoordinateList.push(secondCoord);
        }

        this.coordinateList=newCoordinateList
    //    console.log('coordinate list len');
    //     console.log(this.coordinateList.length);
        
        
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
        this.node2mirrorLine=new Map();
        this.edges2mirrorLine=new Map();
        this.mirrorLine2DyNode=new Map();
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
        this.expandDistance=2*this.delta;
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
        // const move=this.nodeAttributes['force'];
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
                if(line.coordinateList.length==3){
                    // if(checkTriVectors(line.coordinateList[0],line.coordinateList[1],line.coordinateList[2])){
                    //     console.log('firstnotsame');
                        
                    // }
                    // console.log(checkTriVectors(line.coordinateList[1],line.coordinateList[0],line.coordinateList[2]));
                    //  checkTriVectors(line.coordinateList[0],line.coordinateList[1],line.coordinateList[2])
                }

                
         }
        }

    }
    addMirrorLine(nodes){
        // console.log('begin count');
        for(const [id,node] of nodes.entries()){
            // appears is a list, ststing the appeared slots for the node
            let appears=this.dyGraph.nodeAttributes['appearance'].get(node)
            const intervals=this.dyGraph.nodeAttributes['nodePosition'].get(node);
            // console.log(appears.getAllIntervals(appears.root))
            // console.log('app');
            
            // console.log(appears);
            // if(typeof appears =="undefined"){
            //     appears=intervals;
            // }
            // console.log(id);
            
            // console.log(intervals);
            
            for(const appearSlot of appears.getAllIntervalsWithoutValue(appears.root)){
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
                        // console.log('checknan');
                        // console.log(interval);
                        line.addBend(bendPos.concat(interval.end*this.tau));
                    }
                }

                const endPos=intervals.valueAt(appearSlot.end);
                
                
                
                line.addBend(endPos.concat(appearSlot.end*this.tau));
                this.mirrorLine2DyNode.set(line,node);
                // console.log('check add node')
                if(!this.nodeMirrorMap.has(node)){
                    this.nodeMirrorMap.set(node, [line]);}
                else{
                    this.nodeMirrorMap.get(node).push(line);
                }
            }

        }
        // console.log('finish count');

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
            
            // console.log(lines)

            for(const line of lines){
                let prev=null;
                line.nodeList=[];
                line.segmentList=[]
                // console.log(line)
                for(let coordinate of line.coordinateList){
                    let node=new Node();
                    this.nodes.add(node);
                    this.node2mirrorLine.set(node,line);
                    this.nodeAttributes['nodePosition'].set(node,coordinate);
                    line.nodeList.push(node);
                    if(prev==null){
                        prev=node;
                    }
                    else{
                    
                        const edge=new Edge(prev,node);
                        this.edges2mirrorLine.set(edge,line);
                        this.edges.add(edge);
                        line.segmentList.push(edge);
                        prev=node;
                    }
                    // console.log(this.nodeAttributes['nodePosition'].get(node))
                }
                if(line.segmentList.length!=line.nodeList.length-1){
                    throw new Error('segment length is not equal to node list minus 1');
                }
                // else{
                //     console.log('pass');
                    
                // }
                
         }
        }
    }
    getMirrorNode2(){
        this.nodes.clear();
        this.edges.clear();
        this.nodeAttributes['nodePosition'].clear();
        this.node2mirrorLine.clear();
        this.edges2mirrorLine.clear();
        for(const [id,lines] of this.nodeMirrorMap.entries()){
            let prev=null;
            // console.log(lines)

            for(const line of lines){
                // console.log('update node');
                // console.log(line.coordinateList.length);
                
                for(let i=0;i<line.coordinateList.length;i++){
                    const node=line.nodeList[i];

                    this.nodes.add(node);
                    this.node2mirrorLine.set(node,line);
                    // checkTriVectors(line.coordinateList[1],line.coordinateList[0],line.coordinateList[2])
                    this.nodeAttributes['nodePosition'].set(node,line.coordinateList[i]);
                    if(i!=line.coordinateList.length-1){
                        const edge=line.segmentList[i];
                        this.edges.add(edge);
                        this.edges2mirrorLine.set(edge,line);
                    }
                }
                // console.log(line.coordinateList.length);
                
                // checkTriVectors(line.coordinateList[1],line.coordinateList[0],line.coordinateList[2])
                
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
            let count=0;
            for(const appearSlot of appears.getAllIntervalsWithoutValue(appears.root)){
                if(isNaN(appearSlot.start)){
                    console.log(count);
                    
                    throw new Error('appearslot is null')
                }
                count++;
                const connection = new MirrorConnection(edge,appearSlot);
                //need cautious and update later, now it is pasuodocode
                const source=edge.sourceNode;
                const target=edge.targetNode;
                const middlePoint=(appearSlot.start+appearSlot.end)/2;

                const sourceLines=this.nodeMirrorMap.get(source);
                // console.log('checksourceline');
                // console.log(sourceLines);
                
                // console.log(sourceLines.length)
                // console.log(appearSlot)
                for(const sourceLine of sourceLines){
                    // console.log('checks')
                    // console.log(sourceLine.interval.start);
                    // console.log(middlePoint);
                    // console.log(sourceLine.interval.end);
                    
                    
                    
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
                
               if(!this.edgeMirrorMap.has(edge)){
                    this.edgeMirrorMap.set(edge,[connection]);
               }
               else{
                    this.edgeMirrorMap.get(edge).push(connection)
               }

            }

        }
        console.log('countconnection');
        console.log(this.dyGraph.nodes.size);
        
        console.log(countConnection)
        
    }
    postProcessing(){
        for(const [id,trajectories] of this.nodeMirrorMap.entries()){
            //if(temperature() > shutDownTemperature)
            //if (refreshCounter % refreshInterval == 0 ) 
            // console.log('id'+ id);
            
            for(const trajectory of trajectories){
                
                trajectory.expandBend(this.expandDistance);
                // console.log('tra');
                
                // console.log(trajectory.coordinateList.length);
                
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
    getMinMax(){
        let minC=[100000000000000,100000000000000,100000000000000];
        let maxC=[-10000,-10000,-10000];
        // console.log(this.nodeAttributes['nodePosition'].entries());
        
        for(const [id,pos] of this.nodeAttributes['nodePosition'].entries()){
            // console.log(pos[0]);
            
           if(pos[0]<minC[0]){
            minC[0]=pos[0];
           }
           if(pos[1]<minC[1]){
            minC[1]=pos[1];
           }
           if(pos[2]<minC[2]){
            minC[2]=pos[2];
           }
           if(pos[0]>maxC[0]){
            maxC[0]=pos[0];
           }
           if(pos[1]>maxC[1]){
            maxC[1]=pos[1];
           }
           if(pos[2]>maxC[2]){
            maxC[2]=pos[2];
           }
        }
        return [minC,maxC]
    }
    outputMatrix(){
        let lines=[];
        let mirrorIndex=[];
        let connectionCoordinates=[];
        let connectionIndex=[];
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
        
        console.log('extrme');
        const [minC,maxC]=this.getMinMax();
        console.log(minC);
        console.log(maxC);
        
        
        for(const [id,nodeLines] of this.nodeMirrorMap.entries()){
            for(const nodeline of nodeLines){
                let coordinateList=nodeline.coordinateList;
                const index=coordinateList.length;
                mirrorIndex.push(index);
                // console.log('co')
                // console.log(coordinateList)
                lines.push(...this.convertCoordinate(coordinateList,minC,maxC))
            }
        }
        let flag=0;
        for(const [edge,connections] of this.edgeMirrorMap.entries()){
            
            for(const connection of connections){
               
                let ConnectionCoordinate=[];
                const slot=connection.interval;
                // console.log('slot');
                // console.log(slot);
                
                
                const sourceLine=connection.source;
                const targetLine=connection.target;
                const intervalStart=slot.start*this.tau;
                const intervalEnd=slot.end*this.tau;
                // console.log('slot');
                // console.log(slot.end);
                
                
                const sourceSurface=this.findInterpolatedPoints(sourceLine.coordinateList,[intervalStart,intervalEnd]);
                const targetSurface=this.findInterpolatedPoints(targetLine.coordinateList,[intervalStart,intervalEnd]);
                ConnectionCoordinate=this.generateSurface(sourceSurface,targetSurface)
                const converted=[]
                // console.log('lllll');
                // console.log(ConnectionCoordinate);
                
                
                
                
                for(let i=0;i<ConnectionCoordinate.length;i++){
                    // console.log(i);
                    
                    // console.log(ConnectionCoordinate);
                    converted.push(this.convertCoordinate([ConnectionCoordinate[i]],minC,maxC))
                }
                
                // ConnectionCoordinate=this.convertCoordinate(ConnectionCoordinate,minC,maxC)
                connectionCoordinates.push(converted);
                connectionIndex.push(converted.length);
                
            }
        }
        // console.log('lines');
        // // console.log(lines.length);
        
        // // console.log(lines);
        // console.log(this.surfaceCoord(connectionCoordinates));
        
        // console.log('check trajectory');
        // console.log(lines);
        // console.log(mirrorIndex);
        // console.log(connectionCoordinates);
        
        
        
        
        return [lines,mirrorIndex,connectionCoordinates,connectionIndex];
    }
    interpolateLinePreservingSegments(lineShort, lineLong) {
        let result = [...lineShort]; // Start with the shorter line's points
        let longIndex = 0;
        let count=0;
        const gap=lineLong.length-lineShort.length
        for (let i = 0; i < lineShort.length - 1; i++) {
            let [x1, y1, z1] = lineShort[i];
            let [x2, y2, z2] = lineShort[i + 1];
    
            // Find all points in the longer line that fall within [z1, z2]
            while (longIndex < lineLong.length && lineLong[longIndex][2] <= z2) {
                let [lx, ly, lz] = lineLong[longIndex];
    
                if (lz > z1 && lz < z2) {
                    // Interpolate only if this Z does not already exist in result
                    let t = (lz - z1) / (z2 - z1);
                    let newX = x1 + t * (x2 - x1);
                    let newY = y1 + t * (y2 - y1);
    
                    result.push([newX, newY, lz]);
                    count++;
                }
                longIndex++;
                 // Move to next point in the longer line
                if(count==gap){
                    break
                }
            }
            if(count==gap){
                break
            }
            // console.log('tte');
            
        }
        if(count<gap){
            const ancher=result[result.length-1];
            for(let j=0;j<gap-count;j++){
                result.push(ancher)
            }
        }
        // Sort final points by Z to maintain order
        return result.sort((a, b) => a[2] - b[2]);
    }
    generateSurface(lineA, lineB) {
        let m = lineA.length;
        let n = lineB.length;
        
        let convertlineA=lineA.map(innerArr => [...innerArr]);;
        let convertlineB=lineB.map(innerArr => [...innerArr]);;
        // Resample the shorter line to match the longer one
        if (m > n) {
             convertlineB = this.interpolateLinePreservingSegments(lineB, lineA);
        } else if (n >= m) {
             convertlineA = this.interpolateLinePreservingSegments(lineA, lineB);
        }
        // console.log('check same after');
        // console.log(convertlineA.length);
        // console.log(convertlineB.length);
        let surface = [];
        // console.log('check same');
        // console.log(convertlineA.length);
        // console.log(convertlineB.length);
        for (let i = 0; i < convertlineA.length; i++) {
            surface.push(convertlineA[i]); // Line A point
            surface.push(convertlineB[i]); // Corresponding Line B point
        }
    
        return surface;
    }
    
    surfaceCoord(connections){

        let surface=[]
        for(let i=0;i<connections.length;i++){

            // if(connections[i].length!=4){
            //     throw new Error('surface coordinate number is not 4')
            // }
            console.log([...connections[i][0],...connections[i][1],...connections[i][3],...connections[i][0],...connections[i][2],...connections[i][3]]);
            
            surface=surface.concat([...connections[i][0],...connections[i][1],...connections[i][3],...connections[i][0],...connections[i][2],...connections[i][3]])
        }
        return surface;
    }
    //coordinates is a 2D array from the mirror, store the 3D coordinates of each node
    //may adjust the coordinate in the future
    convertCoordinate(coordinates,minC,maxC){
        let convertedCoordinates=[]
        for(let coordinate of coordinates){
            const convertedCoordinate=this.fmap3DCoordinates(coordinate,minC,maxC);
            
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
    fmap2DCoordinates(coord,  minVals, maxVals) {
        const [x, y] = coord;
    
        // Normalize each axis to 0-1 range
        const normalizedX = (x - minVals[0]) / (maxVals[0] - minVals[0]);
        const normalizedY = (y - minVals[1]) / (maxVals[1] - minVals[1]);
        
        // Map to the target ranges
        const mappedX = normalizedX * 2 -1;
        const mappedY = normalizedY * 2 -1;
     
    
        return [mappedX, mappedY ];
    }
    cube2DyGraph(){
        const [minC,maxC]=this.getMinMax();
        for(const [id,nodeLines] of this.nodeMirrorMap.entries()){
            this.dyGraph.nodeAttributes['nodePosition'].set(id,new IntervalTree(true))
            const tree=this.dyGraph.nodeAttributes['nodePosition'].get(id)
            for(const nodeline of nodeLines){
                let coordinateList=nodeline.coordinateList;
               
                // console.log('co')
                // console.log(coordinateList)
                // lines.push(...this.convertCoordinate(coordinateList,minC,maxC))
                // const after=this.convertCoordinate(coordinateList,minC,maxC)
                for(let i=0;i<coordinateList.length-1;i++){
                    // console.log(coordinateList[i]);
                    
                    const coor1=this.fmap3DCoordinates(coordinateList[i],minC,maxC)
                    const coor2=this.fmap3DCoordinates(coordinateList[i+1],minC,maxC)
                    const interval=this.dyGraph.createIntervalBlock(coor1[1],coor2[1],[coor1[0],coor1[2]],[coor2[0],coor2[2]])
                    tree.insert(interval)
                }
            }
        }
        return this.dyGraph
    }

    // findInterpolatedPoint(points, targetZ) {
    //     const interpolatedPoints=[]
    //     for(let i=0;i<targetZ.length;i++){
    //         let left = 0, right = points.length - 1;
        
    //         // Binary search for the closest z values
    //         while (left <= right) {
    //             let mid = Math.floor((left + right) / 2);
    //             if (points[mid][2] === targetZ[i]) {
    //                 interpolatedPoints.push(points[mid]) ; // Exact match
    //             } else if (points[mid][2] < targetZ[i]) {
    //                 left = mid + 1;
    //             } else {
    //                 right = mid - 1;
    //             }
    //         }
        
    //         // If exact match not found, interpolate between points[right] and points[left]
    //         if (right < 0 || left >= points.length) {
    //             throw new Error("not find interploated value"); // Target z is out of range
    //         }
        
    //         let [x1, y1, z1] = points[right];
    //         let [x2, y2, z2] = points[left];
        
    //         // Compute interpolation factor
    //         let t = (targetZ[i] - z1) / (z2 - z1);
        
    //         // Interpolate x and y
    //         let x = x1 + t * (x2 - x1);
    //         let y = y1 + t * (y2 - y1);
        
    //         interpolatedPoints.push([x, y, targetZ[i]]);
    //     }
    //     return interpolatedPoints;
    // }
    findInterpolatedPoints(points, targetZ) {
        if (targetZ.length !== 2) {
            throw new Error("targetZ must have exactly two values.");
        }
    
        let [zMin, zMax] = targetZ.sort((a, b) => a - b);
        let resultPoints = [];
    
        // Filter points within the range [zMin, zMax]
        for (let i = 0; i < points.length; i++) {
            if (points[i][2] >= zMin && points[i][2] <= zMax) {
                resultPoints.push(points[i]);
            }
        }
    
        // Function to interpolate a point at a specific Z value
        function interpolateAtZ(target) {
            let left = 0, right = points.length - 1;
            // console.log('checkarr');
            // console.log(target);
            
            // console.log(points);
            
            // Binary search for closest z values
            while (left <= right) {
                let mid = Math.floor((left + right) / 2);
                if (points[mid][2] === target) {
                    return points[mid]; // Exact match
                } else if (points[mid][2] < target) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
            console.log(right);
            console.log(left);
            console.log(target);
            console.log(points);
            
            
            // Ensure indices are within range
            if (right < 0 || left >= points.length) {
                throw new Error("Target Z is out of range");
            }
    
            // Interpolate between points[right] and points[left]
            let [x1, y1, z1] = points[right];
            let [x2, y2, z2] = points[left];
            let t = (target - z1) / (z2 - z1);
            let x = x1 + t * (x2 - x1);
            let y = y1 + t * (y2 - y1);
            return [x, y, target];
        }
        // console.log('minmax');
        
        // console.log(zMin);
        // console.log(zMax);
        
        // Add interpolated points at zMin and zMax
        resultPoints.push(interpolateAtZ(zMin));
        resultPoints.push(interpolateAtZ(zMax));
    
        // Sort result points by Z to maintain correct order
        return resultPoints.sort((a, b) => a[2] - b[2]);
    }
    ToDyGragh(){
        console.log('todyfraph');
        
        const dyGraph=new DyGraph();
        const nodes=this.dyGraph.nodes;
        const edges=this.dyGraph.edges;
        let [minC,maxC]=this.getMinMax();
        minC=[minC[0],minC[1]];
        maxC=[maxC[0],maxC[1]];
        for(const [id,node] of nodes.entries()){

            dyGraph.nodeAttributes['nodePosition'].set(node,new IntervalTree([0,0]));
            const tree=dyGraph.nodeAttributes['nodePosition'].get(node);
            for(const line of this.nodeMirrorMap.get(node)){
                const segment=line.coordinateList
                const segmentLength=line.coordinateList.length
                for(let i=0;i<segmentLength-1;i++){
                    const startTime=segment[i][2]/this.tau;
                    const endTime=segment[i+1][2]/this.tau;
                    let startPos=[segment[i][0],segment[i][1]];
                    let endPos=[segment[i+1][0],segment[i+1][1]];
                    startPos=this.fmap2DCoordinates(startPos,  minC, maxC);
                    endPos=this.fmap2DCoordinates(endPos,  minC, maxC);
                    const interval=new Interval(startTime,endTime,startPos,endPos);
                    tree.insert(interval);
                }
            }
        }
        dyGraph.edgeAttributes['appearance']=this.dyGraph.edgeAttributes['appearance'];
        for (const [edge, tree] of dyGraph.edgeAttributes['appearance']) {
            // console.log(edge.sourceNode);
            // console.log(dyGraph.nodeAttributes['nodePosition'].get(edge.sourceNode));
            
            
        }
        return dyGraph

    }
    
}