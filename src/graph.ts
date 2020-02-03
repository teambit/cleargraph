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

export default class Graph<ND, ED> {

  constructor(
    /**
     * array of graph edges.
     */
    readonly edges: Edge<ED>[] = [], 

    /**
     * array of graph nodes.
     */
    readonly nodes: Node<ND>[] = []
  ) {
    this.nodes.forEach(node => this.setNode(node));
    this.edges.forEach(edge => this.setEdge(edge));
  }

  private _nodes = new Map<NodeId, Node<ND>>();
  private _edges = new Map<EdgeId, Edge<ED>>();

  /**
   * set a new node on the graph or override existing node with the same key
   */
  setNode(node: Node<ND>): Graph<ND, ED> {
    this._nodes[node.id] = node;
    return this;
  }

  /**
   * set a new edge on the graph or override existing edge with the same source and target keys.
   */
  setEdge(edge: Edge<ED>): Graph<ND, ED> {
    const id = Edge.edgeId(edge.sourceId, edge.targetId);
    this.edges[id] = edge;
    this.nodes[edge.sourceId].setOutEdge(id);
    this.nodes[edge.targetId].setInEdge(id);
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
    return !!this._nodes[id];
  }

  /**
   * determine whether an edge exists on the graph.
   */
  hasEdge(sourceId: NodeId, targetId: NodeId): boolean {
    return !!this._edges[Edge.edgeId(sourceId, targetId)];
  }

  /**
   * get a node from the graph by its ID. Undefined if id is not in graph.
   */
  node(id: NodeId): Node<ND> | undefined{
    return _.get(this._nodes, id);
  }

  /**
   * get an edge from the graph by its ID. Undefined if id is not in graph.
   */
  edge(id: string): Edge<ED> | undefined {
    return _.get(this._edges, id);
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
    return Object.keys(this._nodes).length;
  }

  /**
   * return the number of edges in the graph.
   */
  edgeCount(): number{
    return Object.keys(this._edges).length;
  }

  /**
   * delete a single node by id if exists. Note that all edges to and from this node will also be deleted.
   */
  deleteNode(id: NodeId): void{
    const node = this.node(id);
    if(typeof(node) === 'undefined') return;
    node.nodeEdges.forEach((edgeId: EdgeId) => {
      this._deleteEdgeById(edgeId);
    });
    delete this._nodes[id];
  }

  /**
   * delete a single edge by source and target ids if exist.
   */
  deleteEdge(sourceId: string, targetId: string): void{
    this._deleteEdgeById(Edge.edgeId(sourceId, targetId));
  }

  /**
   * delete a single edge by its internal id.
   */
  _deleteEdgeById(id:EdgeId): void {
    const edge = this.edge(id);
    if(typeof(edge) === 'undefined') return;
    const { sourceId, targetId } = Edge.parseEdgeId(id);
    if(sourceId in this._nodes){
      this._nodes[sourceId].deleteEdge(id);
    }
    if(targetId in this._nodes){
      this._nodes[targetId].deleteEdge(id);
    }
    delete this._edges[id];
  }

  inEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (typeof(node) === 'undefined') return newEdges;
    node.inEdges.forEach(edgeId => {
      let edge = this.edge(edgeId);
      if(typeof edge !== 'undefined'){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  outEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (typeof(node) === 'undefined') return newEdges;
    node.outEdges.forEach(edgeId => {
      let edge = this.edge(edgeId);
      if(typeof edge !== 'undefined'){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  nodeEdges(nodeId: NodeId): Map<EdgeId, Edge<ED>>{
    let newEdges = new Map<EdgeId, Edge<ED>>();
    const node = this.node(nodeId);
    if (typeof(node) === 'undefined') return newEdges;
    node.nodeEdges.forEach(edgeId => {
      let edge = this.edge(edgeId);
      if(typeof edge !== 'undefined'){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  immediateSuccessors(nodeId: NodeId): Map<NodeId, Node<ND>>{
    let successors = new Map<NodeId, Node<ND>>();
    const node = this.node(nodeId);
    if (typeof(node) === 'undefined') return successors;
    node.outEdges.forEach(edgeId => {
      const { sourceId, targetId } = Edge.parseEdgeId(edgeId);
      const targetNode = this.node(targetId);
      if(!!targetId && typeof(targetNode) !== 'undefined'){
        successors.set(targetId, targetNode);
      }
    });
    return successors; 
  }

  immediatePredecessors(nodeId: NodeId): Map<NodeId, Node<ND>>{
    let predecessors = new Map<NodeId, Node<ND>>();
    const node = this.node(nodeId);
    if (typeof(node) === 'undefined') return predecessors;
    node.inEdges.forEach(edgeId => {
      const { sourceId, targetId } = Edge.parseEdgeId(edgeId);
      const sourceNode = this.node(sourceId);
      if(!!sourceId && typeof(sourceNode) !== 'undefined'){
        predecessors.set(targetId, sourceNode);
      }
    });
    return predecessors; 
  }

  neighbors(nodeId: NodeId): Map<NodeId, Node<ND>>{
    return Object.assign(this.immediatePredecessors(nodeId), this.immediateSuccessors(nodeId))
  }


  successorsSubgraph(node: Node<ND>) {
    // const successors = this.successors(node);
    // return this.subgraph(() => {}, () => {});
  }


  /**
   * serialize the graph to a json.
   */
  toString() {
    return 
  }

  /**
   * build graph from an array of edges.
   */
  static fromEdges<ND, ED>(rawEdges: RawEdge<ED>[]) {
    const edges = rawEdges.map(rawEdge => Edge.fromObject(rawEdge));
    const nodes = edges
      .flatMap(edge => edge.nodes)
      .map(rawnode => Node.fromObject({ id: rawnode, attr: {} }));

    return new Graph(edges, nodes);
  }

  /**
   * topologically sort the graph as an array.
   */
  topologicallySort(): Node<ND>[] {
    const edges = this.edges.map((edge: Edge<ED>) => [edge.sourceId, edge.targetId]);

    const ids = distinct(
      // @ts-ignore
      Toposort<string[]>(edges, new StrAMethods())
        .map(node => node[0])
        .reverse()
    );

    // @ts-ignore
    return ids.map(id => this.nodes.find(node => node.id === id)).filter(_ => _ !== undefined);
    // :TODO performance can be highly optimized in this area
  }

  //   subgraph(nodesPredicate: (node: node<ND>) => boolean, edgePredicate: (edge: Edge<ND>) => boolean): Graph<ED, ND> {

//   }

}
