import {Interval,IntervalTree}from "../intervalTree/intervalTree.js"
import { DyGraph } from "./Dygraph.js"
export class DiscretisationData{
    constructor(graph){
        this.original=graph;
        this.discrete=new DyGraph();
        this.originalNodePresence=this.original.nodeAttributes['appearance'];
        this.originalEdgePresence=this.original.edgeAttributes['appearance'];
        this.discreteNodePresence=this.discrete.nodeAttributes['appearance'];
        this.discreteEdgePresence=this.discrete.edgeAttributes['appearance'];
        this.originalNodePosition=this.original.nodeAttributes['nodePosition'];
        this.discreteNodePosition=this.discrete.nodeAttributes['nodePosition'];
        this.simplifiedNodePresence=new Map();
        this.simplifiedEdgePresence=new Map();
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
            this.simplifiedEdgePresence.set(edge,tree.getAllIntervals(tree.root))
        }
    }
    
    isPresentInIntervalNode(node,interval){
        for(const presence of this.simplifiedNodePresence.get(node)){
            if(interval.start <= presence.end && presence.start <= interval.end){
                return true
            }
        }
        return false;

    }
    isPresentInIntervalEdge(edge,interval){
        for(const presence of this.simplifiedEdgePresence.get(edge)){
            if(interval.start <= presence.end && presence.start <= interval.end){
                return true
            }
        }
        return false;

    }
}