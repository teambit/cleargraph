import { NodeId } from './node';

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

  static fromObject<ED>(object: RawEdge<ED>) {
    return new Edge(object.sourceId, object.targetId, object.attr);
  }

  get id(): EdgeId {
    return `${this.sourceId}_${this.targetId}`;
  }

  get nodes() {
    return [this.sourceId, this.targetId];
  }
}
