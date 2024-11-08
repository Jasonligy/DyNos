export class MirrorLine{
    constructor(node,appearInterval){
        this.node = node;
        this.interval=appearInterval;
        //the bends of coordinate in the trajectory
        this.coordinateList=[];
    }
    addBend(coordinat){
        this.coordinateList.push(coordinat);
    }
}
//mirrorConnection only made a reference to the end points and its interval
export class MirrorConeection{
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
        this.tau=tau
        this.dyGraph=dyGraph;
        this.nodeMirrorMap=new Map();
        this.edgeMirrorMap=new Map();
        const nodes=dyGraph.nodes;
        this.addMirrorLine(nodes);
        const edges=dyGraph.edges;


    }
    updateCube(){

    }
    addMirrorLine(nodes){
        for(const [id,node] of nodes.entries()){
            // appears is a list, ststing the appeared slots for the node
            const appears=this.dyGraph.nodeAttributes['appearance'].get(node.id)
            const intervals=this.dyGraph.nodeAttributes['nodePosition'].get(node.id);
            console.log(typeof appears)
            for(const appearSlot of appears){
                let line=new MirrorLine(node,appearSlot);
                //biuld trajectory using mirrorLine, creating bends in the mirrorlines
                for(const interval of intervals){
                    // need to check if the right bound of upper level is equal to the left bound of next level.
                    // convert the time to space, assuming the node position is continous and the appearslot value is equal to the interval bound values
                    if(appearSlot[0]==interval.leftBound){
                        line.addBend(interval.leftValue.concat(interval.leftBound*this.tau));
                    }
                    if(appearSlot[1]==interval.rightBound){
                        line.addBend(interval.rightValue.concat(interval.rightBound*this.tau));
                        break;
                    }
                    if(appearSlot[1]>interval.rightBound){
                        line.addBend(interval.rightValue.concat(interval.rightBound*this.tau));
                    }

                }
                if(!this.nodeMirrorMap.has(node)){
                    this.nodeMirrorMap.set(node, [line]);}
                else{
                    this.nodeMirrorMap.get(node).push(line);
                }
            }

        }

    }
    addMirrorConnection(edges){
        //here edges is a list
        for(const edge of edges){
            // appears is a list, ststing the appeared slots for the node
            const appears=this.dyGraph.edgeAttributea['appearance'].get(edge)
            // const intervals=this.dyGraph.nodeAttributea['nodePosition'].get(node);
            for(const appearSlot of appears){
                const connection = new MirrorConeection(edge,appearSlot);
                //need cautious and update later, now it is pasuodocode
                const source=edge.sourceNode;
                const target=edge.targetNode;
                connection.addSource(source);
                connection.addTarget(target);
                this.edgeMirrorMap.set(edge,connection);

            }

        }
        
    }
    outputMatrix(){
        let lines=[];
        let mirrorIndex=[];
        for(const [id,nodeLines] of this.nodeMirrorMap.entries()){
            for(const nodeline of nodeLines){
                let coordinateList=nodeline.coordinateList;
                const index=coordinateList.length;
                mirrorIndex.push(index);
                lines.push(...this.convertCoordinate(coordinateList))
            }
        }
        return [lines,mirrorIndex];
    }
    //coordinates is a 2D array from the mirror, store the 3D coordinates of each node
    //may adjust the coordinate in the future
    convertCoordinate(coordinates){
        let convertedCoordinates=[]
        for(let coordinate of coordinates){
            const convertedCoordinate=this.fmap3DCoordinates(coordinate,[-1,-1,0],[1,1,10]);
            
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
    
        return [mappedX, mappedY, mappedZ];
    }
    

}