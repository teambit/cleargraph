import { Node, NodeId } from './node';
import { Edge, RawEdge, EdgeId } from './edge';
import { Toposort, distinct, StrAMethods } from './toposort';
import _ from 'lodash';

/**
 * The Graph abstractly represents a graph with arbitrary objects
 * associated with nodes and edges. The graph provides basic
 * operations to access and manipulate the data associated with
 * nodes and edges as well as the underlying structure.
 *
 * @tparam ND the node attribute type
 * @tparam ED the edge attribute type
 */

export class Graph<ND, ED> {

  constructor(
    /**
     * array of graph nodes.
     */
    nodes: Node<ND>[] = [],
    /**
     * array of graph edges.
     */
    edges: Edge<ED>[] = []
  ) {
    nodes.forEach(node => this.setNode(node));
    edges.forEach(edge => this.setEdge(edge));
  }

  private _nodes = new Map<NodeId, Node<ND>>();
  private _edges = new Map<EdgeId, Edge<ED>>();

  /**
   * set a new node on the graph or override existing node with the same key
   */
  setNode(node: Node<ND>): Graph<ND, ED> {
    this._nodes.set(node.id, node);
    return this;
  }

  /**
   * set a new edge on the graph or override existing edge with the same source and target keys.
   */
  setEdge(edge: Edge<ED>): Graph<ND, ED> {
    const id = Edge.edgeId(edge.sourceId, edge.targetId);
    this._edges.set(id, edge);
    if(this._nodes.has(edge.sourceId)) {
      let sourceNode = this._nodes.get(edge.sourceId);
      if(sourceNode !== undefined){
        sourceNode.setOutEdge(id);
      }
    }
    else {
      throw Error('source node does not exist')
    }
    if(this._nodes.has(edge.targetId)){
      let targetNode = this._nodes.get(edge.targetId);
      if(targetNode !== undefined){
        targetNode.setInEdge(id);
      }
    }
    else {
      throw Error('target node does not exist')
    }
    return this;
  }

  /**
   * set multiple edges on the graph.
   */
  setEdges(edges: Edge<ED>[]): Graph<ND, ED> {
    edges.forEach(edge => this.setEdge(edge));
    return this;
  }

  /**
   * set multiple nodes on the graph.
   */
  setNodes(nodes: Node<ND>[]): Graph<ND, ED>  {
    nodes.forEach(node => this.setNode(node));
    return this;
  }

  /**
   * determines whether a node exists on the graph.
   */
  hasNode(id: NodeId): boolean {
    return this._nodes.has(id);
  }

  /**
   * determine whether an edge exists on the graph.
   */
  hasEdge(sourceId: NodeId, targetId: NodeId): boolean {
    return this._edges.has(Edge.edgeId(sourceId, targetId));
  }

  /**
   * get a node from the graph by its ID. Undefined if id is not in graph.
   */
  node(id: NodeId): Node<ND> | undefined{
    return this._nodes.get(id);
  }

  /**
   * get an edge from the graph by its ID. Undefined if id is not in graph.
   */
  edge(sourceId: string, targetId: string): Edge<ED> | undefined {
    return this._edges.get(Edge.edgeId(sourceId, targetId));
  }

  /**
   * get all nodes in the graph.
   */
  allNodes(): Map<NodeId, Node<ND>>{
    return this._nodes;
  }

  /**
   * get all edges in the graph.
   */
  allEdges(): Map<EdgeId, Edge<ED>>{
    return this._edges;
  }

  /**
   * return the number of nodes in the graph.
   */
  nodeCount(): number{
    return [...this._nodes.keys()].length;
  }

  /**
   * return the number of edges in the graph.
   */
  edgeCount(): number{
    return [...this._edges.keys()].length;
  }

  /**
   * delete a single node by id if exists. Note that all edges to and from this node will also be deleted.
   */
  deleteNode(id: NodeId): void{
    const node = this.node(id);
    if(typeof(node) === 'undefined') return;
    node.nodeEdges.forEach((edgeId: EdgeId) => {
      const { sourceId, targetId } = Edge.parseEdgeId(edgeId);
      this.deleteEdge(sourceId, targetId);
    });
    this._nodes.delete(id);
  }

  /**
   * delete a single edge by source and target ids if exist.
   */
  deleteEdge(sourceId: string, targetId: string): void{
    const edgeId = Edge.edgeId(sourceId, targetId);
    const edge = this._edges.get(edgeId);
    if(edge !== undefined){
      let sourceNode = this._nodes.get(sourceId);
      if(sourceNode !== undefined){
        sourceNode.deleteEdge(edgeId);
      }
      let targetNode = this._nodes.get(targetId);
      if(targetNode !== undefined){
        targetNode.deleteEdge(edgeId);
      }
    }
    this._edges.delete(edgeId)
  }

  inEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (node === undefined) return newEdges;
    node.inEdges.forEach(edgeId => {
      let { sourceId, targetId } = Edge.parseEdgeId(edgeId)
      let edge = this.edge(sourceId, targetId);
      if(edge !== undefined){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  outEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (node === undefined) return newEdges;
    node.outEdges.forEach(edgeId => {
      let { sourceId, targetId } = Edge.parseEdgeId(edgeId)
      let edge = this.edge(sourceId, targetId);
      if(edge !== undefined){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  nodeEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (node === undefined) return newEdges;
    node.nodeEdges.forEach(edgeId => {
      let { sourceId, targetId } = Edge.parseEdgeId(edgeId)
      let edge = this.edge(sourceId, targetId);
      if(edge !== undefined){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  immediateSuccessors(nodeId: NodeId, filterPredicate: (edge: Edge<ED>) => boolean = returnTrue): Map<NodeId, Node<ND>>{
    let successors = new Map<NodeId, Node<ND>>();
    const node = this.node(nodeId);
    if (node === undefined) return successors;
    node.outEdges.forEach(edgeId => {
      const edge = this._edges.get(edgeId);
      if(edge != undefined && filterPredicate(edge))
      {  const { sourceId, targetId } = Edge.parseEdgeId(edgeId);
        const targetNode = this.node(targetId);
        if(!!targetId && targetNode !== undefined){
          successors.set(targetId, targetNode);
        }
      }
    });
    return successors; 
  }

  immediatePredecessors(nodeId: NodeId, filterPredicate: (edge: Edge<ED>) => boolean = returnTrue): Map<NodeId, Node<ND>>{
    let predecessors = new Map<NodeId, Node<ND>>();
    const node = this.node(nodeId);
    if (node === undefined) return predecessors;
    node.inEdges.forEach(edgeId => {
      const edge = this._edges.get(edgeId);
      if(edge != undefined && filterPredicate(edge))
      {  const { sourceId, targetId } = Edge.parseEdgeId(edgeId);
        const sourceNode = this.node(sourceId);
        if(!!sourceId && sourceNode !== undefined){
          predecessors.set(sourceId, sourceNode);
        }
      }
    });
    return predecessors; 
  }

  neighbors(nodeId: NodeId): Map<NodeId, Node<ND>>{
    let neighbors = new Map([...this.immediatePredecessors(nodeId), ...this.immediateSuccessors(nodeId)]);
    return neighbors;
  }

  successorsSubgraph(node: Node<ND>, filterPredicate: (edge: Edge<ED>) => boolean = returnTrue): Graph<ND, ED>{
    let g = new Graph<ND,ED>()
    g.setNode(node)
    return this._successorsSubgraphUtil(node.id, g, {}, filterPredicate)
  }

  _successorsSubgraphUtil(nodeId: NodeId, successorsGraph: Graph<ND,ED>, visited: { [key: string]: boolean } = {}, filterPredicate: (data: Edge<ED>) => boolean = returnTrue): Graph<ND, ED> {
    const successors = [...this.immediateSuccessors(nodeId, filterPredicate).keys()] || [];
        if (successors.length > 0 && !visited[nodeId]) {
            successors.forEach((successor:string) => {
                visited[nodeId] = true;
                const newNode = this._nodes.get(successor);
                const newEdge = this._edges.get(Edge.edgeId(nodeId, successor));
                if(newNode !== undefined && newEdge != undefined){
                  successorsGraph.setNode(newNode);
                  successorsGraph.setEdge(newEdge);
                  return this._successorsSubgraphUtil(successor, successorsGraph, visited, filterPredicate);
                }
              });
        }
        return successorsGraph;
  }

  successorsArray(){

  }

  successorsLayers(){

  }

  predecessorsSubgraph(node: Node<ND>, filterPredicate: (edge: Edge<ED>) => boolean = returnTrue): Graph<ND, ED>{
    let g = new Graph<ND,ED>()
    g.setNode(node)
    return this._predecessorsSubgraphUtil(node.id, g, {}, filterPredicate)
  }

  _predecessorsSubgraphUtil(nodeId: NodeId, predecessorsGraph: Graph<ND,ED>, visited: { [key: string]: boolean } = {}, filterPredicate: (data: Edge<ED>) => boolean = returnTrue): Graph<ND, ED> {
    const predecessors = [...this.immediatePredecessors(nodeId, filterPredicate).keys()] || [];
        if (predecessors.length > 0 && !visited[nodeId]) {
            predecessors.forEach((predecessor:string) => {
                visited[nodeId] = true;
                const newNode = this._nodes.get(predecessor);
                const newEdge = this._edges.get(Edge.edgeId(predecessor, nodeId));
                if(newNode !== undefined && newEdge != undefined){
                  predecessorsGraph.setNode(newNode);
                  predecessorsGraph.setEdge(newEdge);
                  return this._predecessorsSubgraphUtil(predecessor, predecessorsGraph, visited, filterPredicate);
                }
              });
        }
        return predecessorsGraph;
  }

  predecessorsArray(){

  }

  predecessorsLayers(){

  }

  findCycles(){

  }

  isCyclic(){

  }


  /**
   * serialize the graph to a json.
   */
  toString() {
    return 
  }

  
  /**
   * topologically sort the graph as an array.
   */
  // topologicallySort(): Node<ND>[] {
  //   const edges = this._edges.map((edge: Edge<ED>) => [edge.sourceId, edge.targetId]);

  //   const ids = distinct(
  //     // @ts-ignore
  //     Toposort<string[]>(edges, new StrAMethods())
  //       .map(node => node[0])
  //       .reverse()
  //   );

  //   // @ts-ignore
  //   return ids.map(id => this._nodes.find(node => node.id === id)).filter(_ => _ !== undefined);
  //   // :TODO performance can be highly optimized in this area
  // }

  //   subgraph(nodesPredicate: (node: node<ND>) => boolean, edgePredicate: (edge: Edge<ND>) => boolean): Graph<ED, ND> {

//   }

}

function returnTrue(){ return true; }
