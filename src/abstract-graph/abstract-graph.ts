import _ from 'lodash'
import { Graph as GraphLib} from 'graphlib/lib'

export class Graph<N, E>{
    graph: GraphLib
    constructor(directed=true, multigraph=true){
        this.graph = new GraphLib({directed:directed, multigraph:multigraph, compound:true})
        this.graph.setDefaultEdgeLabel({})
    }

    setNode(key: string, value: N){
        return this.graph.setNode(key, value)
    }

    node(key:string): N {
        return this.graph.node(key)
    }

    getNodeInfo(nodeKeys:string | string[]): Record<string, N>{
        if(typeof(nodeKeys) === "string"){
            return {[nodeKeys]:this.graph.node(nodeKeys)}
        }
        let graphObj: Record<string, N> = {}
        nodeKeys.forEach(node => {
            graphObj[node] = this.graph.node(node)
        });
        return graphObj
    }

    nodes(filterPredicate?: (data: N) => boolean): string[]{
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

    hasNode(key:string): boolean {
        return this.graph.hasNode(key)
    }

    removeNode(key:string){
        return this.graph.removeNode(key)
    }

    nodeCount(filterPredicate?: (data: N) => boolean): number {
        if (typeof(filterPredicate) === 'undefined'){
            return this.graph.nodeCount()
        }
        return this.nodes(filterPredicate).length
    }

    sources(filterPredicate: (data: N) => boolean = returnTrue): string[]{
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

    sinks(filterPredicate: (data: N) => boolean = returnTrue): string[]{
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

    setEdge<T>(sourceKey: string, tragetKey:string, data:T){
        return this.graph.setEdge(sourceKey, tragetKey, data)
    }

    hasEdge(sourceKey:string, targetKey:string): boolean {
        return this.graph.hasEdge(sourceKey, targetKey)
    }

    edge(sourceKey:string, targetKey:string){
        return this.graph.edge(sourceKey, targetKey)
    }

    edges(filterPredicate?: (data: E) => boolean){
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

    removeEdge(sourceKey:string, targetKey:string){
        return this.graph.removeEdge(sourceKey, targetKey)
    }

    edgeCount(filterPredicate?: (data: E) => boolean): number{
        if(typeof(filterPredicate) === 'undefined'){
            return this.graph.edgeCount()
        }
        return this.edges(filterPredicate).length
    }

    inEdges(nodeKey:string, filterPredicate?: (data: E) => boolean){
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

    outEdges(nodeKey:string, filterPredicate?: (data: E) => boolean){
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

    nodeEdges(nodeKey:string, filterPredicate?: (data: E) => boolean){
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

    predecessors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        const inEdges = this.graph.inEdges(nodeKey)
        inEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                nodesToReturn.push(edge.v)}
        })
        return nodesToReturn
    }

    successors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        const outEdges = this.graph.outEdges(nodeKey)
        outEdges.forEach(edge => {
            let edgeData = this.graph.edge(edge.v, edge.w)
            if(filterPredicate(edgeData)){
                nodesToReturn.push(edge.w)}
        })
        return nodesToReturn
    }

    neighbors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        return _.concat(this.predecessors(nodeKey, filterPredicate), this.successors(nodeKey, filterPredicate))
    }

    private innerRecurSuccessorsArray(nodeKey: string,
                                 successorsList: string[] = [],
                                 visited: { [key: string]: boolean } = {},
                                 filterPredicate: (data: E) => boolean = returnTrue){  
        const successors = this.successors(nodeKey, filterPredicate) || [];
        if (successors.length > 0 && !visited[nodeKey]) {
            successors.forEach((successor:string) => {
            visited[nodeKey] = true;
            successorsList.push(successor);
            return this.innerRecurSuccessorsArray(successor, successorsList, visited, filterPredicate);
            });
        }
        return successorsList;
    }

    private innerRecurSuccessorsGraph(nodeKey: string,
                                 successorsGraph: Graph<N,E>,
                                 visited: { [key: string]: boolean } = {},
                                 filterPredicate: (data: E) => boolean = returnTrue){  
        const successors = this.successors(nodeKey, filterPredicate) || [];
        if (successors.length > 0 && !visited[nodeKey]) {
            successors.forEach((successor:string) => {
                visited[nodeKey] = true;
                successorsGraph.setNode(successor, this.graph.node(successor));
                successorsGraph.setEdge(nodeKey, successor, this.graph.edge(nodeKey, successor))
                return this.innerRecurSuccessorsGraph(successor, successorsGraph, visited, filterPredicate);
            });
        }
        return successorsGraph;
    }

    private innerRecurSuccessorsLayers(nodeKeys: string[],
                                 layers: string[][],
                                 floor: number,
                                 filterPredicate: (data: E) => boolean = returnTrue){  
        if (layers[floor].length > 0) {
            let nextFloor = floor + 1
            layers.push([])
            layers[floor].forEach((successor:string) => {
                layers[nextFloor] = layers[nextFloor].concat(this.successors(successor, filterPredicate))
            });
            return this.innerRecurSuccessorsLayers(layers[nextFloor], layers, nextFloor, filterPredicate)
        }
        return layers;
    }

    getSuccessorsArrayRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue): string[]{
        return _.uniq(this.innerRecurSuccessorsArray(nodeKey, [], {}, filterPredicate))
     }

    getSuccessorsGraphRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue): Graph<N,E>{
        // also returns the original nodeKey as part of the returned sub-graph
        let g = new Graph<N,E>()
        g.setNode(nodeKey, this.graph.node(nodeKey))
        return this.innerRecurSuccessorsGraph(nodeKey, g, {}, filterPredicate)
    }
    
    getSuccessorsLayersRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue, order:'fromSource' | 'fromLastLeaf'= 'fromSource'): string[][]{
        let layers: string[][] = []
        layers[0]=[nodeKey]
        let floor = 0
        let rawLayers = this.innerRecurSuccessorsLayers([nodeKey], layers, floor, filterPredicate)
        return arrangeLayers(rawLayers, order)
    }

    getPredecessorsArrayRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        
     }

    getPredecessorsGraphRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
    
    }
    
    getPredecessorsLayersRecursively(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
      
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

    isDirected(){
        return this.graph.isDirected()
    }

    isMultigraph(){
        return this.graph,this.isMultigraph()
    }
}

function returnTrue(){ return true }

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
