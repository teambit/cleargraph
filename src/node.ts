import { isEqual } from 'lodash';
import { EdgeId } from './edge';
import _ from 'lodash';


export type NodeId = string;

export class GraphNode<N> {
  id: NodeId;
  attr: N;
  _inEdges: EdgeId[];
  _outEdges: EdgeId[];
  constructor(
    id: NodeId, 
    attr: N,
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

  /**
   * return true if node has only out edges
   */
  isSource(): boolean { 
    return (this._inEdges.length === 0 && this._outEdges.length > 0)
  }

  /**
   * return true if node has only in edges
   */
  isSink(): boolean {
    return (this._inEdges.length > 0 && this._outEdges.length === 0)
  }

  equals(node: GraphNode<N>) {
    if (this.id !== node.id) return false;
    return isEqual(this.attr, node.attr);
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
        id: this.id, 
        attr: attrStr
      }
    );
  }

  static fromObject(obj:{ id: string, attr: any }) {
    return new GraphNode(obj.id, obj.attr);
  }

  static fromString(json: string) {
    const obj = JSON.parse(json);
    return new GraphNode(obj.id, obj.attr);
  }

}
