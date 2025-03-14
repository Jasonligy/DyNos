import fs from 'fs';
// const fs = require('fs');
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
import { IntervalTree,Interval } from '../intervalTree/intervalTree.js';

class Tweet{
    constructor(time, from ,to){
        this.time=new Date(time.replace(" ", "T") + "Z");
        this.from=from;
        this.to=to;

    }
}
async function readFileLineByLine(filePath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath, 'utf8');
        const rl = readline.createInterface({
            input: fileStream,
            output: process.stdout,
            terminal: false
        });

        const lines = []; // To collect all lines

        // Event handler for each line
        rl.on('line', (line) => {
            lines.push(line); // Add line to the array
        });

        // Event handler when file reading is complete
        rl.on('close', () => {
            resolve(lines); // Resolve promise when all lines are read
        });

        // Handle any errors
        rl.on('error', (err) => {
            reject(err); // Reject promise if an error occurs
        });
    });
}

export async function readFile() {
    console.log('first');
    const filePath = 'data/Rugby_tweets/pro12_mentions.csv';
    const fileData = {
        tweets: [],
        teams: new Set(),
        firstTime:new Date(),
        lastTime:new Date(),
    };

    try {
        // Wait until the file reading is complete
        const lines = await readFileLineByLine(filePath);
        console.log('File reading is complete!');
        for(const line of lines){
            const tokens=line.split(",");
            const tweet=new Tweet(...tokens);
            fileData.tweets.push(tweet);
            fileData.teams.add(tokens[1]);
            fileData.teams.add(tokens[2]);

        }
        // console.log(fileData.teams);
        // throw new Error('check time')
        fileData.firstTime=fileData.tweets[0].time;
        fileData.lastTime=fileData.tweets[fileData.tweets.length-1].time;
    } catch (error) {
        console.error('Error reading file:', error);
    }

    return fileData;
}
export function getDyGraph(fileData){
    const daySeconds=24*60*60;
    const dyGraph=new DyGraph();
    const nodeMap=new Map();
    const teams=Array.from(fileData.teams)
    for(let i=0;i<teams.length;i++){
        const node=dyGraph.addNode(i);
        dyGraph.nodeAttributes['nodePosition'].set(node,new IntervalTree([0,0]));
        dyGraph.nodeAttributes['appearance'].set(node,new IntervalTree(false))
        //the interval from origin code 
        // dyGraph.nodeAttributes['appearance'].get(node).insert(new Interval(-1,6.5))
        // console.log(dyGraph.nodeAttributes['appearance'].get(node))
        // console.log(new Interval(-1,7))
        nodeMap.set(teams[i],node);
    }
    console.log('count');
    let count=0;
    // for(let [id,value] of fileData.relations.entries()){
    let mintime=Math.floor(fileData.tweets[1].time.getTime()/1000)-daySeconds;
    let maxtime=Math.floor(fileData.tweets[1].time.getTime()/1000)+daySeconds;
    for(let i=1;i<fileData.tweets.length;i++){

        
        const tweetTIme=Math.floor(fileData.tweets[i].time.getTime()/1000);
        const ctimelow=tweetTIme-0.5*daySeconds;
        const ctimehigh=tweetTIme+0.5*daySeconds;
        if(mintime>ctimelow){
            mintime=ctimelow
        }
        if(maxtime<ctimehigh){
            maxtime=ctimehigh
        }

    }
    for(let i=1;i<fileData.tweets.length;i++){

        const node1=nodeMap.get(fileData.tweets[i].from);
        const node2=nodeMap.get(fileData.tweets[i].to);
        if(!dyGraph.queryEdge(node1,node2)){
            const edge=dyGraph.addEdge(node1,node2);
            dyGraph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
            count+=1;
        }
        const edge=dyGraph.queryEdge(node1,node2);
        // console.log(new Interval(id-0.5.id+0.5))
                // console.log(dyGraph.edgeAttributes['appearance'].get(edge))
        const tweetTIme=Math.floor(fileData.tweets[i].time.getTime()/1000);
        const t=new Interval(tweetTIme-0.5*daySeconds,tweetTIme+0.5*daySeconds)
        dyGraph.edgeAttributes['appearance'].get(edge).insert(t)
        if(isNaN(t.start)){
            // console.log(count);
            console.log(fileData.tweets[i].time);
            console.log(tweetTIme+0.5*daySeconds);
            
            
            throw new Error('appearslot is nan')
        }
        // dyGraph.nodeAttributes['appearance'].get(node1).insert(new Interval(tweetTIme-0.5*daySeconds,tweetTIme+0.5*daySeconds))
        // dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(tweetTIme-0.5*daySeconds,tweetTIme+0.5*daySeconds))
        dyGraph.nodeAttributes['appearance'].get(node1).insert(new Interval(mintime,maxtime))
        dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(mintime,maxtime))


    }
        // break;
    
    console.log('count');
    console.log(fileData.tweets.length)
    scatterNode(dyGraph,100);
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