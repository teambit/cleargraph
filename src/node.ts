import { isEqual } from 'lodash';
import { EdgeId } from './edge';
import _ from 'lodash';

export type NodeId = string;

export class Node<VD> {
  readonly id: NodeId;
  readonly attr: VD;
  _inEdges: EdgeId[];
  _outEdges: EdgeId[];
  constructor(
    id: NodeId, 
    attr: VD,
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

  equals(node: Node<VD>) {
    if (this.id !== node.id) return false;
    return isEqual(this.attr, node.attr);
  }

  static fromObject<VD>(object: { id: NodeId; attr: VD }) {
    return new Node(object.id, object.attr);
  }
}
