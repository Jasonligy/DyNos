import {Interval,IntervalTree}from "../intervalTree/intervalTree.js"
import { DyGraph } from "./Dygraph.js"
export class DiscretisationData{
    constructor(graph){
        this.original=graph;
        this.discrete=new DyGraph();
        this.originalNodePresence=origin.nodeAttributes['appearance'];
        this.originalEdgePresence=origin.edgeAttributes['appearance'];
        this.discreteNodePresence=discrete.nodeAttributes['appearance'];
        this.discreteEdgePresence=discrete.edgeAttributes['appearance'];
        this.originalNodePosition=origin.nodeAttributes['nodePosition'];
        this.discreteNodePosition=discrete.nodeAttributes['nodePosition'];
        this.simplifiedNodePresence=new Map();
        for(const [id,node] of this.original.nodes){
            this.discrete.nodes.set(id,node);
            this.discreteNodePresence.set(node,new IntervalTree(true));
            const tree=this.originalNodePresence.get(node);
            this.simplifiedNodePresence.set(node,tree.getAllIntervals(tree.root))
            const defaultPos=this.originalNodePosition.get(node).defaultValue;
            this.discreteNodePosition.set(node,new IntervalTree(defaultPos))
        }
        for(const edge of this.original.edges){
            this.discrete.edges.add(edge);
            this.discreteEdgePresence.set(edge,new IntervalTree(false));
            const tree=this.originalEdgePresence.get(edge);
            this.simplifiedNodePresence.set(edge,tree.getAllIntervals(tree.root))
        }
    }
    
    isPresentInInterval(node,interval){
        for(presence of this.simplifiedNodePresence.get(node)){
            if(interval.start <= presence.end && presence.start <= interval.end){
                return true
            }
        }
        return false;

    }
}