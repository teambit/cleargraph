import { Graph } from './index'
import _ from 'lodash';


export function toJson(graph: Graph<any, any>){
    let nodes = graph.nodes;

    let json = {
        nodes: graph.nodes.map(node => node.toString()),
        edges: graph.edges.map(edge => edge.toString())
      };
      return JSON.stringify(json);
}


