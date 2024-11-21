// Class representing a Node
import {Interval,IntervalTree}from "../intervalTree/intervalTree.js"
export class Node {
    constructor(id=null, value = null) {
        this.id = id;      // Unique identifier for the node, default string type
        
    }
}
export class Edge {
    
    constructor(sourceNode,targetNode, value = null) {
        this.sourceNode=sourceNode;
        this.targetNode=targetNode;
    }
    checkConnection(node1,node2){
        if(node1 instanceof Node && node2 instanceof Node){
            return (this.sourceNode==node1&&this.targetNode==node2)||(this.sourceNode==node2&&this.targetNode==node1);
        }
        else{
            return (node1==this.sourceNode.id && node2==this.targetNode.id) || (node2==this.sourceNode.id && node1==this.targetNode.id);

        }
       
        
        }

}

// Class representing a Graph with Nodes and Edges
export class DyGraph {
    addDefaultNodeAttributes(){
        this.nodeAttributes['appearance']=new Map();
        this.nodeAttributes['label']=new Map();
        this.nodeAttributes['nodePosition']=new Map();
        this.nodeAttributes['color']=new Map();
    }
    addDefaultEdgeAttributes(){
        this.edgeAttributes['appearance']=new Map();
        this.nodeAttributes['color']=new Map();
        this.nodeAttributes['strength']=new Map();
        
    }

    constructor() {

        this.nodeAttributes = new Object();
        this.edgeAttributes = new Object();
        this.nodes = new Map();     // Store nodes using a Map with the node ID as the key
        this.edges = new Set();     // Store edges as a Set of pairs of node IDs
        this.nodeEdgeMap=new Map();
        this.addDefaultNodeAttributes();
        this.addDefaultEdgeAttributes();
    }
    createKey(value1, value2) {
        return JSON.stringify([value1, value2].sort()); // Sort to ignore order
    }
    addNodeAttribute(attributeName){
        this.nodeAttributes[attributeName]=new Map();
        return this.nodeAttributes[attributeName]
    }
    addEdgeAttribute(attributeName){
        this.edgeAttributes[attributeName]=new Map();
        return this.edgeAttributes[attributeName]
    }
    createIntervalBlock(leftBound,rightBound,leftValue,rightValue){
        return new Interval(leftBound,rightBound,leftValue,rightValue)
    }
    addNodeBent(node,timeStamp,coordinate){
        if(!this.nodeAttributes['nodePosition'].has(node)){
            console.log("not assign position to node "+node.id)
            throw new Error('position not exist')
        }
        const intervalList=this.nodeAttributes['nodePosition'].node;

        const selectedInterval=intervalList.query(timeStamp);
        if(selectedInterval.length==0){
            console.log('the time is not included in node'+node.id);
            throw new Error('time stamp not contain in node')
        }
        const interval=selectedInterval[0];
        newLeftInterval=this.createIntervalBlock(interval.leftBound,timeStamp,interval.leftValue,coordinate);
        newRightInterval=this.createIntervalBlock(timeStamp,interval.rightBound,coordinate,interval.leftValue);
        intervalList.insert(newLeftInterval);
        intervalList.insert(newRightInterval);
        // const selectedInterval=intervalList.filter(e=>e.leftBound<timeStamp&&e.rightBound>timeStamp);
        // if(selectedInterval.length==0){
        //     console.log('the time is not included in node'+node.id);
        //     throw new Error('time stamp not contain in node')
        // }
        // const interval=selectedInterval[0];
        // newLeftInterval=this.createIntervalBlock(interval.leftBound,timeStamp,interval.leftValue,coordinate);
        // newRightInterval=this.createIntervalBlock(timeStamp,interval.rightBound,coordinate,interval.leftValue);
        // intervalList.add(newLeftInterval);
        // intervalList.add(newRightInterval);
        // intervalList.sort((a,b)=>a.leftBound-b.leftBound)
    }
    


    // Add a node to the graph
    addNode(id) {
        if (!this.nodes.has(id)) {
            const newNode = new Node(id);
            this.nodes.set(id, newNode);
        } else {
            console.log(`Node with id ${id} already exists.`);
        }
        return this.nodes.get(id);
    }

    // Add an edge between two nodes (by their IDs),attributes are str
    addEdge(node1, node2) {
        if(node1.constructor!=node2.constructor){
            throw new Error("the 2 node type is not the same")
        }
        if(typeof node1=="string"){
            if (this.nodes.has(node1) && this.nodes.has(node2)) {
                const edge = new Edge(this.nodes.get(node1),this.nodes.get(node2));  // Sort to avoid duplicate edges (A->B, B->A)
                this.edges.add(edge); // Store edge as a string "nodeId1-nodeId2"
                const key=this.createKey(node1,node2);
                this.nodeEdgeMap.set(key,edge);
                return edge
            } else {
                throw new Error(`One or both nodes do not exist: ${node1}, ${node2}`);
            }
        }
        else if(node1 instanceof Node){
            if (this.nodes.has(node1.id) && this.nodes.has(node2.id)) {
                const edge = new Edge(node1,node2);  // Sort to avoid duplicate edges (A->B, B->A)
                this.edges.add(edge); // Store edge as a string "nodeId1-nodeId2"
                const key=this.createKey(node1.id,node2.id);
                this.nodeEdgeMap.set(key,edge);
            } else {
                throw new Error(`One or both nodes do not exist: ${node1}, ${node2}`);
            }
        }
    }

    // Get all edges of the graph
    getEdges() {
        return [...this.edges].map(edgeStr => edgeStr.split('-'));
    }
    queryEdge(node1,node2){
        if(node1.constructor!=node2.constructor){
            throw new Error("the 2 node type is not the same")
        }
        
        if(typeof node1 == "string"){
            return this.nodeEdgeMap.has(node1,node2);
        }
        if(node1 instanceof Node){
            return this.nodeEdgeMap.has(this.createKey(node1.id.node2.id));
        }

    }
  

    // Display nodes and edges of the graph
    // displayGraph() {
    //     console.log('Nodes:');
    //     this.nodes.forEach((node, id) => {
    //         console.log(`ID: ${id}, Value: ${node.value}`);
    //     });
        
    //     console.log('Edges:');
    //     this.getEdges().forEach(edge => {
    //         console.log(`Edge between Node ${edge[0]} and Node ${edge[1]}`);
    //     });
    // }
}

// Example Usage
// const graph = new DyGraph();

// // Adding nodes
// graph.addNode(1, 'Node A');
// graph.addNode(2, 'Node B');
// graph.addNode(3, 'Node C');

// // Adding edges
// graph.addEdge(1, 2);
// graph.addEdge(2, 3);
// graph.addEdge(1, 3);

// // Display the graph
// graph.displayGraph();

// export default {DyGraph, Node, Edge}