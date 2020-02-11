import { Node, NodeId } from './index';
import { Edge, EdgeId } from './index';
import { CyclicError } from './index'
import _ from 'lodash';
import { tarjan } from './algorithms';
import { toJson } from './json';
import { Serializable } from './serializable';

/**
 * Graph abstractly represents a graph with arbitrary objects
 * associated with nodes and edges. The graph provides basic
 * operations to access and manipulate the data associated with
 * nodes and edges as well as the underlying structure.
 *
 * @tparam ND the node attribute type
 * @tparam ED the edge attribute type
 */

export class Graph<ND extends Serializable, ED extends Serializable> {

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
   * @param node a node with a generic data type ND
   */
  setNode(node: Node<ND>): Graph<ND, ED> {
    this._nodes.set(node.id, node);
    return this;
  }

  /**
   * set a new edge on the graph or override existing edge with the same source and target keys.
   * @param edge an edge with a generic data type ED
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
   * @param edges 
   */
  setEdges(edges: Edge<ED>[]): Graph<ND, ED> {
    edges.forEach(edge => this.setEdge(edge));
    return this;
  }

  /**
   * set multiple nodes on the graph.
   * @param nodes
   */
  setNodes(nodes: Node<ND>[]): Graph<ND, ED>  {
    nodes.forEach(node => this.setNode(node));
    return this;
  }

  /**
   * determine whether a node exists on the graph.
   * @param id the node id - string
   */
  hasNode(id: NodeId): boolean {
    return this._nodes.has(id);
  }

  /**
   * determine whether an edge exists on the graph.
   * @param sourceId the source node id (string)
   * @param targetId the target node id (string)
   */
  hasEdge(sourceId: NodeId, targetId: NodeId): boolean {
    return this._edges.has(Edge.edgeId(sourceId, targetId));
  }

  /**
   * get a node from the graph by its ID. Undefined if id is not in graph.
   * @param id the id of the node - string
   */
  node(id: NodeId): Node<ND> | undefined{
    return this._nodes.get(id);
  }

  /**
   * get an edge from the graph by its ID. Undefined if id is not in graph.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   */
  edge(sourceId: string, targetId: string): Edge<ED> | undefined {
    return this._edges.get(Edge.edgeId(sourceId, targetId));
  }

  /**
   * return an array of all Node objects in the graph.
   */
  get nodes() {
    return [...this._nodes.values()];
  }

  /**
   * return an array of all Edge objects in the graph.
   */
  get edges() {
    return [...this._edges.values()];
  }


  /**
   * get all nodes in the graph.
   */
  nodesMap(): Map<NodeId, Node<ND>>{
    return this._nodes;
  }

  /**
   * get all edges in the graph.
   */
  edgesMap(): Map<EdgeId, Edge<ED>>{
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
   * @param id the id of the node to be deleted
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
   * @param sourceId the id of the source node of the edge to be deleted
   * @param targetId the id of the target node of the edge to be deleted
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

  /**
   * return a map of all <edgeId, edge> that point to the given node.
   * @param nodeId
   */
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

  /**
   * return a map of all <edgeId, edge> that point from the given node to other nodes.
   * @param nodeId 
   */
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

  /**
   * return a map of all <edgeId, edge> that point to or from the given node.
   * @param nodeId
   */
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

  /**
   * return a map of all <nodeId, node> that are immediately pointed to by the given node.
   * @param nodeId the id of the source node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
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

  /**
   * return a map of all <nodeId, node> that point to by the given node.
   * @param nodeId the id of the target node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
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

  /**
   * return a map of all <nodeId, node> that are directly or indirectly connected to the given node.
   * @param nodeId the id of the node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  neighbors(nodeId: NodeId): Map<NodeId, Node<ND>>{
    let neighbors = new Map([...this.immediatePredecessors(nodeId), ...this.immediateSuccessors(nodeId)]);
    return neighbors;
  }

  /**
   * return a sub-graph of all the nodes and edges that are recursively successors of the given node.
   * @param node the source node of the sub-graph required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
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

  /**
   * return an array of all the nodes that are recursively successors of the given node (that the given node points to).
   * @param node the source node of the successor array required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  successorsArray(node: Node<ND>, filterPredicate: (data: Edge<ED>) => boolean = returnTrue): Node<ND>[]{
    const successorIds = _.uniq(this._successorsArrayUtil(node.id, [], {}, filterPredicate));
    let successors: Node<ND>[] = []
    successorIds.forEach((id:NodeId) => {
      let node = this.node(id);
      if (node != undefined){
        successors.push(node);
      }
    });
    return successors;
  }

  _successorsArrayUtil(nodeId: string,
                       successorsList: string[] = [],
                       visited: { [key: string]: boolean } = {},
                       filterPredicate: (data: Edge<ED>) => boolean = returnTrue): NodeId[]{  
        const successors = [...this.immediateSuccessors(nodeId, filterPredicate).keys()] || [];
        if (successors.length > 0 && !visited[nodeId]) {
            successors.forEach((successor:string) => {
            visited[nodeId] = true;
            successorsList.push(successor);
            return this._successorsArrayUtil(successor, successorsList, visited, filterPredicate);
            });
        }
    return successorsList;
    }

  /**
   * return a sub-graph of all the nodes and edges that are recursively predecessors (point to) of the given node.
   * @param node the target node of the sub-graph required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
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

  /**
   * return an array of all the nodes that are recursively predecessors of the given node (that point to the given node).
   * @param node the source node of the predecessor array required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  predecessorsArray(node: Node<ND>, filterPredicate: (data: Edge<ED>) => boolean = returnTrue): Node<ND>[]{
    const predecessorIds = _.uniq(this._predecessorsArrayUtil(node.id, [], {}, filterPredicate));
    let predecessors: Node<ND>[] = []
    predecessorIds.forEach((id:NodeId) => {
      let node = this.node(id);
      if (node != undefined){
        predecessors.push(node);
      }
    });
    return predecessors;
  }

  _predecessorsArrayUtil(nodeId: string,
                       predecessorsList: string[] = [],
                       visited: { [key: string]: boolean } = {},
                       filterPredicate: (data: Edge<ED>) => boolean = returnTrue): NodeId[]{  
        const predecessors = [...this.immediatePredecessors(nodeId, filterPredicate).keys()] || [];
        if (predecessors.length > 0 && !visited[nodeId]) {
            predecessors.forEach((predecessor:string) => {
            visited[nodeId] = true;
            predecessorsList.push(predecessor);
            return this._predecessorsArrayUtil(predecessor, predecessorsList, visited, filterPredicate);
            });
        }
    return predecessorsList;
    }

  /**
   * A topological sort of the graph
   * @param initialNodes An optional param that enables to get topological sorting only on specific nodes in the graph 
   */
  toposort(initialNodes?: NodeId[]){
    let res = this._toposort();
    if(!initialNodes){
      return res;
    }
    return res.filter(id =>initialNodes.includes(id));
  }

  _transformEdges(){
    let edges: string [][] = [];
    this._edges.forEach(originalEdge => {
      edges.push([originalEdge.sourceId, originalEdge.targetId])
    });
    return edges;
  }

  _toposort() {
    const nodes: NodeId[] = [...this._nodes.keys()]
    const edges = this._transformEdges();
    var cursor = nodes.length
      , sorted = new Array(cursor)
      , visited = {}
      , i = cursor
      , outgoingEdges = makeOutgoingEdges(edges)
      , nodesHash = makeNodesHash(nodes);
  
    // check for unknown nodes
    edges.forEach(function(edge) {
      if (!nodesHash.has(edge[0]) || !nodesHash.has(edge[1])) {
        throw new Error('Unknown node. There is an unknown node in the supplied edges.');
      }
    })

    while (i--) {
      if (!visited[i]) visit(nodes[i], i, new Set());
    }

    return sorted;

    function visit(node, i, predecessors) {
      if(predecessors.has(node)) {
        var nodeRep;
        try {
          nodeRep = ", node was:" + JSON.stringify(node);
        } catch(e) {
          nodeRep = "";
        }
        throw new CyclicError('Cyclic dependency' + nodeRep);
      }

      if (!nodesHash.has(node)) {
        throw new Error('Found unknown node. Make sure to provide all involved nodes. Unknown node: '+JSON.stringify(node));
      }

      if (visited[i]) return;
      visited[i] = true;

      var outgoing = outgoingEdges.get(node) || new Set();
      outgoing = Array.from(outgoing);

      if (i = outgoing.length) {
        predecessors.add(node);
        do {
          var child = outgoing[--i]
          visit(child, nodesHash.get(child), predecessors);
        } while (i)
        predecessors.delete(node);
      }

      sorted[--cursor] = node;
    }
  }

  isCyclic() {
    try {
      this.toposort();
    } catch (e) {
      if (e instanceof CyclicError) {
        return true;
      }
      throw e;
    }
    return false;
  }

  findCycles(){
    return findCycles(this);
  }

  /**
   * stringify the graph to a JSON.
   */
  stringify(graph?: Graph<ND, ED>): string {
    return graph? toJson(graph) : toJson(this);
  } 

  bfs(){

  }

  dfs(){

  }
}

function returnTrue(){ return true; }

function makeOutgoingEdges(arr){
  var edges = new Map()
  for (var i = 0, len = arr.length; i < len; i++) {
    var edge = arr[i]
    if (!edges.has(edge[0])) edges.set(edge[0], new Set())
    if (!edges.has(edge[1])) edges.set(edge[1], new Set())
    edges.get(edge[0]).add(edge[1])
  }
  return edges
}

function makeNodesHash(arr){
  var res = new Map()
  for (var i = 0, len = arr.length; i < len; i++) {
    res.set(arr[i], i)
  }
  return res
}

function findCycles(g) {
  return _.filter(tarjan(g), function(cmpt) {
    // @ts-ignore
    return cmpt.length > 1 || (cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]));
  });
}
