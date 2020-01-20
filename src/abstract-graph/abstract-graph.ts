import _ from 'lodash'
import { Graph as GraphLib} from 'graphlib/lib'

export class Graph<N, E>{
    graph: GraphLib
    constructor(directed:boolean=true, multigraph:boolean=true){
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

    private objHasKeyValue(obj: any, key:string, value:any) : boolean {
        return obj.hasOwnProperty(key) && obj[key] === value;
    }

    nodes(): string[]{
        return this.graph.nodes()
    }

    hasNode(key:string): boolean {
        return this.graph.hasNode(key)
    }

    removeNode(key:string){
        return this.graph.removeNode(key)
    }

    nodeCount(): number {
        return this.graph.nodeCount()
    }

    filterNodes(filterPredicate: (data: N) => boolean = returnTrue): string[]{
        //TODO
        return []
    }

    sources(filterPredicate: (data: N) => boolean = returnTrue): string[]{
        return this.graph.sources()
    }

    sinks(filterPredicate: (data: N) => boolean = returnTrue): string[]{
        return this.graph.sinks()
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

    edges(filterPredicate: (data: E) => boolean = returnTrue){
        return this.graph.edges()
    }

    removeEdge(sourceKey:string, targetKey:string){
        return this.graph.removeEdge(sourceKey, targetKey)
    }

    edgeCount(filterPredicate: (data: E) => boolean): number{
        return this.graph.edgeCount()
    }

    inEdges(nodeKey:string, filterPredicate: (data: E) => boolean = returnTrue){
        return this.graph.inEdges(nodeKey)
    }

    outEdges(nodeKey:string, filterPredicate: (data: E) => boolean = returnTrue){
        return this.graph.outEdges(nodeKey)
    }

    nodeEdges(nodeKey:string, filterPredicate: (data: E) => boolean = returnTrue){
        return this.graph.nodeEdges(nodeKey)
    }

    predecessors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        if(byEdgeLabels.length === 0){
            nodesToReturn = this.graph.predecessors(nodeKey)
        }
        else{
            const inEdges = this.graph.inEdges(nodeKey)
            inEdges.forEach(edge => {
                let edgeLablesObj = this.graph.edge(edge.v, edge.w)
                if(this.objHasKeyValue(edgeLablesObj, byEdgeLabels.key, byEdgeLabels.val)){
                    nodesToReturn.push(edge.v)}
            })
        }
        return nodesToReturn
    }

    successors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        let nodesToReturn: string[] = []
        if(byEdgeLabels.length === 0){
            nodesToReturn = this.graph.successors(nodeKey)
        }
        else{
            const outEdges = this.graph.outEdges(nodeKey)
            outEdges.forEach(edge => {
                let edgeLablesObj = this.graph.edge(edge.v, edge.w)
                if(this.objHasKeyValue(edgeLablesObj, byEdgeLabels.key, byEdgeLabels.val)){
                    nodesToReturn.push(edge.w)}
            })
        }
        return nodesToReturn
    }

    neighbors(nodeKey: string, filterPredicate: (data: E) => boolean = returnTrue){
        return _.concat(this.predecessors(nodeKey, byEdgeLabels, returnNodeInfo), this.successors(nodeKey, byEdgeLabels, returnNodeInfo))
    }

    private innerRecurSuccessors(nodeKey: string,
            successorsList: string[] = [],
            visited: { [key: string]: boolean } = {},
            filterPredicate: (data: E) => boolean = returnTrue
          ){  
        const successors = this.graph.successors(nodeKey) || [];
        if (successors.length > 0 && !visited[nodeKey]) {
            successors.forEach((successor:string) => {
            visited[nodeKey] = true;
            successorsList.push(successor);
    
            return this.innerRecurSuccessors(successor, successorsList, visited);
            });
        }
        return successorsList;
    }

    recursSuccessors(nodeKey: string,
                    filterPredicate: (data: E) => boolean = returnTrue,
                    returnStructure: 'flatList' | 'subGraph' | 'layers'='flatList'){
        let nodesToReturn: any[] = []
        if( returnStructure === 'flatList'){
            nodesToReturn =_.uniq(this.innerRecurSuccessors(nodeKey))
        }

        return nodesToReturn

     }

    recursPredecessors(nodeKey: string,
                       filterPredicate: (data: E) => boolean = returnTrue,
                       returnStructure: 'flatList' | 'subGraph' | 'layers'='flatList'){
        //TODO
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
