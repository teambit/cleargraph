import { GraphNode, NodeId } from './index';
import { GraphEdge, EdgeId } from './index';
import { CyclicError } from './index'
import _ from 'lodash';
import { tarjan } from './algorithms';
import { toJson } from './json';


/**
 * Graph abstractly represents a graph with arbitrary objects
 * associated with nodes and edges. The graph provides basic
 * operations to access and manipulate the data associated with
 * nodes and edges as well as the underlying structure.
 *
 * @tparam N the node attribute type
 * @tparam E the edge attribute type
 */

export class Graph<N , E> {

  constructor(
    /**
     * array of graph nodes.
     */
    nodes: {id: string, node: N}[] = [],
    /**
     * array of graph edges.
     */
    edges: {sourceId: string, targetId: string, edge:E}[] = []
  ) {
    nodes.forEach(elem => this.setNode(elem.id, elem.node));
    edges.forEach(elem => this.setEdge(elem.sourceId, elem.targetId, elem.edge));
  }

  private _nodes = new Map<NodeId, GraphNode<N>>();
  private _edges = new Map<EdgeId, GraphEdge<E>>();

  /** private getter that returns a map of <nodeId, N>  and not the whole <NodeId, GraphNode<N>>*/
  get _userNodes(): Map<NodeId, N>{
    return this._transformToUserNodeMap(this._nodes);
  }

  /** private getter that returns a map of <EdgeId, E>  and not the whole <EdgeId, GraphEdge<E>>*/
  get _userEdges(): Map<EdgeId, E> {
    return this._transformToUserEdgeMap(this._edges);
  }

  /**
   * get a map of GraphNodes and return the same keys with only the attr (the node or edge data)
   * @param map a map of GraphNodes
   */
  _transformToUserNodeMap(map: Map<NodeId, GraphNode<N>>): Map<NodeId, N>{
    let newMap = new Map<NodeId, N>();
    for (const [key, value] of map.entries()) {
      newMap.set(key, value.attr)
    };
    return newMap;
  }

  /**
   * get a map of GraphEdges and return the same keys with only the attr (the node or edge data)
   * @param map a map of GraphEdges
   */
  _transformToUserEdgeMap(map: Map<EdgeId, GraphEdge<E>>): Map<EdgeId, E>{
    let newMap = new Map<EdgeId, E>();
    for (const [key, value] of map.entries()) {
      newMap.set(key, value.attr)
    };
    return newMap;
  }

  /**
   * set a new node on the graph or override existing node with the same key
   * @param id string
   * @param node a node of generic data type N
   */
  setNode(id: string, node: N): Graph<N, E> {
    let graphNode = new GraphNode(id, node)
    this._nodes.set(id, graphNode);
    return this;
  }

  /**
   * set a new edge on the graph or override existing edge with the same source and target keys.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   * @param edge an edge of the generic data type E
   */
  setEdge(sourceId: string, targetId: string, edge: E): Graph<N, E> {
    const id = GraphEdge.edgeId(sourceId, targetId);
    let graphEdge = new GraphEdge(sourceId, targetId, edge)
    this._edges.set(id, graphEdge);
    if(this._nodes.has(sourceId)) {
      let sourceNode = this._nodes.get(sourceId);
      if(sourceNode !== undefined){
        sourceNode.setOutEdge(id);
      }
    }
    else {
      throw Error('source node does not exist')
    }
    if(this._nodes.has(targetId)){
      let targetNode = this._nodes.get(targetId);
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
   * set multiple nodes on the graph.
   * @param nodes an array of objects {id, node}
   */
  setNodes(nodes: {id: string, node: N}[]): Graph<N, E>  {
    nodes.forEach(elem => this.setNode(elem.id, elem.node));
    return this;
  }

  /**
   * set multiple edges on the graph.
   * @param edges an array of objects {sourceId, targetId, edge}
   */
  setEdges(edges: {sourceId: string, targetId: string, edge:E}[]): Graph<N, E> {
    edges.forEach(elem => this.setEdge(elem.sourceId, elem.targetId, elem.edge));
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
    return this._edges.has(GraphEdge.edgeId(sourceId, targetId));
  }

  /**
   * get a node from the graph by its ID. Undefined if id is not in graph.
   * @param id the id of the node - string
   */
  node(id: NodeId): N | undefined{
    return this._nodes.get(id)?.attr;
  }

  /**
   * get an edge from the graph by its ID. Undefined if id is not in graph.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   */
  edge(sourceId: string, targetId: string): E | undefined {
    return this._edges.get(GraphEdge.edgeId(sourceId, targetId))?.attr;
  }

  /**
   * private function that returns a GraphNode object for the given Id. Undefined if not found.
   * @param id the id of the node - string
   */
  _node(id: NodeId): GraphNode<N> | undefined {
    return this._nodes.get(id);
  }

  /**
   * private function that returns a GraphEdge object from the graph by its ID. Undefined if id is not in graph.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   */
  _edge(sourceId: string, targetId: string): GraphEdge<E> | undefined {
    return this._edges.get(GraphEdge.edgeId(sourceId, targetId));
  }

  /**
   * get a map of all <nodeId, node> in the graph.
   */
  get nodes(): Map<NodeId, N>{
    return this._userNodes;
  }

  /**
   * get all <edgeId, edge> in the graph.
   */
  get edges(): Map<EdgeId, E>{
    return this._userEdges;
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
   * return all nodes that have only out edges and no in edges.
   */
  sources(): N[]{
    let nodesToReturn = [...this._nodes.values()];
    return nodesToReturn.filter(node => node.isSource()).map(elem => elem.attr);
  }

   /**
    * return all nodes that have only in edges and no out edges.
    */
   sinks(): N[]{
    let nodesToReturn = [...this._nodes.values()];
    return nodesToReturn.filter(node => node.isSink()).map(elem => elem.attr);
   }

  /**
   * delete a single node by id if exists. Note that all edges to and from this node will also be deleted.
   * @param id the id of the node to be deleted
   */
  deleteNode(id: NodeId): void{
    const node = this._node(id);
    if(typeof(node) === 'undefined') return;
    node.nodeEdges.forEach((edgeId: EdgeId) => {
      const { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId);
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
    const edgeId = GraphEdge.edgeId(sourceId, targetId);
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
   * return a map <EdgeId, Edge> of all inbound edges of the given node.
   * @param nodeId NodeId==string
   */
  inEdges(nodeId: NodeId): Map<EdgeId, E>{
    return this._transformToUserEdgeMap(this._inEdges(nodeId));
  }

  /**
   * return a map <EdgeId, Edge> of all outbound edges of the given node.
   * @param nodeId NodeId==string
   */
  outEdges(nodeId: NodeId): Map<EdgeId, E>{
    return this._transformToUserEdgeMap(this._outEdges(nodeId));
  }

  /**
   * return a map <EdgeId, Edge> of all inbound and outbound edges of the given node.
   * @param nodeId NodeId==string
   */
  nodeEdges(nodeId: NodeId): Map<EdgeId, E>{
    return this._transformToUserEdgeMap(this._nodeEdges(nodeId));
  }

  /**
   * private. return a map of all <edgeId, GraphEdge<E>> that point to the given node.
   * @param nodeId
   */
  _inEdges(nodeId: NodeId): Map<EdgeId, GraphEdge<E>>{
    let newEdges = new Map<EdgeId, GraphEdge<E>>();
    const node = this._node(nodeId);
    if (node === undefined) return newEdges;
    node.inEdges.forEach(edgeId => {
      let { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId)
      let edge = this._edge(sourceId, targetId);
      if(edge !== undefined){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  /**
   * return a map of all <edgeId, GraphEdge<E>> that point from the given node to other nodes.
   * @param nodeId 
   */
  _outEdges(nodeId: NodeId): Map<EdgeId, GraphEdge<E>>{
    let newEdges = new Map<EdgeId, GraphEdge<E>>();
    const node = this._node(nodeId);
    if (node === undefined) return newEdges;
    node.outEdges.forEach(edgeId => {
      let { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId)
      let edge = this._edge(sourceId, targetId);
      if(edge !== undefined){
        newEdges.set(edgeId, edge);
      }
    });
    return newEdges;
  }

  /**
   * return a map of all <edgeId, GraphEdge<E>> that point to or from the given node.
   * @param nodeId
   */
  _nodeEdges(nodeId: NodeId): Map<EdgeId, GraphEdge<E>>{
    let newEdges = new Map<EdgeId, GraphEdge<E>>();
    const node = this._node(nodeId);
    if (node === undefined) return newEdges;
    node.nodeEdges.forEach(edgeId => {
      let { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId)
      let edge = this._edge(sourceId, targetId);
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
  successors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, N>{
    return this._transformToUserNodeMap(this._successors(nodeId, filterPredicate));
  }

  /**
   * return a map of all <nodeId, node> that point to by the given node.
   * @param nodeId the id of the target node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  predecessors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, N>{
    return this._transformToUserNodeMap(this._predecessors(nodeId, filterPredicate));
  }

  /**
   * return a map of all <nodeId, node> that are directly or indirectly connected to the given node.
   * @param nodeId the id of the node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  neighbors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, N>{
    return this._transformToUserNodeMap(this._neighbors(nodeId, filterPredicate));
  }

  /**
   * Internal. Return a map of all <NodeId, GraphNode> that are immediately pointed to by the given node.
   * @param nodeId the id of the source node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _successors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, GraphNode<N>>{
    let successors = new Map<NodeId, GraphNode<N>>();
    const node = this._node(nodeId);
    if (node === undefined) return successors;
    node.outEdges.forEach(edgeId => {
      const edge = this._edges.get(edgeId)?.attr;
      if(edge != undefined && filterPredicate(edge))
      {  const { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId);
        const targetNode = this._node(targetId);
        if(!!targetId && targetNode !== undefined){
          successors.set(targetId, targetNode);
        }
      }
    });
    return successors; 
  }

  /**
   * Private. Return a map of all <NodeId, GraphNode> that point to by the given node.
   * @param nodeId the id of the target node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _predecessors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, GraphNode<N>>{
    let predecessors = new Map<NodeId, GraphNode<N>>();
    const node = this._node(nodeId);
    if (node === undefined) return predecessors;
    node.inEdges.forEach(edgeId => {
      const edge = this._edges.get(edgeId)?.attr;
      if(edge != undefined && filterPredicate(edge))
      {  const { sourceId, targetId } = GraphEdge.parseEdgeId(edgeId);
        const sourceNode = this._node(sourceId);
        if(!!sourceId && sourceNode !== undefined){
          predecessors.set(sourceId, sourceNode);
        }
      }
    });
    return predecessors; 
  }

  /**
   * return a map of all <NodeId, GraphNode> that are directly or indirectly connected to the given node.
   * @param nodeId the id of the node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _neighbors(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Map<NodeId, GraphNode<N>>{
    let neighbors = new Map([...this._predecessors(nodeId, filterPredicate), ...this._successors(nodeId, filterPredicate)]);
    return neighbors;
  }

  /**
   * return a sub-graph of all the nodes and edges that are recursively successors of the given node.
   * @param node the source node of the sub-graph required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  successorsSubgraph(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Graph<N, E>{
    let g = new Graph<N,E>();
    let graphNode = this._node(nodeId);
    if(!graphNode){
      throw new Error('Node does not exist on graph');
    }
    else{
      g.setNode(nodeId, graphNode.attr);
    }
    return this._successorsSubgraphUtil(nodeId, g, {}, filterPredicate)
  }

  _successorsSubgraphUtil(nodeId: NodeId, successorsGraph: Graph<N,E>, visited: { [key: string]: boolean } = {}, filterPredicate: (data: E) => boolean = returnTrue): Graph<N, E> {
    const successors = [...this._successors(nodeId, filterPredicate).keys()] || [];
    if (successors.length > 0 && !visited[nodeId]) {
        successors.forEach((successor:string) => {
            visited[nodeId] = true;
            const newNode = this._nodes.get(successor);
            const newEdge = this._edges.get(GraphEdge.edgeId(nodeId, successor));
            if(newNode !== undefined && newEdge != undefined){
              successorsGraph.setNode(successor, newNode.attr);
              successorsGraph.setEdge(nodeId, successor, newEdge.attr);
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
  successorsArray(nodeId: NodeId, filterPredicate: (data: E) => boolean = returnTrue): N[]{
    const successorIds = _.uniq(this._successorsArrayUtil(nodeId, [], {}, filterPredicate));
    let successors: N[] = []
    successorIds.forEach((id: NodeId) => {
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
                       filterPredicate: (data: E) => boolean = returnTrue): NodeId[]{  
        const successors = [...this._successors(nodeId, filterPredicate).keys()] || [];
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
  predecessorsSubgraph(nodeId: NodeId, filterPredicate: (edge: E) => boolean = returnTrue): Graph<N, E>{
    let g = new Graph<N,E>();
    let graphNode = this._node(nodeId);
    if(!graphNode){
      throw new Error('Node does not exist on graph');
    }
    else{
      g.setNode(nodeId, graphNode.attr);
    }
    return this._predecessorsSubgraphUtil(nodeId, g, {}, filterPredicate);
  }

  _predecessorsSubgraphUtil(nodeId: NodeId, predecessorsGraph: Graph<N,E>, visited: { [key: string]: boolean } = {}, filterPredicate: (data: E) => boolean = returnTrue): Graph<N, E> {
    const predecessors = [...this._predecessors(nodeId, filterPredicate).keys()] || [];
        if (predecessors.length > 0 && !visited[nodeId]) {
            predecessors.forEach((predecessor:string) => {
                visited[nodeId] = true;
                const newNode = this._nodes.get(predecessor);
                const newEdge = this._edges.get(GraphEdge.edgeId(predecessor, nodeId));
                if(newNode !== undefined && newEdge != undefined){
                  predecessorsGraph.setNode(predecessor, newNode.attr);
                  predecessorsGraph.setEdge(predecessor, nodeId, newEdge.attr);
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
  predecessorsArray(nodeId: NodeId, filterPredicate: (data: E) => boolean = returnTrue): N[]{
    const predecessorIds = _.uniq(this._predecessorsArrayUtil(nodeId, [], {}, filterPredicate));
    let predecessors: N[] = []
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
                       filterPredicate: (data: E) => boolean = returnTrue): NodeId[]{  
        const predecessors = [...this._predecessors(nodeId, filterPredicate).keys()] || [];
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
  toposort(reverse:boolean=false): GraphNode<N>[]{
    let nodes = this._toposort().map(nodeId => this.node(nodeId));
    nodes = _.compact(nodes) // remove any undefined entries
    //@ts-ignore
    return reverse ? nodes.reverse() : nodes;
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
  stringify(graph?: Graph<N, E>): string {
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
