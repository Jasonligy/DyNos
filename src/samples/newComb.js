import fs from 'fs';
// const fs = require('fs');
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
import { IntervalTree,Interval } from '../intervalTree/intervalTree.js';

export async function readFile() {
    console.log('first');
    const folderPath = 'data/Newcomb/newfrat';
    const fileData = {
        students: [],
        relations: new Map(),
    };

    // Wrap fs.readdir in a Promise
    const files = await new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });

    // Process all files with Promises
    await Promise.all(
        files.map((file) => {
            const filePath = path.join(folderPath, file);

            return new Promise((resolve, reject) => {
                const fileStream = fs.createReadStream(filePath);
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });

                const num = file.replace('newfrat', '').replace('.csv', '');
                const values = [];

                rl.on('line', (line) => {
                    const relation = line.match(/\d+/g).map(Number);
                    const numerical = relation.map((item) => parseInt(item));
                    values.push(numerical);
                });

                rl.on('close', () => {
                    fileData.relations.set(parseInt(num), values);
                    resolve();
                });

                rl.on('error', reject);

            });
        })
    );
    // for(let i=0;i<17;i++){

    // }
    return fileData;
}


export function getDyGraph(fileData){
    const dyGraph=new DyGraph();
    for(let i=0;i<17;i++){
        const node=dyGraph.addNode(i);
        dyGraph.nodeAttributes['nodePosition'].set(node,new IntervalTree([0,0]));
        dyGraph.nodeAttributes['appearance'].set(node,new IntervalTree(true))
        //the interval from origin code 
        dyGraph.nodeAttributes['appearance'].get(node).insert(new Interval(0,16))
        // console.log(dyGraph.nodeAttributes['appearance'].get(node))
        // console.log(new Interval(-1,7))

    }
    console.log(fileData.relations.get(1).length);
    let count=0;
    // for(let [id,value] of fileData.relations.entries()){
    for(let id=1;id<15;id++){
        // if(id==0){
        //     console.log(value)
        // }
        // console.log(value)
        const value= fileData.relations.get(id)
        for(let i=0;i<16;i++){
            for(let j=i+1;j<value[i].length;j++){
                // node strength is not applicable
                // const strength
                // console.log(value[i].length);
                
                if((value[i][j]>0&&value[i][j]<=3)||((value[j][i]>0&&value[j][i]<=3))){
                    const node1=dyGraph.nodes.get(i);
                    const node2=dyGraph.nodes.get(j);
                    
                    // console.log(node1);
                    // console.log(j);
                    if(!dyGraph.queryEdge(node1,node2)){
                        const edge=dyGraph.addEdge(node1,node2);
                        dyGraph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
                        count+=1;
                    }
                    const edge=dyGraph.queryEdge(node1,node2);
                    // console.log(new Interval(id-0.5.id+0.5))
                    dyGraph.edgeAttributes['appearance'].get(edge).insert(new Interval(id-0.5,id+0.5))
                    // console.log(dyGraph.edgeAttributes['appearance'].get(edge))
                }
            }
        }
        // break;
    }
    console.log('count');
    console.log(count)
    scatterNode(dyGraph,40);
    // for(const[id,node] of dyGraph.nodes){
    //     console.log(dyGraph.nodeAttributes['nodePosition'].get(node))
    //     break
    // }
    
    return dyGraph
    // console.log(fileData.students)

}
function scatterNode(graph,desired){
    const pos=graph.nodeAttributes['nodePosition'];
    for(const[id,node] of graph.nodes.entries()){
        pos.set(node,new IntervalTree([Math.random()*desired,Math.random()*desired]));
    }
}
