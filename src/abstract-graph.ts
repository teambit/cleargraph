import _ from 'lodash'
import { Graph as GraphLib} from 'graphlib/lib'
import { isAcyclic, topsort, findCycles } from 'graphlib/lib/alg'
import { Node, NodeData, Edge, EdgeData } from './index'


/**
 * Graph is an abstract graph class using a Graphlib instance and extending Graphlib's functionality.
 * The nodes and edges in the graph are represented by key-value pairs where the keys are strings, 
 * and the generics N and E represent the node value and edge value respectively.
 */
// export class Graph<N extends Node<NodeData>, NodeData, E extends Edge<EdgeData>, EdgeData>{
export class Graph<ND extends NodeData, ED extends EdgeData>{
    graph: GraphLib
    /**
     * When instantiating the graph, specify the values of N and E, and decide on the type of connection
     * between the nodes using the 'directed' param.
     * @example
     * ```typescript
     * type NodeData = { bitId: string, version: string}
     * type EdgeData = { depType: 'peer' | 'dev' | 'regular', semDist?: 1 | 2 | 3 }
     * let g = new Graph<NodeData, EdgeData>()
     * ```
     */
    constructor(directed = true, readonly initialNodes?: Node<ND>[], readonly initialEdges?: Edge<ED>[]) {
        this.graph = new GraphLib({ directed: directed, multigraph: false, compound: true });
        this.graph.setDefaultEdgeLabel({});
        if (initialNodes) {
            initialNodes.forEach(node => this.setNode(node.key, node.data))
        }
        if (initialEdges) {
            initialEdges.forEach(edge => this.setEdge(edge.sourceKey, edge.targetKey, edge.data));
        }
    }

    /**
     * Creates or updates the key-value for a single node in the graph.
     * @example
     * ```typescript
     * g.setNode("my-id", "my-label");
     * ```
     */
    setNode(key: string, value: NodeData): NodeData{
        return this.graph.setNode(key, value)
    }

    setNodes(nodes: Array<Node<ND>>) {
        nodes.forEach(node => this.setNode(node.key, node.data));
    }

    /**
     * Returns the value of the specified node key if it is in the graph. 
     * Otherwise returns undefined.
     * @example
     * ```typescript
     * g.setNode("my-id", "my-label");
     * g.node("my-id");
     * // "my-label"
     * ```
     */
    node(key:string): NodeData {
        return this.graph.node(key)
    }

    /**
     * Gets a node key or keys and returns an object with their keys and values
     * @example
     * ```typescript
     * g.setNode("id1", "label1");
     * g.setNode("id2", "label2");
     * g.getNodeInfo(["id1", "id2"]);
     * // {"id1": "label1", "id2": "label2"}
     * ```
     */
    getNodeInfo(nodeKeys:string | string[]): Record<string, NodeData>{
        if(typeof(nodeKeys) === "string"){
            return {[nodeKeys]:this.graph.node(nodeKeys)}
        }
        let graphObj: Record<string, NodeData> = {}
        nodeKeys.forEach(node => {
            graphObj[node] = this.graph.node(node)
        });
        return graphObj
    }

    /**
     * Returns an array of all node keys in the graph.
     * If a filter function is provided - returns only the nodes that the function returns truthy for.
     * @example
     * ```typescript
     * g.setNode("id1", "label1");
     * g.setNode("id2", "label2");
     * g.nodes();
     * // ["id1", "id2"]
     * ```
     */
    nodes(filterPredicate?: (data: ND) => boolean): string[]{
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.nodes()
        }
        let nodesToReturn: string[] = []
        this.graph.nodes().forEach(node => {
            let nodeData = this.graph.node(node)
            if(filterPredicate(nodeData)){
                nodesToReturn.push(node)}
        })
        return nodesToReturn
    }

    /**
     * Returns true if the graph has a node with the given key.
     * @example
     * ```typescript
     * g.setNode("id1", "label1");
     * g.setNode("id2", "label2");
     * g.hasNode("id3");
     * // false
     * ```
     */
    hasNode(key:string): boolean {
        return this.graph.hasNode(key)
    }

    /**
     * Removes the node with the id v in the graph or do nothing if the node is not in the graph.
     * If the node was removed this function also removes any incident edges. 
     * Returns the graph, allowing this to be chained with other functions. 
     * @example
     * ```typescript
     * g.setNode("id1", "label1");
     * g.removeNode("id1");
     * ```
     */
    removeNode(key:string){
        return this.graph.removeNode(key)
    }

    /**
     * Returns the number of nodes in the graph.
     * If a filter function is provided - returns only the number of nodes the function returns truthy for.
     * @example
     * ```typescript
     * g.setNode("id1", "label1");
     * g.nodeCount();
     * // 1
     * ```
     */
    nodeCount(filterPredicate?: (data: ND) => boolean): number {
        if (typeof(filterPredicate) === 'undefined'){
            return this.graph.nodeCount()
        }
        return this.nodes(filterPredicate).length
    }

    /**
     * Returns those nodes in the graph that have no in-edges.
     * If a filter function is provided - returns only the nodes the function returns truthy for.
     */
    sources(filterPredicate: (data: ND) => boolean = returnTrue): string[]{
        if (typeof(filterPredicate) === 'undefined'){
            return this.graph.sources()
        }
        let nodesToReturn: string[] = []
        this.graph.sources().forEach(node => {
            let nodeData = this.graph.node(node)
            if(filterPredicate(nodeData)){
                nodesToReturn.push(node)}
        })
        return nodesToReturn
    }

    /**
     * Returns those nodes in the graph that have no out-edges.
     * If a filter function is provided - returns only the nodes the function returns truthy for.
     */
    sinks(filterPredicate: (data: ND) => boolean = returnTrue): string[]{
        if (typeof(filterPredicate) === 'undefined'){
            return this.graph.sinks()
        }
        let nodesToReturn: string[] = []
        this.graph.sinks().forEach(node => {
            let nodeData = this.graph.node(node)
            if(filterPredicate(nodeData)){
                nodesToReturn.push(node)}
        })
        return nodesToReturn
    }

    /**
     * Creates or updates the edge value for the edge key (sourceKey, targetKey) with the data provided.
     * Returns the graph, allowing this to be chained with other functions.
     * @example
     * ```typescript
     * g.setEdge("source", "target", {depType:"dev"});
     * g.edge("source", "target");
     * // returns {depType:"dev"}
     * ```
     */
    setEdge<EdgeData>(sourceKey: string, tragetKey:string, data:EdgeData){
        return this.graph.setEdge(sourceKey, tragetKey, data)
    }

    setEdges(edges: Edge<EdgeData>[]) {
        edges.forEach(edge => this.setEdge(edge.sourceKey, edge.targetKey, edge.data));
    }

    /**
     * Returns true if the graph has an edge between source and target.
     * @example
     * ```typescript
     * g.setEdge("source1", "target1", {depType:"dev"});
     * g.hasEdge("source1", "target1");
     * // true
     * ```
     */
    hasEdge(sourceKey:string, targetKey:string): boolean {
        return this.graph.hasEdge(sourceKey, targetKey)
    }

    /**
     * Returns the data for the given source and target edge keys.
     * Returned undefined if there is no such edge in the graph.
     * @example
     * ```typescript
     * g.setEdge("source1", "target1", {depType:"dev"});
     * g.edge("source1", "target1");
     * // returns {depType:"dev"}
     * ```
     */
    edge(sourceKey:string, targetKey:string): EdgeData {
        return this.graph.edge(sourceKey, targetKey)
    }

    /**
     * Returns an array of all edge keys objects in the graph, where v is the source and w is the target.
     * If a filter function is provided - returns only the edges that the function returns truthy for.
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.setEdge("b", "c", {depType:"peer"});
     * g.edges();
     * // returns [{"v":"a","w":"b"},
     * //          {"v":"b","w":"c"}]
     * ```
     */
    edges(filterPredicate?: (data: ED) => boolean){
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.edges()
        }
        const edges = this.graph.edges()
        let edgesToReturn: string[] = []
        edges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                edgesToReturn.push(edge)}
        })
        return edgesToReturn
    }

    /**
     * Removes the edge (source, target) if the graph has an edge between source and target. 
     * If not this function does nothing. 
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.removeEdge("a", "b")
     * ```
     */

    removeEdge(sourceKey:string, targetKey:string){
        return this.graph.removeEdge(sourceKey, targetKey)
    }

    /**
     * Returns the number of edges in the graph.
     * If a filter function is provided - returns only the number of edges the function returns truthy for.
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.edgeCount();
     * // 1
     * ```
     */
    edgeCount(filterPredicate?: (data: ED) => boolean): number{
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.edgeCount()
        }
        return this.edges(filterPredicate).length
    }

    /**
     * Returns all edges that point to a node.
     * Returns undefined if the node is not in the graph.
     * Behavior is undefined for undirected graphs - use nodeEdges instead.
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.setEdge("c", "b", {depType:"dev"});
     * g.inEdges("b")
     * // [
            {"v":"a", "w":"b"},
            {"v":"c", "w":"b"}
        ]
        ```typescript
     */
    inEdges(nodeKey:string, filterPredicate?: (data: ED) => boolean){
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.inEdges(nodeKey)
        }
        const inEdges = this.graph.inEdges(nodeKey)
        let edgesToReturn: string[] = []
        inEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                edgesToReturn.push(edge)}
        })
        return edgesToReturn
    }

    /**
     * Returns all edges that are pointed at by a node.
     * Returns undefined if the node is not in the graph.
     * Behavior is undefined for undirected graphs - use nodeEdges instead.
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.setEdge("b", "c", {depType:"dev"});
     * g.outEdges("b")
     * // [{"v":"b", "w":"c"}]
     * ```
     */
    outEdges(nodeKey:string, filterPredicate?: (data: ED) => boolean){
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.outEdges(nodeKey)
        }
        const outEdges = this.graph.outEdges(nodeKey)
        let edgesToReturn: string[] = []
        outEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                edgesToReturn.push(edge)}
        })
        return edgesToReturn
    }

    /**
     * Returns all edges to or from a node regardless of direction.
     * Returns undefined if the node is not in the graph.
     * @example
     * ```typescript
     * g.setEdge("a", "b", {depType:"dev"});
     * g.setEdge("b", "c", {depType:"dev"});
     * g.nodeEdges("b")
     * // [{"v":"a", "w":"b"},
     *     {"v":"b", "w":"c"}]]
     * ```
     */
    nodeEdges(nodeKey:string, filterPredicate?: (data: ED) => boolean){
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.nodeEdges(nodeKey)
        }
        const nodeEdges = this.graph.nodeEdges(nodeKey)
        let edgesToReturn: string[] = []
        nodeEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                edgesToReturn.push(edge)}
        })
        return edgesToReturn
    }

    /**
     * Returns all nodes that are immediate predecessors of the specified node (the nodes that have edges that point to the specified node),
     * or undefined if the node is not in the graph.
     * If a filter function is provided - returns only the nodes that the function returns truthy for.
     * Behavior is undefined for undirected graphs - use neighbors instead.
     */
    predecessors(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        const inEdges = this.graph.inEdges(nodeKey)
        inEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                nodesToReturn.push(edge.v)}
        })
        return nodesToReturn
    }

    /**
     * Returns all nodes that are immediate successors of the specified node (the nodes that the specified node points to),
     * or undefined if the node is not in the graph.
     * If a filter function is provided - returns only the nodes that the function returns truthy for.
     * Behavior is undefined for undirected graphs - use neighbors instead.
     */
    successors(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        const outEdges = this.graph.outEdges(nodeKey)
        outEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                nodesToReturn.push(edge.w)}
        })
        return nodesToReturn
    }

    /**
     * Returns all nodes that are immediate successors or predecessors of the specified node, or undefined if the node is not in the graph.
     * If a filter function is provided - returns only the nodes that the function returns truthy for.
     */
    neighbors(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue){
        return _.concat(this.predecessors(nodeKey, filterPredicate), this.successors(nodeKey, filterPredicate))
    }

    /**
     * Returns an array of all node keys that are recursively successors of the specified node, or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * Behavior is undefined for undirected graphs.
     */
    getSuccessorsArrayRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue): string[]{
        return _.uniq(this._innerRecurSuccessorsArray(nodeKey, [], {}, filterPredicate))
     }

     /**
     * Returns the sub-graph of the provided node key and all node keys that are recursively its successors, or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * Behavior is undefined for undirected graphs.
     */
    getSuccessorsGraphRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue): Graph<ND,ED>{
        // also returns the original nodeKey as part of the returned sub-graph
        let g = new Graph<ND,ED>()
        g.setNode(nodeKey, this.graph.node(nodeKey))
        return this._innerRecurSuccessorsGraph(nodeKey, g, {}, filterPredicate)
    }
    
    /**
     * Returns an array of arrays of node keys representing the topological sort of the provided node key and all node keys that are recursively its successors, or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * The layers can be ordered either from the provided node key (order='fromSource', default) or from the last node(s) in the sorting (order='fromLastNodes')
     * Behavior is undefined for undirected graphs.
     */
    getSuccessorsLayersRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue, order:'fromSource' | 'fromLastNodes'= 'fromSource'): string[][] | never {
        let successorsGraph = this.getSuccessorsGraphRecursively(nodeKey, filterPredicate)
        if(!isAcyclic(successorsGraph)){
            throw new Error("cyclic dependency")
        }
        let layers: string[][] = []
        let floor = 0
        layers[floor]=[nodeKey]
        let rawLayers = this._innerRecurSuccessorsLayers([nodeKey], layers, floor, filterPredicate)
        return arrangeLayers(rawLayers, order)
    }

    /**
     * Returns an array of all node keys that are recursively predecessors of the specified node, or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * Behavior is undefined for undirected graphs.
     */
    getPredecessorsArrayRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue): string[]{
        return _.uniq(this._innerRecurPredecessorsArray(nodeKey, [], {}, filterPredicate))
     }

    /**
     * Returns the sub-graph of the provided node key and all node keys that are recursively its predecessors, or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * Behavior is undefined for undirected graphs.
     */
    getPredecessorsGraphRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue): Graph<ND,ED> {
        // also returns the original nodeKey as part of the returned sub-graph
        let g = new Graph<ND,ED>()
        g.setNode(nodeKey, this.graph.node(nodeKey))
        return this._innerRecurPredecessorsGraph(nodeKey, g, {}, filterPredicate)
    }
    
    /**
     * Returns an array of arrays of node keys representing the topological sort of the provided node key and all node keys that are recursively its predecessors, 
     * or undefined if the node is not in the graph.
     * If a filter function is provided - keeps traversing the graph only over edges for which the filter function returns truthy.
     * The layers can be ordered either from the provided node key (order='fromSource', default) or from the last node(s) in the sorting (order='fromLastNodes')
     * Behavior is undefined for undirected graphs.
     */
    getPredecessorsLayersRecursively(nodeKey: string, filterPredicate: (data: ED) => boolean = returnTrue, order:'fromSource' | 'fromLastNodes'= 'fromSource'): string[][] | never {
        let successorsGraph = this.getPredecessorsGraphRecursively(nodeKey, filterPredicate) // first getting as a graph to check if cyclic
        if(!isAcyclic(successorsGraph)){
            throw new Error("cyclic sub-graph")
        }
        let layers: string[][] = []
        layers[0]=[nodeKey]
        let floor = 0
        let rawLayers = this._innerRecurPredecessorsLayers([nodeKey], layers, floor, filterPredicate)
        return arrangeLayers(rawLayers, order)
     }

    /**
     * An implementation of topological sorting.
     * This function returns an array of all nodes in the graph such that for each edge u -> v, u appears before v in the array. 
     * If the graph has a cycle it is impossible to generate such a list and CycleException is thrown.
     */
    toposort(): string[] {
        return (topsort(this.graph))
    }

    /**This function returns all nodes in the graph that are part of a cycle.
     * As there may be more than one cycle in a graph this function return an array of these cycles, where each cycle is itself
     * represented by an array of ids for each node involved in that cycle.
    */
   findCycles(g?: Graph<ND, ED>){
        if(typeof(g) === 'undefined'){
            return (findCycles(this.graph))
        }
       return (findCycles(g))
   }

    setGraphLabel(label:string){
        return this.graph.setGraph(label)
    }

    getGraphLabel(){
        return this.graph.graph()
    }

    diff(graph:GraphLib){
        //TODO
    }

    merge(graph:GraphLib){
        //TODO
    }

    isCyclic(graph: Graph<ND, ED>){
        return (!isAcyclic(graph))
    }

    isDirected(){
        return this.graph.isDirected()
    }

    isMultigraph(){
        return this.graph,this.isMultigraph()
    }

    private _innerRecurSuccessorsArray(nodeKey: string,
                                    successorsList: string[] = [],
                                    visited: { [key: string]: boolean } = {},
                                    filterPredicate: (data: ED) => boolean = returnTrue){  
        const successors = this.successors(nodeKey, filterPredicate) || [];
        if (successors.length > 0 && !visited[nodeKey]) {
            successors.forEach((successor:string) => {
            visited[nodeKey] = true;
            successorsList.push(successor);
            return this._innerRecurSuccessorsArray(successor, successorsList, visited, filterPredicate);
            });
        }
    return successorsList;
    }

    private _innerRecurSuccessorsGraph(nodeKey: string,
                                        successorsGraph: Graph<ND,ED>,
                                        visited: { [key: string]: boolean } = {},
                                        filterPredicate: (data: ED) => boolean = returnTrue){  
        const successors = this.successors(nodeKey, filterPredicate) || [];
        if (successors.length > 0 && !visited[nodeKey]) {
            successors.forEach((successor:string) => {
                visited[nodeKey] = true;
                successorsGraph.setNode(successor, this.graph.node(successor));
                successorsGraph.setEdge(nodeKey, successor, this.graph.edge(nodeKey, successor))
                return this._innerRecurSuccessorsGraph(successor, successorsGraph, visited, filterPredicate);
            });
        }
        return successorsGraph;
    }

    private _innerRecurSuccessorsLayers(nodeKeys: string[],
                                        layers: string[][],
                                        floor: number,
                                        filterPredicate: (data: ED) => boolean = returnTrue){  
        if (nodeKeys.length > 0) {
            let nextFloor = floor + 1
            layers.push([])
            layers[floor].forEach((successor:string) => {
                layers[nextFloor] = layers[nextFloor].concat(this.successors(successor, filterPredicate))
                });
            return this._innerRecurSuccessorsLayers(layers[nextFloor], layers, nextFloor, filterPredicate)
        }
        return layers;
    }

    private _innerRecurPredecessorsArray(nodeKey: string,
                                        predecessorsList: string[] = [],
                                        visited: { [key: string]: boolean } = {},
                                        filterPredicate: (data: ED) => boolean = returnTrue){  
        const predecessors = this.predecessors(nodeKey, filterPredicate) || [];
        if (predecessors.length > 0 && !visited[nodeKey]) {
            predecessors.forEach((predecessor:string) => {
                visited[nodeKey] = true;
                predecessorsList.push(predecessor);
                return this._innerRecurPredecessorsArray(predecessor, predecessorsList, visited, filterPredicate);
            });
        }
        return predecessorsList;
    }

    private _innerRecurPredecessorsGraph(nodeKey: string,
                                        predecessorsGraph: Graph<ND,ED>,
                                        visited: { [key: string]: boolean } = {},
                                        filterPredicate: (data: ED) => boolean = returnTrue){  
        const predecessors = this.predecessors(nodeKey, filterPredicate) || [];
        if (predecessors.length > 0 && !visited[nodeKey]) {
            predecessors.forEach((predecessor:string) => {
                visited[nodeKey] = true;
                predecessorsGraph.setNode(predecessor, this.graph.node(predecessor));
                predecessorsGraph.setEdge(nodeKey, predecessor, this.graph.edge(nodeKey, predecessor))
                return this._innerRecurPredecessorsGraph(predecessor, predecessorsGraph, visited, filterPredicate);
            });
        }
        return predecessorsGraph;
    }

    private _innerRecurPredecessorsLayers(nodeKeys: string[],
                                        layers: string[][],
                                        floor: number,
                                        filterPredicate: (data: ED) => boolean = returnTrue){  
        if (nodeKeys.length > 0) {
            let nextFloor = floor + 1
            layers.push([])
            layers[floor].forEach((predecessor:string) => {
                layers[nextFloor] = layers[nextFloor].concat(this.predecessors(predecessor, filterPredicate))
            });
            return this._innerRecurPredecessorsLayers(layers[nextFloor], layers, nextFloor, filterPredicate)
            }
        return layers;
        }

    }

function returnTrue(){ return true }

function arrangeLayers(layers:string[][], order: 'fromSource' | 'fromLastNodes'){
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


