import { NodeId } from './node';
import _ from 'lodash';

export type EdgeId = string;

export type RawEdge<E> = {
  sourceId: NodeId, 
  targetId: NodeId, 
  attr: E
}

/**
 * A single directed edge consisting of a source id, target id,
 * and the data associated with the edge.
 *
 * @tparam E type of the edge attribute
 *
 * @param srcId The vertex id of the source vertex
 * @param dstId The vertex id of the target vertex
 * @param attr The attribute associated with the edge
 */
export class GraphEdge<E> {
  constructor(readonly sourceId: NodeId, readonly targetId: NodeId, readonly attr: E) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.attr = attr;
  }

  toString() {
    let attrStr: string = '';
    if (!!this.attr['toString'] && typeof this.attr['toString'] === 'function'){
      //@ts-ignore
      attrStr = this.attr.toString();
    }
    else{
      attrStr = JSON.stringify(this.attr);
    }
    return JSON.stringify(
      {
        sourceId: this.sourceId,
        targetId: this.targetId, 
        attr: attrStr
      }
    );
  }

  static fromObject(obj:{ sourceId: string, targetId: string, attr: any }) {
    return new GraphEdge(obj.sourceId, obj.targetId, obj.attr);
  }

  static fromString(json: string) {
    const obj = JSON.parse(json);
    return new GraphEdge(obj.sourceId, obj.targetId, obj.attr);
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
