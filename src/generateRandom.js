import {DyGraph, Node, Edge} from "./dygraph/Dygraph.js"
import {Interval,IntervalTree}from "./intervalTree/intervalTree.js"
// import mat4  from 'gl-matrix';
export default function generateGraph(){
    let graph= new DyGraph();
    for(let i=0;i<10;i++){
        // const node = new Node(i.toString());
        const node=graph.addNode(i);
        graph.nodeAttributes['appearance'].set(node,new IntervalTree(true))
        graph.nodeAttributes['appearance'].get(node).insert(new Interval(0,10))
        let p=[0,0,0,0]
        for(let j=0;j<4;j++){
            p[j]=Math.random() * 2 - 1;
        }
        const block=graph.createIntervalBlock(0,10,[p[0],p[1]],[p[2],p[3]]);
        if(!graph.nodeAttributes['nodePosition'].has(node)){
            const tree=new IntervalTree();
            tree.insert(block)
            graph.nodeAttributes['nodePosition'].set(node,tree);
        }
        
    }
    let i=0;
    while(i<15){
        const s = Math.floor(Math.random() * 10);
        const t = Math.floor(Math.random() * 10);
        if (s !== t) {
            // Create a string representation of the edge in sorted order
            // const edge = graph.edges;
            const checkEdge= new Set([...graph.edges].filter(edge => edge.checkConnection(s,t)));
            // Check for duplicate
            if (checkEdge.size==0) {
                const source=graph.nodes.get(s);
                const target=graph.nodes.get(t);
                const edge =new Edge(source,target);
                graph.edges.add(edge);  // Add edge if not present
                graph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
                graph.edgeAttributes['appearance'].get(edge).insert(new Interval(0,10))
                i++;                    // Increment only when an edge is added
            }
        }
    }
    return graph;
}
// export default generateGraph