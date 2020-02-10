import { NodeId } from './node';
import _ from 'lodash';

export type EdgeId = string;

export type RawEdge<ED> = {
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
export class Edge<ED> {
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
        attr: _.toString(this.attr)
      }
    );
  }

  fromString(json: string) {
    const obj = JSON.parse(json);
    return new Edge(obj.sourceId, obj.targetId, obj.attr);
  }

  static fromObject<ED>(object: RawEdge<ED>) {
    return new Edge(object.sourceId, object.targetId, object.attr);
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
