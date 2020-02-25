import { Graph } from './index'
import _ from 'lodash';


export function toJson(graph: Graph<any, any>){
    let nodesJson = {};
    for (let [nodeId, nodeData] of graph.nodes.entries()) {
      nodesJson[nodeId] = nodeData.toString();
    }
    let edgesJson = {};
    for (let [edgeId, edgeData] of graph.edges.entries()) {
      edgesJson[edgeId] = edgeData.toString();
    }
    let json = {
        nodes: nodesJson,
        edges: edgesJson
      };
    return JSON.stringify(json);
}


