import { isEqual } from 'lodash';
import { EdgeId } from './edge';
import _ from 'lodash';
import { Serializable } from './index';

export type NodeId = string;

export class Node<ND extends Serializable> {
  id: NodeId;
  attr: ND;
  _inEdges: EdgeId[];
  _outEdges: EdgeId[];
  constructor(
    id: NodeId, 
    attr: ND,
    inEdges?: EdgeId[],
    outEdges?: EdgeId[]
    
  ) {
    this.id = id;
    this.attr = attr;
    this._inEdges = inEdges || []
    this._outEdges = outEdges || []
  }

  setInEdge(edgeId: EdgeId){
    this._inEdges.push(edgeId)
  }

  setOutEdge(edgeId: EdgeId){
    this._outEdges.push(edgeId)
  }

  deleteEdge(edgeId: EdgeId){
    _.remove(this._inEdges, function(edge){
      return edge === edgeId
    })
    _.remove(this._outEdges, function(edge){
      return edge === edgeId
    })
  }

  get inEdges(): EdgeId[] {
    return this._inEdges
  }

  get outEdges(): EdgeId[] {
    return this._outEdges
  }

  get nodeEdges(): EdgeId[] {
    return this._inEdges.concat(this._outEdges)
  }

  equals(node: Node<ND>) {
    if (this.id !== node.id) return false;
    return isEqual(this.attr, node.attr);
  }

  toString() {
    return JSON.stringify(
      {
        id: this.id, 
        attr: this.attr.toString()
      }
    );
  }

  static fromObject(obj:{ id: string, attr: any }) {
    return new Node(obj.id, obj.attr);
  }

  static fromString(json: string) {
    const obj = JSON.parse(json);
    return new Node(obj.id, obj.attr);
  }

}
