import fs from 'fs';
// const fs = require('fs');
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
import { DiscretisationData } from '../dygraph/DiscretisationData.js';
import { IntervalTree,Interval } from '../intervalTree/intervalTree.js';
// const fs = require('fs');
// const readline = require('readline');


/*
export function readFile(){
    console.log('first')
    const folderPath = 'data/van_De_Bunt/van_De_Bunt'; 
    const fileData=new Object();
    fileData.relations=new Map();
    fs.readdir(folderPath, (err, files) => {

        files.forEach(file=>{
            
            const filePath = path.join(folderPath,file);
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity // Recognizes all instances of CR LF as a single line break
            });
            if(file == 'VARS.DAT'){
                fileData.students=[];
                // const fileStream = fs.createReadStream(filePath);
                // const rl = readline.createInterface({
                //     input: fileStream,
                //     crlfDelay: Infinity // Recognizes all instances of CR LF as a single line break
                // });
                rl.on('line', (line) => {
                    fileData.students.push(line);
                });
            }

            else if(file.startsWith("VRND32T") && file.endsWith(".DAT")){
                const period=file[7];
                // fileData.relations=new Map();
                const num= file.replace("VRND32T","").replace(".DAT","");
                let values = [];
                rl.on('line', (line) => {
                    // console.log(typeof line)
                    let relation = line.replace(/\s+/g, "").split("");
                    let numerical= relation.map(item=>parseInt(item));
                    values.push(numerical);
                    // if(num=='1'){
                    // // console.log(values)}
                });

                rl.on('close', () => {
                    // This will be called after all lines have been processed
                    // console.log(values);
                    fileData.relations.set(num, values);
                    if(num=='1'){
                        console.log(fileData.relations)
                    }
                });
                // fileData.relations.set(period,values);
               
            }

        })
        return fileData

    })
}
*/


export async function readFile() {
    console.log('first');
    const folderPath = 'data/van_De_Bunt/van_De_Bunt';
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

                if (file === 'VARS.DAT') {
                    rl.on('line', (line) => {
                        fileData.students.push(line);
                    });

                    rl.on('close', resolve);
                    rl.on('error', reject);
                } else if (file.startsWith('VRND32T') && file.endsWith('.DAT')) {
                    const num = file.replace('VRND32T', '').replace('.DAT', '');
                    const values = [];

                    rl.on('line', (line) => {
                        const relation = line.replace(/\s+/g, '').split('');
                        const numerical = relation.map((item) => parseInt(item));
                        values.push(numerical);
                    });

                    rl.on('close', () => {
                        fileData.relations.set(parseInt(num), values);
                        resolve();
                    });

                    rl.on('error', reject);
                } else {
                    // Skip irrelevant files
                    resolve();
                }
            });
        })
    );

    return fileData;
}


export function getDyGraph(fileData){
    const dyGraph=new DyGraph();
    for(let i=0;i<fileData.students.length;i++){
        const node=dyGraph.addNode(i);
        dyGraph.nodeAttributes['nodePosition'].set(node,new IntervalTree([0,0]));
        dyGraph.nodeAttributes['appearance'].set(node,new IntervalTree(true))
        //the interval from origin code 
        dyGraph.nodeAttributes['appearance'].get(node).insert(new Interval(-1,6.5))
        // console.log(dyGraph.nodeAttributes['appearance'].get(node))
        // console.log(new Interval(-1,7))

    }
    console.log('count');
    let count=0;
    // for(let [id,value] of fileData.relations.entries()){
    for(let id=0;id<7;id++){
        // if(id==0){
        //     console.log(value)
        // }
        // console.log(value)
        const value= fileData.relations.get(id)
        for(let i=0;i<32;i++){
            for(let j=i+1;j<value[i].length;j++){
                // node strength is not applicable
                // const strength
                if((value[i][j]=='2'||value[i][j]=='1')&&(value[j][i]=='2'||value[j][i]=='1')){
                    const node1=dyGraph.nodes.get(i);
                    const node2=dyGraph.nodes.get(j);
                    
                 
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
export function discretise(origin){
    const snapshotTime=[];
    for(let i=0;i<=6;i++){
        snapshotTime.push(i);

    }
    const radius=0.49;
    const intervals=[];
    for(const center of snapshotTime){
        const leftBound=center-radius;
        const rightBound=center+radius;
        intervals.push(new Interval(leftBound,rightBound));
    }
    const graph=discretiseWithIntervals(origin, intervals);
    return graph

}
function discretiseWithIntervals(origin, intervals){
    const data=new DiscretisationData(origin);
    const l=intervals.length-1;
    const left=intervals[0].start - (intervals[0].end - intervals[0].start) * 0.2;
    const right=intervals[l].end + (intervals[l-1].end - intervals[l-1].start) * 0.2;
    for(const [id,node] of data.original.nodes){
        // if(data.isPresentInIntervalNode(node,data.originalEdgePresence.get(node))){
        //     data.discreteNodePresence.get(node).insert(outputInterval)
        // }
        const interval=new Interval(left,right);
        data.discreteNodePresence.set(node,new IntervalTree(true));
        data.discreteNodePresence.get(node).insert(interval);
       
    }
    for (let i = 0; i < intervals.length; i++) {
        let leftBound = i > 0
            ? (intervals[i - 1].end + intervals[i].start) / 2.0
            : intervals[i].start - (intervals[i].end - intervals[i].start) * 0.2;
    
        let rightBound = i < intervals.length - 1
            ? (intervals[i].end + intervals[i + 1].start) / 2.0
            : intervals[i].end + (intervals[i].end - intervals[i].start) * 0.2;
        const outputInterval=new Interval(leftBound,rightBound);
        if(i==intervals.length-1){
            console.log('right');
            console.log(rightBound);
            
            
        }
        applyBlockAttributes(data, intervals[i], outputInterval);
        // Use leftBound and rightBound as needed
    }
    return data.discrete;
}
function applyBlockAttributes(data,interval,outputInterval){
    for(const [id,node] of data.original.nodes){
        // if(data.isPresentInIntervalNode(node,interval)){
        //     data.discreteNodePresence.get(node).insert(outputInterval)
        // }
        const valueLeft=data.originalNodePosition.get(node).valueAt(outputInterval.start);
        const valueRight=data.originalNodePosition.get(node).valueAt(outputInterval.end);
        data.discreteNodePosition.get(node).insert(new Interval(outputInterval.start,outputInterval.end,valueLeft,valueRight))

    }
    for(const edge of data.original.edges){
        if(data.isPresentInIntervalEdge(edge,interval)){
            data.discreteEdgePresence.get(edge).insert(outputInterval)
        }
    }
}
// // Create a readable stream from the file
// const fileStream = fs.createReadStream(filePath);

// // Create an interface to read the file line by line
// const rl = readline.createInterface({
//     input: fileStream,
//     crlfDelay: Infinity // Recognizes all instances of CR LF as a single line break
// });

// // Read each line of the file
// rl.on('line', (line) => {
//     console.log(`Line from file: ${line}`);
// });

// // Handle the end of the file
// rl.on('close', () => {
//     console.log('File reading completed.');
// });

// // Handle errors
// fileStream.on('error', (err) => {
//     console.error(`Error reading file: ${err.message}`);
// });
