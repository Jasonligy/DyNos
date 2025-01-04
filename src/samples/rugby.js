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
    const filePath = '"data/Rugby_tweets/pro12_mentions.csv"';
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
        fileData.firstTime=fileData.tweets[0].time;
        fileData.lastTime=fileData.tweets[fileData.tweets.length-1].time;
    } catch (error) {
        console.error('Error reading file:', error);
    }

    return fileData;
}