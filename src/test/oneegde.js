import fs from 'fs';
// const fs = require('fs');
import readline from 'readline';
import path from 'path';
import { DyGraph,Node,Edge } from '../dygraph/Dygraph.js';
import { DiscretisationData } from '../dygraph/DiscretisationData.js';
import { IntervalTree,Interval } from '../intervalTree/intervalTree.js';
export function getOneNodeGraph(){
    const dyGraph=new DyGraph();
    let node1=dyGraph.addNode(0);
    dyGraph.nodeAttributes['nodePosition'].set(node1,new IntervalTree([0,0]));
    dyGraph.nodeAttributes['appearance'].set(node1,new IntervalTree(true))
    //the interval from origin code 
    // dyGraph.nodeAttributes['appearance'].get(node1).insert(new Interval(0,5));
    // dyGraph.nodeAttributes['appearance'].get(node1).insert(new Interval(5,10));
    dyGraph.nodeAttributes['appearance'].get(node1).insert(new Interval(0,100));
    
    let node2=dyGraph.addNode(1);
    dyGraph.nodeAttributes['nodePosition'].set(node2,new IntervalTree([10,10]));
    dyGraph.nodeAttributes['appearance'].set(node2,new IntervalTree(true))
    //the interval from origin code 
    // dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(0,5))
    // dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(5,10));
    dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(0,100));
   
    let node3=dyGraph.addNode(2);
    dyGraph.nodeAttributes['nodePosition'].set(node3,new IntervalTree([10,5]));
    dyGraph.nodeAttributes['appearance'].set(node3,new IntervalTree(true))
    dyGraph.nodeAttributes['appearance'].get(node3).insert(new Interval(0,100));

    
    //the interval from origin code 
    // dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(0,5))
    // dyGraph.nodeAttributes['appearance'].get(node2).insert(new Interval(5,10));
    

    const edge=dyGraph.addEdge(node1,node2);
    dyGraph.edgeAttributes['appearance'].set(edge,new IntervalTree(true))
    dyGraph.edgeAttributes['appearance'].get(edge).insert(new Interval(10,40))
    dyGraph.edgeAttributes['appearance'].get(edge).insert(new Interval(50,80))
    const edge1=dyGraph.addEdge(node2,node3);
    dyGraph.edgeAttributes['appearance'].set(edge1,new IntervalTree(true))
    dyGraph.edgeAttributes['appearance'].get(edge1).insert(new Interval(10,80))
    return dyGraph
}