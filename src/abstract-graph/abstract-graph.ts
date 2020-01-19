import _ from 'lodash'
import { Graph as GraphLib} from 'graphlib/lib';

export class Graph{
    graph: GraphLib;
    constructor(directed:boolean=true, multigraph:boolean=true){
        this.graph = new GraphLib({directed:directed, multigraph:multigraph, compound:true})
        this.graph.setDefaultEdgeLabel({})
    }

    setNode(key: string, value: any){
        return this.graph.setNode(key, value)
    }

    node(key:string){
        return this.graph.node(key)
    }

    getNodeInfo(nodeKeys:string | string[]){
        if(typeof(nodeKeys) === "string"){
            return {[nodeKeys]:this.graph.node(nodeKeys)}
        }
        let graphObj: object = {}
        nodeKeys.forEach(node => {
            graphObj[node] = this.graph.node(node)
        });
         return graphObj
    }

    private objHasKeyValue(obj: any, key:string, value:any) {
        return obj.hasOwnProperty(key) && obj[key] === value;
    }

    nodes(returnNodeInfo:boolean=false){
        if(!!returnNodeInfo){
            return this.getNodeInfo(this.graph.nodes())
        }
        return this.graph.nodes()
    }

    hasNode(key:string){
        return this.graph.hasNode(key)
    }

    removeNode(key:string){
        return this.graph.removeNode(key)
    }

    nodeCount(){
        return this.graph.nodeCount()
    }

    setDefaultNodeLabel(label:string){
        return this.setDefaultNodeLabel(label)
    }

    filterNodes(fu: Function){
        //TODO
    }

    sources(){
        return this.graph.sources()
    }

    sinks(){
        return this.graph.sinks()
    }

    setEdge(sourceKey: string,  tragetKey:string, labels: {}){
        return this.graph.setEdge(sourceKey, tragetKey, labels)
    }

    hasEdge(sourceKey:string, targetKey:string){
        return this.graph.hasEdge(sourceKey, targetKey)
    }

    edge(sourceKey:string, targetKey:string){
        return this.graph.edge(sourceKey, targetKey)
    }

    edges(){
        return this.graph.edges()
    }

    removeEdge(sourceKey:string, targetKey:string){
        return this.graph.removeEdge(sourceKey, targetKey)
    }

    addEdgeLabel(labels: string | string[]){
        //TODO
    }

    removeEdgeLabel(labels: string | string[]){
        //TODO
    }

    edgeCount(){
        return this.graph.edgeCount()
    }

    setDefaultEdgeLabel(val:string){
        return this.graph.setDefaultEdgeLabel()
    }

    inEdges(nodeKey:string, returnEdgeInfo:boolean=false){
        if(!!returnEdgeInfo){

        }
        return this.graph.inEdges(nodeKey)
    }

    outEdges(nodeKey:string){
        return this.graph.outEdges(nodeKey)
    }

    nodeEdges(nodeKey:string){
        return this.graph.nodeEdges(nodeKey)
    }

    predecessors(nodeKey: string, byEdgeLabels:{key:string, val:string}={key:'', val:''}, returnNodeInfo:boolean=false){
        let nodesToReturn: string[] = []
        if(byEdgeLabels.key === '' && byEdgeLabels.key === ''){
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
        return returnNodeInfo?
            this.getNodeInfo(nodesToReturn)
            :
            nodesToReturn
    }

    successors(nodeKey: string, byEdgeLabels:{key:string, val:string}={key:'', val:''}, returnNodeInfo:boolean=false){
        let nodesToReturn: string[] = []
        if(byEdgeLabels.key === '' && byEdgeLabels.key === ''){
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
        return returnNodeInfo?
            this.getNodeInfo(nodesToReturn)
            :
            nodesToReturn
    }

    neighbors(nodeKey: string, byEdgeLabels:{key:string, val:string}={key:'', val:''}, returnNodeInfo:boolean=false){
        return returnNodeInfo? //if so, returns object; else - array.
            _.merge(this.predecessors(nodeKey, byEdgeLabels, returnNodeInfo), this.successors(nodeKey, byEdgeLabels, returnNodeInfo))
            :
            _.concat(this.predecessors(nodeKey, byEdgeLabels, returnNodeInfo), this.successors(nodeKey, byEdgeLabels, returnNodeInfo))
    }

    private innerRecurSuccessors(nodeKey: string,
            successorsList: string[] = [],
            visited: { [key: string]: boolean } = {}
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
                     byEdgeLabels:string[]=[],
                     returnNodeInfo:boolean=false,
                     returnStructure: 'flatList' | 'subGraph' | 'layers'='flatList'){
        //TODO: implement rest of params
        return _.uniq(this.innerRecurSuccessors(nodeKey))              
     }

    recursPredecessors(nodeKeys: string | string[],
        byEdgeLabels:string[]=[],
        returnNodeInfo:boolean=false,
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
