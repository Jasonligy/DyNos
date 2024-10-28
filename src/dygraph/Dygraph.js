// Class representing a Node
class Node {
    constructor(id, value = null) {
        this.id = id;      // Unique identifier for the node
        
    }
}

// Class representing a Graph with Nodes and Edges
class DyGraph {
    constructor() {
        this.nodeAttributes = new Object();
        this.edgeAttributes = new Object();
        this.nodes = new Map();     // Store nodes using a Map with the node ID as the key
        this.edges = new Set();     // Store edges as a Set of pairs of node IDs
        addDefaultNodeAttributes();
        addDefaultEdgeAttributes();
    }
    addDefaultNodeAttributes(){
        this.nodeAttributes['apperance']=new Map();
        this.nodeAttributes['label']=new Map();
        this.nodeAttributes['nodePosition']=new Map();
        this.nodeAttributes['color']=new Map();
    }
    addDefaultEdgeAttributes(){
        this.edgeAttributes['apperance']=new Map();
        this.nodeAttributes['color']=new Map();
        this.nodeAttributes['strength']=new Map();
        
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
        return {
            leftBound:leftBound,
            rightBound:rightBound,
            leftValue:leftValue,
            rightValue:rightValue
        }
    }
    addNodeBent(node,timeStamp,coordinate){
        if(!this.nodeAttributes['nodePosition'].has(node)){
            console.log("not assign position to node "+node.id)
            throw new Error('position not exist')
        }
        intervalList=this.nodeAttributes['nodePosition'].node;
        const selectedInterval=intervalList.filter(e=>e.leftBound<timeStamp&&e.rightBound>timeStamp);
        if(selectedInterval.length==0){
            console.log('the time is not included in node'+node.id);
            throw new Error('time stamp not contain in node')
        }
        const interval=selectedInterval[0];
        newLeftInterval=this.createIntervalBlock(interval.leftBound,timeStamp,interval.leftValue,coordinate);
        newRightInterval=this.createIntervalBlock(timeStamp,interval.rightBound,coordinate,interval.leftValue);
        intervalList.add(newLeftInterval);
        intervalList.add(newRightInterval);
        intervalList.sort((a,b)=>a.leftBound-b.leftBound)
    }
    


    // Add a node to the graph
    addNode(id) {
        if (!this.nodes.has(id)) {
            const newNode = new Node(id);
            this.nodes.set(id, newNode);
        } else {
            console.log(`Node with id ${id} already exists.`);
        }
    }

    // Add an edge between two nodes (by their IDs)
    addEdge(nodeId1, nodeId2) {
        if (this.nodes.has(nodeId1) && this.nodes.has(nodeId2)) {
            const edge = [nodeId1, nodeId2].sort();  // Sort to avoid duplicate edges (A->B, B->A)
            this.edges.add(edge.join('-')); // Store edge as a string "nodeId1-nodeId2"
        } else {
            console.log(`One or both nodes do not exist: ${nodeId1}, ${nodeId2}`);
        }
    }

    // Get all edges of the graph
    getEdges() {
        return [...this.edges].map(edgeStr => edgeStr.split('-'));
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
const graph = new DyGraph();

// Adding nodes
graph.addNode(1, 'Node A');
graph.addNode(2, 'Node B');
graph.addNode(3, 'Node C');

// Adding edges
graph.addEdge(1, 2);
graph.addEdge(2, 3);
graph.addEdge(1, 3);

// Display the graph
graph.displayGraph();
