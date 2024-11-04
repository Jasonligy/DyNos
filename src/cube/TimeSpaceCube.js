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
            const appears=this.dyGraph.nodeAttributea['appearance'].get(node)
            const intervals=this.dyGraph.nodeAttributea['nodePosition'].get(node);
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
            }

        }

    }
    addMirrorConnection(edges){
        //here edges is a list
        for(const edge of edges){
            // appears is a list, ststing the appeared slots for the node
            const appears=this.dyGraph.edgeAttributea['appearance'].get(node)
            // const intervals=this.dyGraph.nodeAttributea['nodePosition'].get(node);
            for(const appearSlot of appears){
                const connection = new MirrorConeection(edge,appearSlot);
                //need cautious and update later, now it is pasuodocode
                const source=edge[0];
                const target=edge[1];
                connection.addSource(source);
                connection.addTarget(target);

            }

        }
        
    }
}