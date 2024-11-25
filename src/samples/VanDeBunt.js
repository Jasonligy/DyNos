import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
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
                        fileData.relations.set(num, values);
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
        dyGraph.nodeAttributes['appearance'].get(node).insert(new Interval(-1,7))

    }
    for(const [id,value] of fileData.relations.entries()){
        for(let i=0;i<7;i++){
            for(let j=i+1;j<value[i].length;j++){
                // node strength is not applicable
                // const strength
                if((value[i][j]=='3'||value[i][j]=='4')&&(value[j][i]=='3'||value[j][i]=='4')){
                    const node1=dyGraph.nodes.get(i);
                    const node2=dyGraph.nodes.get(j);
                    if(!dyGraph.queryEdge(node1,node2)){
                        const edge=dyGraph.addEdge(node1,node2);
                        dyGraph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
                        
                    }
                    const edge=dyGraph.queryEdge(node1,node2);
                    dyGraph.edgeAttributes['appearance'].get(edge).insert(new Interval(id-0.5.id+0.5))
                }
            }
        }
    }
    scatterNode(dyGraph,5);
    return dyGraph
    // console.log(fileData.students)

}
function scatterNode(graph,desired){
    const pos=graph.nodeAttributes['nodePosition'];
    for(const[id,node] of graph.nodes.entries()){
        pos.set(node,new IntervalTree([Math.random()*desired,Math.random()*desired]));
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
