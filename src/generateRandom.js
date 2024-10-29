import {DyGraph, Node, Edge} from "./dygraph/Dygraph.js"
export default function generateGraph(){
    let graph= new DyGraph();
    for(let i=0;i<10;i++){
        // const node = new Node(i.toString());
        graph.addNode(i);
        graph.nodeAttributes['appearance'].set(i,[[0,10]])
        let p=[0,0,0,0]
        for(let j=0;j<4;j++){
            p[j]=Math.random() * 2 - 1;
        }
        const block=graph.createIntervalBlock(0,10,[p[0],p[1]],[p[2],p[3]]);
        graph.nodeAttributes['nodePosition'].set(i,block);
    }
    let i=0;
    while(i<15){
        const s = Math.floor(Math.random() * 10);
        const t = Math.floor(Math.random() * 10);
        if (s !== t) {
            // Create a string representation of the edge in sorted order
            const edge = s < t ? `${s}-${t}` : `${t}-${s}`;

            // Check for duplicate
            if (!graph.edges.has(edge)) {
                graph.edges.add(edge);  // Add edge if not present
                i++;                    // Increment only when an edge is added
            }
        }
    }
    return graph
}
// export default generateGraph