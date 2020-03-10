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

  stringify() {
    let attrStr: string = '';
    if (!!this.attr['stringify'] && typeof this.attr['stringify'] === 'function'){
      //@ts-ignore
      attrStr = this.attr.stringify();
    }
    else{
      attrStr = JSON.stringify(this.attr);
    }
    return attrStr;
  }

  static fromObject(obj:{ sourceId: string, targetId: string, edge: any }) {
    if(!obj.hasOwnProperty('sourceId')){
      throw Error('missing source id')
    }
    if(!obj.hasOwnProperty('targetId')){
      throw Error('missing target id')
    }
    return {sourceId: obj.sourceId, targetId: obj.targetId, edge: obj.edge};
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
