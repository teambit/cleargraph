import { NodeId } from './node';
import _ from 'lodash';
import { Serializable } from './index';

export type EdgeId = string;

export type RawEdge<ED extends Serializable> = {
  sourceId: NodeId, 
  targetId: NodeId, 
  attr: ED
}

/**
 * A single directed edge consisting of a source id, target id,
 * and the data associated with the edge.
 *
 * @tparam ED type of the edge attribute
 *
 * @param srcId The vertex id of the source vertex
 * @param dstId The vertex id of the target vertex
 * @param attr The attribute associated with the edge
 */
export class Edge<ED extends Serializable> {
  constructor(readonly sourceId: NodeId, readonly targetId: NodeId, readonly attr: ED) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.attr = attr;
  }

  toString() {
    return JSON.stringify(
      {
        sourceId: this.sourceId,
        targetId: this.targetId, 
        attr: this.attr.toString()
      }
    );
  }

  static fromObject(obj:{ sourceId: string, targetId: string, attr: any }): Edge<ED> {
    return new Edge(obj.sourceId, obj.targetId, obj.attr);
  }

  static fromString(json: string): Edge<ED> {
    const obj = JSON.parse(json);
    return new Edge(obj.sourceId, obj.targetId, obj.attr);
  }

  static edgeId(sourceId: NodeId, targetId: NodeId): EdgeId {
    return `${sourceId}->${targetId}`;
  }

  static parseEdgeId(id: EdgeId): {sourceId: NodeId, targetId: NodeId} {
    const spl = id.split("->");
    if(spl.length === 2){
      return {sourceId: spl[0], targetId:spl[1]}
    }
    return {sourceId:'', targetId:''}
  }

  get nodes() {
    return [this.sourceId, this.targetId];
  }
}
