import { Node, NodeId } from './node';
import { Edge, RawEdge, EdgeId } from './edge';
import { Toposort, distinct, StrAMethods } from './toposort';

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
    this.nodes.forEach(node => this.setnode(node));
    this.edges.forEach(edge => this.setEdge(edge));
  }

  private _nodes = new Map<NodeId, Node<ND>>();
  private _edges = new Map<string, Edge<ED>>();

  private nodeIndex = new Map<NodeId, Node<ND>>();
  private edgeIndex = new Map<EdgeId, Edge<ED>>();

  /**
   * set a node on the graph.
   */
  setnode(node: Node<ND>): Graph<ND, ED> {
    if (this._nodes[node.id]) return this;
    this._nodes[node.id] = node;
    return this;
  }

  /**
   * set an edge on the graph.
   */
  setEdge(edge: Edge<ED>): Graph<ND, ED> {
    if (this._edges[edge.id]) return this;
    this.edges[edge.id] = edge;
    // this.srcIndex[edge.sourceId] = edge;
    // this.dstIndex[edge.targetId] = edge;
    return this;
  }

  /**
   * set multiple edges on the graph.
   */
  setEdges(edges: Edge<ED>[]) {
    edges.forEach(edge => this.setEdge(edge));
    return this;
  }

  /**
   * set multiple nodes on the graph.
   */
  setnodes(nodes: Node<ND>[]) {
    nodes.forEach(node => this.setnode(node));
    return this;
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

  /**
   * determines whether a node exists on the graph.
   */
  hasnode(node: Node<ND>) {
    return !!this._nodes[node.id];
  }

  /**
   * determine whether an edge exists on the graph.
   */
  hasEdge(edge: Edge<ED>) {
    return !!this._edges[edge.id];
  }

  successors(node: Node<ND>): Node<ND>[] {
    return this.edges
      .filter((edge) => edge.sourceId === node.id)
      .map(edge => this.node(edge.targetId));
  }

  /**
   * get a node from the graph by its ID.
   */
  node(id: NodeId): Node<ND> {
    return this._nodes[id];
  }

  /**
   * get an edge from the graph by its ID.
   */
  edge(id: string) {
    return this._edges[id];
  }

//   subgraph(nodesPredicate: (node: node<ND>) => boolean, edgePredicate: (edge: Edge<ND>) => boolean): Graph<ED, ND> {

//   }

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
}
