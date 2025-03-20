import fs from 'fs';
// const fs = require('fs');
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
import { IntervalTree,Interval } from '../intervalTree/intervalTree.js';
// const fs = require('fs');
// const readline = require('readline');

class Dialog{
    

    constructor(source=null,target=null,time=null,duration=null){
      this.source=source;
      this.target=target;
      this.time=time;
      this.duration=duration;
    }
}

export async function readFile() {
    console.log('first');
    const folderPath = 'data/DialogSequences/Pride_and_Prejudice/chapters';
    const fileData = {
        dialogs: [],
        characters: new Set(),
        startTime:Infinity,
        lastTime:-Infinity,
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
            const chapter=parseInt(file.replace(/\D/g, ''));
            // console.log(chapter);
            
            fileData.startTime=Math.min(fileData.startTime,chapter);
            fileData.endTime=Math.max(fileData.endTime,chapter+1);
            return new Promise((resolve, reject) => {
                const fileStream = fs.createReadStream(filePath);
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });
                const fileDialog=[];
                rl.on('line', (line) => {
                    if(line.includes("\t")){
                        const tokens = line.split("\t");
                        // console.log(tokens);
                        
                        if(tokens.length!=2){
                            throw new Error("dialog person not 2")
                        }
                        const dialog=new Dialog();
                        dialog.source=tokens[0];
                        dialog.target=tokens[1];
                        fileData.characters.add(tokens[0]);
                        fileData.characters.add(tokens[1]);
                        // 
                        fileDialog.push(dialog);
                    }
                    
                });

                rl.on('close', ()=>{
                    // console.log('close');
                    
                    let order=0;
                    for(const dialog of fileDialog){
                        dialog.duration=1/fileDialog.length;
                        dialog.time=chapter+order*dialog.duration;
                        fileData.dialogs.push(dialog);
                        order++;
                    }
                    // console.log('precomp');
                    resolve();
                });
                rl.on('error', reject);
                
            });
        })
    );
    console.log('complete');
    
    return fileData;
}


export function getDyGraph(fileData){
    const dyGraph=new DyGraph();
    const nodeMap=new Map();
    let index=0;
    console.log(fileData.characters.size);
    
    for(const ch of fileData.characters){
        const node=dyGraph.addNode(index);
        dyGraph.nodeAttributes['nodePosition'].set(node,new IntervalTree([0,0]));
        dyGraph.nodeAttributes['appearance'].set(node,new IntervalTree(false))
        //the interval from origin code 
        // dyGraph.nodeAttributes['appearance'].get(node).insert(new Interval(-1,6.5))
        // console.log(dyGraph.nodeAttributes['appearance'].get(node))
        // console.log(new Interval(-1,7))
        nodeMap.set(ch,node);
        index++;
    }
    let count=0;
    const chartime=new Map();
    for(let i=0;i<fileData.dialogs.length;i++){

        const chara=fileData.dialogs[i].source;
        if(chartime.has(chara)){
            const firsttime=Math.min(chartime.get(chara)[0],fileData.dialogs[i].time-2*fileData.dialogs[i].duration*10);
            const lasttime=Math.max(chartime.get(chara)[1],fileData.dialogs[i].time+2*fileData.dialogs[i].duration*11)
            chartime.set(chara,[firsttime,lasttime])
        }
        else{
            const firsttime=fileData.dialogs[i].time-2*fileData.dialogs[i].duration*10;
            const lasttime=fileData.dialogs[i].time+2*fileData.dialogs[i].duration*11;
            chartime.set(chara,[firsttime,lasttime])
        }

        const charb=fileData.dialogs[i].target;
        if(chartime.has(charb)){
            const firsttime=Math.min(chartime.get(charb)[0],fileData.dialogs[i].time-2*fileData.dialogs[i].duration*10);
            const lasttime=Math.max(chartime.get(charb)[1],fileData.dialogs[i].time+2*fileData.dialogs[i].duration*11)

            chartime.set(charb,[firsttime,lasttime])
        }
        else{
            const firsttime=fileData.dialogs[i].time-2*fileData.dialogs[i].duration*10;
            const lasttime=fileData.dialogs[i].time+2*fileData.dialogs[i].duration*11;
            chartime.set(charb,[firsttime,lasttime])
        }
    }
    for(let i=0;i<fileData.dialogs.length;i++){

        const node1=nodeMap.get(fileData.dialogs[i].source);
        const node2=nodeMap.get(fileData.dialogs[i].target);
        if(!dyGraph.queryEdge(node1,node2)){
            const edge=dyGraph.addEdge(node1,node2);
            dyGraph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
            count+=1;
        }
        const edge=dyGraph.queryEdge(node1,node2);
        // console.log(new Interval(id-0.5.id+0.5))
                // console.log(dyGraph.edgeAttributes['appearance'].get(edge))
        // const tweetTIme=Math.floor(fileData.dialogs[i].time.getTime()/1000);
        const participantP=new Interval(fileData.dialogs[i].time-2*fileData.dialogs[i].duration*10,fileData.dialogs[i].time+2*fileData.dialogs[i].duration*11);
        const dialogInter=new Interval(fileData.dialogs[i].time,fileData.dialogs[i].time+2*fileData.dialogs[i].duration)
        dyGraph.edgeAttributes['appearance'].get(edge).insert(dialogInter)
        

        // dyGraph.nodeAttributes['appearance'].get(node1).insert(participantP)
        // dyGraph.nodeAttributes['appearance'].get(node2).insert(participantP)
       
       
        const tree1=dyGraph.nodeAttributes['appearance'].get(node1);
        if(tree1.root==null){
            
            
           tree1.insert(new Interval(...chartime.get(fileData.dialogs[i].source)));
        //    console.log('tree1');
        //    console.log(tree1);
           
        //    tree1.insert(new Interval(mintime,maxtime));
        }
        const tree2=dyGraph.nodeAttributes['appearance'].get(node2);
        if(tree2.root==null){
            // console.log('checknull');
            
           tree2.insert(new Interval(...chartime.get(fileData.dialogs[i].target)));
        //    console.log(tree2);
           
        //    console.log('tree2');
        //    console.log(tree2);
        //    tree2.insert(new Interval(mintime,maxtime));
        }
        

    }

    // console.log(fileData.students)
    scatterNode(dyGraph,200);
    return dyGraph

}
function scatterNode(graph,desired){
    const pos=graph.nodeAttributes['nodePosition'];
    for(const[id,node] of graph.nodes.entries()){
        pos.set(node,new IntervalTree([Math.random()*desired,Math.random()*desired]));
    }
}
