import { NodeId } from "./index";

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
    constructor(readonly sourceKey: NodeId, readonly targetKey: NodeId, readonly data: ED) {}
  
    static fromObject<ED>(object: RawEdge<ED>) {
      return new Edge(object.sourceKey, object.targetKey, object.data);
    }
  
    get id(): string {
      return `${this.sourceKey}_${this.targetKey}`;
    }
  }
  
  export type RawEdge<ED> = {
    sourceKey: NodeId;
    targetKey: NodeId;
    data: ED;
  };