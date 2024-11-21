import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph';
// const fs = require('fs');
// const readline = require('readline');
function readFile(){
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
                fileData.relations=new Map();
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
                fileData.relations.set(period,values);
               
            }

        })
        return fileData

    })
}


export function getDyGraph(fileData){
    const dyGraph=new DyGraph();
    for(let i=0;i<fileData.students.length;i++){
        dyGraph.addNode(i);

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
