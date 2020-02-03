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
   * set a new edge on the graphor override existing node with the same source and target keys
   */
  setEdge(edge: Edge<ED>): Graph<ND, ED> {
    this.edges[Edge.edgeId(edge.sourceId, edge.targetId)] = edge;
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
  setNodes(nodes: Node<ND>[]) {
    nodes.forEach(node => this.setNode(node));
    return this;
  }

  /**
   * determines whether a node exists on the graph.
   */
  hasNode(id: NodeId) {
    return !!this._nodes[id];
  }

  /**
   * determine whether an edge exists on the graph.
   */
  hasEdge(sourceId: NodeId, targetId: NodeId) {
    return !!this._edges[Edge.edgeId(sourceId, targetId)];
  }

  /**
   * get a node from the graph by its ID.
   */
  node(id: NodeId): Node<ND> {
    return _.get(this._nodes, id);
  }

  /**
   * get an edge from the graph by its ID.
   */
  edge(id: string) {
    return _.get(this._edges, id);
  }

  /**
   * get all nodes in the graph.
   */
  allNodes(){
    return this._nodes;
  }

  /**
   * get all edges in the graph.
   */
  allEdges(){
    return this._edges;
  }

  /**
   * return the number of nodes in the graph.
   */
  nodeCount(){
    return Object.keys(this._nodes).length;
  }

  /**
   * return the number of edges in the graph.
   */
  edgeCount(){
    return Object.keys(this._edges).length;
  }

  /**
   * delete a single node by id if exists. Note that all edges to and from this node will also be deleted.
   */
  deleteNode(id: NodeId):void{
    const node = this.node(id)
    if(typeof(node) === 'undefined') return;
    node.nodeEdges.forEach((edgeId: EdgeId) => {
      this._deleteEdgeById(edgeId);
    });
    delete this._nodes[id];
  }

  /**
   * delete a single edge by source and target ids if exist.
   */
  deleteEdge(sourceId: string, targetId: string):void{
    const edgeId = Edge.edgeId(sourceId, targetId);
    const edge = this.edge(edgeId);
    if(typeof(edge) === 'undefined') return;
    delete this._edges[edgeId]
  }

  /**
   * delete a single edge by its internal id.
   */
  _deleteEdgeById(id:EdgeId):void {
    const edge = this.edge(id);
    if(typeof(edge) === 'undefined') return;
    delete this._edges[id]
  }


  successors(node: Node<ND>): Node<ND>[] {
    return this.edges
      .filter((edge) => edge.sourceId === node.id)
      .map(edge => this.node(edge.targetId));
  }


  successorsSubgraph(node: Node<ND>) {
    // const successors = this.successors(node);
    // return this.subgraph(() => {}, () => {});
  }

  /**
   * traverse the graph.
   */
  getSuccessors(node: Node<ND>, visitor: () => void) {
    this.successors
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
