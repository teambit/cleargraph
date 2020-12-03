import { Node, NodeId } from './index';
import { Edge, EdgeId } from './index';
import { CyclicError, NodeDoesntExist } from './index'
import _ from 'lodash';
import { tarjan } from './algorithms';
import { genericParseNode, genericNodeToJson } from './node';
import { genericParseEdge, genericEdgeToJson } from './edge';

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

  protected create(nodes: {id: string, node: N}[] = [], edges: {sourceId: string, targetId: string, edge:E}[] = []): this {
    return new Graph(nodes, edges) as this;
  }

  private _nodes = new Map<NodeId, Node<N>>();
  private _edges = new Map<EdgeId, Edge<E>>();

  /**
   * set a new node on the graph or override existing node with the same key
   * @param id string
   * @param node a node of generic data type N
   */
  setNode(id: string, node: N, overrideExisting=true): this {
    if (!this.hasNode(id)){
      let graphNode = new Node(id, node)
      this._nodes.set(id, graphNode);
    }
    else if(overrideExisting){
      let existingNode = this.node(id);
      if (existingNode) { existingNode.attr = node }
    }
    return this;
  }

  /**
   * set a new edge on the graph or override existing edge with the same source and target keys.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   * @param edge an edge of the generic data type E
   */
  setEdge(sourceId: string, targetId: string, edge: E, overrideExisting=true): this {
    if (this.hasEdge(sourceId, targetId)){
      if (overrideExisting){
        let existingEdge = this.edge(sourceId, targetId);
        if(existingEdge) {existingEdge.attr = edge};
        return this;
      }
      else { return this }
    }
    const id = Edge.edgeId(sourceId, targetId);
    let graphEdge = new Edge(sourceId, targetId, edge)
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
  setNodes(nodes: {id: string, node: N}[], overrideExisting = true): this  {
    nodes.forEach(elem => {
      if (!this.hasNode(elem.id)){
        this.setNode(elem.id, elem.node)
      }
      else if(overrideExisting){
        let existingNode = this.node(elem.id);
        if (existingNode) { existingNode.attr = elem.node }
      }
    });
    return this;
  }

  /**
   * set multiple edges on the graph.
   * @param edges an array of objects {sourceId, targetId, edge}
   */
  setEdges(edges: {sourceId: string, targetId: string, edge:E}[], overrideExisting = true): this {
    edges.forEach(elem => {
      if (!this.hasEdge(elem.sourceId, elem.targetId)){
        this.setEdge(elem.sourceId, elem.targetId, elem.edge)
      }
      else if(overrideExisting){
        let existingEdge = this.edge(elem.sourceId, elem.targetId);
        if (existingEdge) { existingEdge.attr = elem.edge }
      }
    });
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
  node(id: NodeId): Node<N> | undefined{
    return this._nodes.get(id);
  }

  /**
   * get an edge from the graph by its ID. Undefined if id is not in graph.
   * @param sourceId the id of the source node
   * @param targetId the id of the target node
   */
  edge(sourceId: string, targetId: string): Edge<E> | undefined {
    return this._edges.get(Edge.edgeId(sourceId, targetId));
  }

  /**
   * private function that returns a Edge object from the graph by its ID. Undefined if id is not in graph.
   * @param edgeId the internal id the graph assigns to edges of the form "a->b"
   */
  _edgeById(edgeId: string){
    return this._edges.get(edgeId);
  }

  /**
   * get an edgeId of the format "a->b" and returns its source node Id and target node id.
   * @param edgeId
   */
  edgeNodesById(edgeId: EdgeId): { sourceId: string | undefined, targetId: string | undefined}{
    return {
      sourceId: this._edges.get(edgeId)?.sourceId,
      targetId: this._edges.get(edgeId)?.targetId
    }
  }

  /**
   * get a map of all <nodeId, node> in the graph.
   */
  get nodes(): Map<NodeId, Node<N>>{
    return this._nodes;
  }

  /**
   * get all <edgeId, edge> in the graph.
   */
  get edges(): Map<EdgeId, Edge<E>>{
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
   * return all nodes that have only out edges and no in edges.
   */
  sources(): Node<N>[]{
    let nodesToReturn = [...this._nodes.values()];
    return nodesToReturn.filter(node => node.isSource()).map(elem => elem);
  }

   /**
    * return all nodes that have only in edges and no out edges.
    */
   sinks(): Node<N>[]{
    let nodesToReturn = [...this._nodes.values()];
    return nodesToReturn.filter(node => node.isSink()).map(elem => elem);
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
   * return a map <EdgeId, Edge> of all inbound edges of the given node.
   * @param nodeId NodeId==string
   */
  inEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    return this._inEdges(nodeId);
  }

  /**
   * return a map <EdgeId, Edge> of all outbound edges of the given node.
   * @param nodeId NodeId==string
   */
  outEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    return this._outEdges(nodeId);
  }

  /**
   * return a map <EdgeId, Edge> of all inbound and outbound edges of the given node.
   * @param nodeId NodeId==string
   */
  nodeEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    return this._nodeEdges(nodeId);
  }

  /**
   * private. return a map of all <edgeId, Edge<E>> that point to the given node.
   * @param nodeId
   */
  _inEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    let newEdges = new Map<EdgeId, Edge<E>>();
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
   * return a map of all <edgeId, Edge<E>> that point from the given node to other nodes.
   * @param nodeId 
   */
  _outEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    let newEdges = new Map<EdgeId, Edge<E>>();
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
   * return a map of all <edgeId, Edge<E>> that point to or from the given node.
   * @param nodeId
   */
  _nodeEdges(nodeId: NodeId): Map<EdgeId, Edge<E>>{
    let newEdges = new Map<EdgeId, Edge<E>>();
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
  successors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    return this._successors(nodeId, filterPredicate);
  }

  /**
   * return a map of all <nodeId, node> that point to by the given node.
   * @param nodeId the id of the target node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  predecessors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    return this._predecessors(nodeId, filterPredicate);
  }

  /**
   * return a map of all <nodeId, node> that are directly or indirectly connected to the given node.
   * @param nodeId the id of the node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  neighbors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    return this._neighbors(nodeId, filterPredicate);
  }

  /**
   * Internal. Return a map of all <NodeId, Node> that are immediately pointed to by the given node.
   * @param nodeId the id of the source node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _successors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    let successors = new Map<NodeId, Node<N>>();
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
   * Private. Return a map of all <NodeId, Node> that point to by the given node.
   * @param nodeId the id of the target node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _predecessors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    let predecessors = new Map<NodeId, Node<N>>();
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
   * return a map of all <NodeId, Node> that are directly or indirectly connected to the given node.
   * @param nodeId the id of the node
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  _neighbors(nodeId: NodeId, filterPredicate: (edge: Edge<E>) => boolean = returnTrue): Map<NodeId, Node<N>>{
    let neighbors = new Map([...this._predecessors(nodeId, filterPredicate), ...this._successors(nodeId, filterPredicate)]);
    return neighbors;
  }

  /**
   * return a sub-graph of all the nodes and edges that are recursively successors of the given node.
   * @param node the source node of the sub-graph required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  successorsSubgraph(nodeIds: NodeId | NodeId[], filterPredicate: (edge: Edge<E>) => boolean = returnTrue): this {
    return this._buildSubgraphs(nodeIds, filterPredicate, 'successors');
  }

  _alreadyProcessed(nodeId: NodeId, subgraphs: this[]): boolean {
    for (const graph of subgraphs) {
      if (graph.hasNode(nodeId)){
        return true;
      }
    }
    return false;
  }

  _buildSubgraphs(nodeIds: NodeId | NodeId[], filterPredicate: (edge: Edge<E>) => boolean, order: 'successors' | 'predecessors'){
    let subgraphs: this[] = [];
    if (!Array.isArray(nodeIds)){
      return this._buildSubgraph(nodeIds, filterPredicate, order);
    }
    nodeIds.forEach(nodeId => {
      if (this._alreadyProcessed(nodeId, subgraphs)){
        return;
      }
      subgraphs.push(this._buildSubgraph(nodeId, filterPredicate, order));
    });
    if (subgraphs.length === 1){
      return subgraphs[0];
    }
    let mergedGraphs: this = this.create();
    if (subgraphs.length) {
      mergedGraphs = subgraphs[0].merge(subgraphs)
    }
    return mergedGraphs;
  }

  _buildSubgraph(nodeId: NodeId, 
                 filterPredicate: (edge: Edge<E>) => boolean,
                 order: 'successors' | 'predecessors'){
    let g = this.create();
    let graphNode = this.node(nodeId);
    if(!graphNode){
      throw new Error('Node does not exist on graph');
    }
    else{
      g.setNode(nodeId, graphNode.attr);
    }
    return order === 'successors'? this._successorsSubgraphUtil(nodeId, g, {}, filterPredicate) : 
                                   this._predecessorsSubgraphUtil(nodeId, g, {}, filterPredicate);
  }

  _successorsSubgraphUtil(nodeId: NodeId, successorsGraph: this, visited: { [key: string]: boolean } = {}, filterPredicate: (data: Edge<E>) => boolean): this {
    const successors = [...this._successors(nodeId, filterPredicate).keys()] || [];
    if (successors.length > 0 && !visited[nodeId]) {
        successors.forEach((successor:string) => {
            visited[nodeId] = true;
            const newNode = this._nodes.get(successor);
            const newEdge = this._edges.get(Edge.edgeId(nodeId, successor));
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
  successorsArray(nodeId: NodeId, filterPredicate: (data: Edge<E>) => boolean = returnTrue): Node<N>[]{
    const successorIds = _.uniq(this._successorsArrayUtil(nodeId, [], {}, filterPredicate));
    let successors: Node<N>[] = []
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
                       filterPredicate: (data: Edge<E>) => boolean = returnTrue): NodeId[]{  
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

  successorsLayers(nodeKey: string, filterPredicate: (data: Edge<E>) => boolean = returnTrue, order:'fromSource' | 'fromLastLeaf'= 'fromSource'): string[][] | never {
    let successorsGraph = this.successorsSubgraph(nodeKey, filterPredicate)
    if(this.isCyclic(successorsGraph)){
        throw new Error("cyclic dependency")
    }
    let layers: string[][] = []
    layers[0]=[nodeKey]
    let floor = 0
    let rawLayers = this._successorsLayersUtil([nodeKey], layers, floor, filterPredicate)
    return arrangeLayers(rawLayers, order)
  }

  private _successorsLayersUtil(nodeKeys: string[],
                                 layers: string[][],
                                 floor: number,
                                 filterPredicate: (data: Edge<E>) => boolean = returnTrue){  
        if (nodeKeys.length > 0) {
            let nextFloor = floor + 1
            layers.push([])
            layers[floor].forEach((successor:string) => {
              const successors = [...this.successors(successor, filterPredicate).keys()];
              layers[nextFloor] = layers[nextFloor].concat(successors);
            });
            return this._successorsLayersUtil(layers[nextFloor], layers, nextFloor, filterPredicate)
        }
        return layers;
  }

  /**
   * return a sub-graph of all the nodes and edges that are recursively predecessors (point to) of the given node.
   * @param node the target node of the sub-graph required 
   * @param filterPredicate a boolean function that enables traversing the graph only on the edges that return truthy for it
   */
  predecessorsSubgraph(nodeIds: NodeId | NodeId[], filterPredicate: (edge: Edge<E>) => boolean = returnTrue): this {
    return this._buildSubgraphs(nodeIds, filterPredicate, 'predecessors');
  }

  _predecessorsSubgraphUtil(nodeId: NodeId, predecessorsGraph: this, visited: { [key: string]: boolean } = {}, filterPredicate: (data: Edge<E>) => boolean = returnTrue): this {
    const predecessors = [...this._predecessors(nodeId, filterPredicate).keys()] || [];
        if (predecessors.length > 0 && !visited[nodeId]) {
            predecessors.forEach((predecessor:string) => {
                visited[nodeId] = true;
                const newNode = this._nodes.get(predecessor);
                const newEdge = this._edges.get(Edge.edgeId(predecessor, nodeId));
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
  predecessorsArray(nodeId: NodeId, filterPredicate: (data: Edge<E>) => boolean = returnTrue): Node<N>[]{
    const predecessorIds = _.uniq(this._predecessorsArrayUtil(nodeId, [], {}, filterPredicate));
    let predecessors: Node<N>[] = []
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
                       filterPredicate: (data: Edge<E>) => boolean = returnTrue): NodeId[]{  
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

    predecessorsLayers(nodeKey: string, filterPredicate: (data: Edge<E>) => boolean = returnTrue, order:'fromSource' | 'fromLastLeaf'= 'fromSource'): string[][] | never {
      let successorsGraph = this.predecessorsSubgraph(nodeKey, filterPredicate) // first getting as a graph to check if cyclic
      if(this.isCyclic(successorsGraph)){
          throw new Error("cyclic sub-graph")
      }
      let layers: string[][] = []
      layers[0]=[nodeKey]
      let floor = 0
      let rawLayers = this._predecessorsLayersUtil([nodeKey], layers, floor, filterPredicate)
      return arrangeLayers(rawLayers, order)
   }

   private _predecessorsLayersUtil(nodeKeys: string[],
                                 layers: string[][],
                                 floor: number,
                                 filterPredicate: (data: Edge<E>) => boolean = returnTrue){  
        if (nodeKeys.length > 0) {
            let nextFloor = floor + 1
            layers.push([])
            layers[floor].forEach((predecessor:string) => {
              const predecessors = [...this.predecessors(predecessor, filterPredicate).keys()];
              layers[nextFloor] = layers[nextFloor].concat(predecessors);
            });
            return this._predecessorsLayersUtil(layers[nextFloor], layers, nextFloor, filterPredicate)
        }
        return layers;
    }

  /**
   * A topological sort of the graph
   */
  toposort(reverse:boolean=false): Node<N>[]{
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

  isCyclic(graph = this) {
    try {
      graph.toposort();
    } catch (e) {
      if (e instanceof CyclicError) {
        return true;
      }
      throw e;
    }
    return false;
  }

  findCycles(graph = this){
    return findCycles(graph);
  }

  /**
   * Merge the provided graphs (of the same type as this graph) from right to left into this graph
   * @param graphs any number of Graph objects
   */
  merge(graphs: this[]): this {
    let mergedGraph: this = this; 
    graphs.forEach(incomingGraph => {
      //iterate on nodes
      for (let [nodeId, node] of incomingGraph.nodes) {
        mergedGraph.setNode(nodeId, node.attr); // override right node data with left (incoming) node data if this node id exists or creates a new node with this id if doesn't exist
      }
      //iterate on edges
      for (let [edgeId, edge] of incomingGraph.edges) {
        const sourceId = incomingGraph._edges.get(edgeId)?.sourceId;
        const targetId = incomingGraph._edges.get(edgeId)?.targetId
        if(mergedGraph.edges.has(edgeId) && !!sourceId && !!targetId){
          mergedGraph.setEdge(sourceId, targetId, edge.attr); // override right edge data with left (incoming) edge data if edge id exists
        }
        else {
          // make sure both source and target nodes exist
          if (!!sourceId && !!targetId && mergedGraph.hasNode(sourceId) && mergedGraph.hasNode(targetId)){
            mergedGraph.setEdge(sourceId, targetId, edge.attr);
          }
          else {
            throw NodeDoesntExist;
          }
        }
      }
    });
    return mergedGraph;
  }

  /**
   * find all paths from one node to another node.
   * @param sourceId
   * @param targetId
   */
  allPaths(sourceId: NodeId, targetId: NodeId): NodeId[][]{
    const paths: NodeId[][] = this._allPaths(sourceId, targetId, [], []);
    return paths;
  }

  _allPaths(source: NodeId, target: NodeId, currPath: NodeId[], paths: NodeId[][], visited: { [key: string]: boolean } = {}){
      // Mark current node as visited and store in current path
        visited[source]= true;
        currPath.push(source);
        // If current node is same as destination, add current path to paths
        if (source === target){
                    paths.push(_.cloneDeep(currPath));
        }
        else{
            // If current node is not target, recur for all its succesors
            const successors = [...this._successors(source).keys()] || [];
            successors.forEach(nodeId => {
              if (!visited[nodeId]){
                this._allPaths(nodeId, target, currPath, paths, visited);
              }
            });
        }
        // Remove current node from currentPath[] and mark it as unvisited
        currPath.pop()
        visited[source]= false;
        return paths;
  }

  /***
   * graph to JSON object
   */
  toJson(graph?: this){
    return graph? this._toJson(graph, 'object') :this._toJson(this, 'object');
  }

  /**
   * stringify the graph to a JSON string
   * @param graph
   */
  stringify(graph?: this): string {
    return graph? this._toJson(graph, 'string') :this._toJson(this, 'string');
  } 

  /**
   * build graph from json
   * @param json should be of the format: 
   * { 
   *   nodes: {id: string, node: N}[],
   *   edges: {sourceId: string, targetId: string, edge:E}[]
   * }
   */
  static parse(json: string | object, parseNode: (data: any)=>any = genericParseNode, parseEdge: (data: any)=>any = genericParseEdge){
    return this._fromJson(json, parseNode, parseEdge);
  }

  _toJson(graph: Graph<any, any>, returnType: 'object' | 'string'): any{
    let nodeArray: {id: string, node: string | object}[]= [];
    for (let [nodeId, nodeData] of graph.nodes.entries()) {
      const graphNode = graph.node(nodeId);
      if (!! graphNode){
        let convertedNode: string | object;
        if (returnType === 'object'){
          if (!!graphNode.attr['toJson'] && typeof graphNode.attr['toJson'] === 'function'){
            convertedNode = graphNode.attr.toJson();
          }
          else {
            convertedNode = genericNodeToJson(graphNode.attr)
          }
        }
        else{
          convertedNode = graphNode.stringify()
        }
        nodeArray.push({
          id: nodeId,
          node: convertedNode
        });
      }
    }
    let edgeArray: {sourceId: string, targetId: string, edge: string | object}[] = [];
    for (let [edgeId, edgeData] of graph.edges.entries()) {
      const graphEdge = graph._edgeById(edgeId);
      if (!! graphEdge){
        let convertedEdge: string | object;
        if (returnType === 'object'){
          if (!!graphEdge.attr['toJson'] && typeof graphEdge.attr['toJson'] === 'function'){
            convertedEdge = graphEdge.attr.toJson();
          }
          else {
            convertedEdge = genericNodeToJson(graphEdge.attr)
          }
        }
        else{
          convertedEdge = graphEdge.stringify()
        }
        edgeArray.push ({
          sourceId: graphEdge.sourceId,
          targetId: graphEdge.targetId,
          edge: convertedEdge
        });
      }
    }
    let json = {
        nodes: nodeArray,
        edges: edgeArray
      };
      return returnType === 'object'? json : JSON.stringify(json);
}

  /**
  * builds a graph from the provided JSON.
  * @param json should be of the format: 
  * { 
  *   nodes: {id: string, node: N}[],
  *   edges: {sourceId: string, targetId: string, edge:E}[]
  * }
  */
  static _fromJson(json: string | object, parseNode: (data: any)=>any, parseEdge: (data: any)=>any){
    const obj = typeof(json) === 'string'? JSON.parse(json) : json;
    let graph = new Graph();
    if (!obj.hasOwnProperty('nodes') || !obj.hasOwnProperty('edges')){
      throw Error('missing properties on JSON. Should contain nodes: {id: string, node: N}[], and edges: {sourceId: string, targetId: string, edge:E}[]');
    }
    obj.nodes.forEach(nodeObj => {
      const res = Node.fromObject(nodeObj, parseNode);
      graph.setNode(res.id, res.node);

    });
    obj.edges.forEach(edgeObj => {
      const res = Edge.fromObject(edgeObj, parseEdge);
      graph.setEdge(res.sourceId, res.targetId, res.edge);

    });
    return graph;
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

function arrangeLayers(layers:string[][], order: 'fromSource' | 'fromLastLeaf'){
  let finalLayers: string[][] = []
  let seenNodes:string[] = []
  layers = layers.reverse()
  let i = 0
  layers.forEach(layer => {
      if(layer.length > 0){
          finalLayers.push([])
          layer.forEach(node => {
              if(seenNodes.indexOf(node) == -1){ //if node not seen
                  seenNodes.push(node)
                  finalLayers[i].push(node)
              }
          })
      i++
  }
  });
 return order === 'fromSource' ? finalLayers.reverse() : finalLayers
}
