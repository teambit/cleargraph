// import { Graph } from './abstract-graph'
// import { expect } from 'chai'
// import { Node, Edge, NodeData, EdgeData } from './index'

// class SpecificNodeData implements NodeData {
//     constructor(private bitId: string, private version: string){
//         this.bitId = bitId
//         this.version = version
//     }
//     equals(newData: SpecificNodeData){
//         return (this.bitId === newData.bitId && this.version === newData.version)
//     }
//     clone(){ 
//         return (this as SpecificNodeData) }

//     merge(newData: SpecificNodeData){
//         return new SpecificNodeData(newData.bitId, newData.version)
//     }

//     getBitId(){
//         return this.bitId
//     }

//     getVersion(){
//         return this.version
//     }
// }

// class SpecificNode implements Node<SpecificNodeData>{
//     key: string
//     data: SpecificNodeData
//     constructor(key: string, data: SpecificNodeData){
//         this.key = key
//         this.data = data
//     }
// }

// type DepType = 'peer' | 'regular' | 'dev'
// class SpecificEdgeData implements EdgeData {
//     constructor(private depType: DepType, private semDist?: 1 | 2 | 3){
//         this.depType = depType
//         this.semDist = semDist
//     }
//     equals(newData: SpecificEdgeData){
//         return (this.depType === newData.depType && this.semDist === newData.semDist)
//     }
//     clone(){ 
//         return (this as SpecificEdgeData) }

//     merge(newData: SpecificEdgeData){
//         return new SpecificEdgeData(newData.depType, newData.semDist)
//     }

//     getDepType(){
//         return this.depType
//     }

//     getSemDist(){
//         return this.semDist
//     }
// }

// class SpecificEdge implements Edge<SpecificEdgeData>{
//     sourceKey: string
//     targetKey: string
//     data: SpecificEdgeData
//     constructor(sourceKey: string, targetKey: string, data: SpecificEdgeData){
//         this.sourceKey = sourceKey
//         this.targetKey = targetKey
//         this.data = data
//     }
// }

// describe.skip('GraphTester', () => {
//     let g = new Graph<SpecificNodeData, SpecificEdgeData>()
//     g.setNode("a", new SpecificNodeData('comp1', '1.0.0'))
//     g.setNode("b", new SpecificNodeData('comp2', '2.0.0'))
//     g.setNode("c", new SpecificNodeData('comp3', '1.0.1'))
//     g.setNode("d", new SpecificNodeData('comp4', '15.0.0'))
//     g.setNode("e", new SpecificNodeData('comp5', '3.0.0'))
//     g.setNode("f", new SpecificNodeData('comp6', '2.0.0'))
//     g.setNode("g", new SpecificNodeData('comp7', '2.0.0'))
//     g.setEdge("a", "b", new SpecificEdgeData("peer", 3))
//     g.setEdge("a", "c", new SpecificEdgeData("dev", 3))
//     g.setEdge("c", "d", new SpecificEdgeData("regular", 3))
//     g.setEdge("c", "e", new SpecificEdgeData("regular", 2))
//     g.setEdge("d", "f", new SpecificEdgeData("peer", 1))
//     g.setEdge("e", "d", new SpecificEdgeData("dev", 1))
//     g.setEdge("g", "a", new SpecificEdgeData("dev", 1))

//     it('should return node value', () => {
//         expect(g.node("b")).to.deep.equal({ bitId: 'comp2', version: '2.0.0'})
//     })

//     it('should get node info for a single node key', () => {
//         expect(g.getNodeInfo("a")).to.deep.equal({ a: { bitId: 'comp1', version: '1.0.0'}})
//     })

//     it('should get node info for multiple node keys', () => {
//         expect(g.getNodeInfo(["a","b"])).to.deep.equal(
//             { "a": { bitId: 'comp1', version: '1.0.0'},
//               "b": { bitId: 'comp2', version: '2.0.0'}})
//     })

//     it('should return graph nodes', () => {
//         expect(g.nodes()).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ])
//     })

//     it('should return filtered nodes', () => {
//         expect(g.nodes(nodeFilterPredicateVersion)).to.deep.equal([ 'b', 'f', 'g' ])
//     })

//     it('should return true for existing node', () => {
//         expect(g.hasNode('c')).to.be.true
//     })

//     it('should return false for non-existing node', () => {
//         expect(g.hasNode('h')).to.be.false
//     })

//     it('should return correct number of nodes in the graph', () => {
//         expect(g.nodeCount()).to.equal(7)
//     })

//     it('should return correct number of nodes in the graph with filter function', () => {
//         expect(g.nodeCount(nodeFilterPredicateVersion)).to.equal(3)
//     })

//     it('should return correct sources', () => {
//         expect(g.sources()).to.deep.equal(['g'])
//     })

//     it('should return correct sources with filter function', () => {
//         expect(g.sources(nodeFilterPredicateComp)).to.deep.equal([])
//     })

//     it('should return correct sinks', () => {
//         expect(g.sinks()).to.deep.equal(['b', 'f'])
//     })

//     it('should return correct sinks with filter function', () => {
//         expect(g.sinks(nodeFilterPredicateComp)).to.deep.equal(['b'])
//     })

//     it('should return true for existing edge', () => {
//         expect(g.hasEdge('c', 'd')).to.be.true
//     })

//     it('should return false for edge in the wrong direction', () => {
//         expect(g.hasEdge('d','c')).to.be.false
//     })

//     it('should return a value for an edge in the graph', () => {
//         expect(g.edge('a','b')).to.deep.equal({depType: "peer", semDist: 3})
//     })

//     it('should return correct number of graph edges', () => {
//         expect(g.edgeCount()).to.equal(7)
//     })

//     it('should return correct number of graph edges with filter function', () => {
//         expect(g.edgeCount(edgeFilterByDevDep)).to.equal(3)
//     })

//     it('should return in edges', () => {
//         expect(g.inEdges('a')).to.deep.equal([
//             {"v":"g", "w":"a"}
//         ])
//     })

//     it('should return only in edges that pass filter function', () => {
//         expect(g.inEdges('d', edgeFilterByRegularDep)).to.deep.equal([
//             {"v":"c", "w":"d"}
//         ])
//     })

//     it('should return out edges', () => {
//         expect(g.outEdges('c')).to.deep.equal([
//             {"v":"c", "w":"d"},
//             {"v":"c", "w":"e"}
//         ])
//     })

//     it('should return only out edges that pass filter function', () => {
//         expect(g.outEdges('a', edgeFilterByDevDep)).to.deep.equal([
//             {"v":"a", "w":"c"}
//         ])
//     })

//     it('should return all node edges', () => {
//         expect(g.nodeEdges('c')).to.deep.equal([
//             {"v":"a", "w":"c"},
//             {"v":"c", "w":"d"},
//             {"v":"c", "w":"e"}
//         ])
//     })

//     it('should return only node edges that pass filter function', () => {
//         expect(g.nodeEdges('a', edgeFilterByDevDep)).to.deep.equal([
//             {"v":"g", "w":"a"},
//             {"v":"a", "w":"c"}
//         ])
//     })

//     it('should return all node predecessors', () => {
//         expect(g.predecessors('a')).to.deep.equal(['g'])
//     })

//     it('should return all node predecessors by filter function', () => {
//         expect(g.predecessors('d', edgeFilterByRegularDep)).to.deep.equal(['c'])
//     })

//     it('should return all node successors', () => {
//         expect(g.successors('a')).to.deep.equal(['b','c'])
//     })

//     it('should return all node successors by filter function - one dep type', () => {
//         expect(g.successors('a', edgeFilterByPeerDep)).to.deep.equal(['b'])
//     })

//     it('should return empty successors by filter function - foreign dep type', () => {
//         expect(g.successors('a', edgeFilterByRegularDep)).to.deep.equal([])
//     })

//     it('should return all node successors by filter function - two dep types', () => {
//         expect(g.successors('a', edgeFilterByPeerOrDevDep)).to.deep.equal(['b','c'])
//     })

//     it('should return all neighbors for a given node', () => {
//         expect(g.neighbors('a')).to.deep.equal(['g','b','c'])
//     })

//     it('should return all node successors recursively as a graph', () => {
//         expect(g.getSuccessorsGraphRecursively('a').nodes()).to.deep.equal([ 'a', 'b', 'c', 'd', 'f', 'e' ])
//     })

//     it('should return all node successors recursively as a graph with filter function', () => {
//         expect(g.getSuccessorsGraphRecursively('a', edgeFilterByDevDep).nodes()).to.deep.equal([ 'a', 'c' ])
//     })

//     it('should return all node successors recursively as layers - version 1 - only successors', () => {
//         expect(g.getSuccessorsLayersRecursively('a').successorLayers).to.deep.equal([["a"],["b","c"],["e"],["d"],["f"]])
//     })

//     it('should return all node successors recursively as layers - version 1 - only cycles - empty', () => {
//         expect(g.getSuccessorsLayersRecursively('a').cycles).to.deep.equal([])
//     })

//     it('should return all node successors recursively as layers - version 2', () => {
//         let a = new Graph<NodeData, EdgeData>()
//         a.setNode("a", new SpecificNodeData('comp1', '1.0.0'))
//         a.setNode("b", new SpecificNodeData('comp2','2.0.0'))
//         a.setNode("c", new SpecificNodeData('comp3','1.0.1'))
//         a.setNode("d", new SpecificNodeData('comp4','15.0.0'))
//         a.setNode("e", new SpecificNodeData('comp5','3.0.0'))
//         a.setNode("f", new SpecificNodeData('comp6','2.0.0'))
//         a.setNode("g", new SpecificNodeData('comp7','2.0.0'))
//         a.setNode("h", new SpecificNodeData('comp7','2.0.0'))
//         a.setEdge("a", "b", new SpecificEdgeData("peer", 3))
//         a.setEdge("a", "g", new SpecificEdgeData("peer", 3))
//         a.setEdge("b", "c", new SpecificEdgeData("dev", 3))
//         a.setEdge("b", "f", new SpecificEdgeData("regular"))
//         a.setEdge("c", "e", new SpecificEdgeData("regular", 2))
//         a.setEdge("c", "d", new SpecificEdgeData("peer"))
//         a.setEdge("d", "f", new SpecificEdgeData("dev"))
//         a.setEdge("f", "g", new SpecificEdgeData("dev"))
//         a.setEdge("g", "h", new SpecificEdgeData("dev"))
//         a.setEdge("e", "h", new SpecificEdgeData("dev", 1))
//         expect(a.getSuccessorsLayersRecursively('a').successorLayers).to.deep.equal([["a"],["b"],["c"],["e","d"],["f"],["g"],["h"]])
//     })

//     it('should return all node successors recursively as layers with filter function', () => {
//         expect(g.getSuccessorsLayersRecursively('a', edgeFilterByDevDep).successorLayers).to.deep.equal([ ['a'], ['c'] ])
//     })

//     it('should return all node successors recursively as an array', () => {
//         expect(g.getSuccessorsArrayRecursively('a')).to.deep.equal([ 'b', 'c', 'd', 'f', 'e' ])
//     })

//     it('should return all node successors recursively as an array with filter function', () => {
//         expect(g.getSuccessorsArrayRecursively('a', edgeFilterByDevDep)).to.deep.equal([ 'c' ])
//     })

//     it('should return all node predecessors recursively as an array', () => {
//         expect(g.getPredecessorsArrayRecursively('c')).to.deep.equal([ 'a', 'g' ])
//     })

//     it('should return all node predecessors recursively as a graph', () => {
//         expect(g.getPredecessorsGraphRecursively('d').nodes()).to.deep.equal([ 'd', 'c', 'a', 'g', 'e' ])
//     })

//     it('should return all node predecessors recursively as a graph with filter function', () => {
//         expect(g.getPredecessorsGraphRecursively('d', edgeFilterByDevDep).nodes()).to.deep.equal([ 'd', 'e' ])
//     })

//     it('should return all node predecessors recursively as layers - version 1', () => {
//         expect(g.getPredecessorsLayersRecursively('d')).to.deep.equal([["d"],["e"],["c"],["a"],["g"]])
//     })

//     it('should return correct successors as layers for cyclic dependencies', () => {
//         g.setEdge('f','a', new SpecificEdgeData("regular", 3))
//         let s = g.getSuccessorsLayersRecursively('a')
//         expect(g.getSuccessorsLayersRecursively('a').successorLayers).to.deep.equal([["b","c"],["e"],["f","d"],["a"]])
//     })

//     it('should set all nodes in a batch', () => {
//         let nodeArr = [
//            new SpecificNode('1', new SpecificNodeData('1', '0.0.3')),
//            new SpecificNode('2', new SpecificNodeData('2', '0.0.3')),
//            new SpecificNode('3', new SpecificNodeData('3', '0.0.3'))
//         ]
//         let s = new Graph<SpecificNodeData, SpecificEdgeData>()
//         s.setNodes(nodeArr)
//         expect(s.nodeCount()).to.deep.equal(3)
//     })

//     it('should set all edges in a batch', () => {
//         let edgeArr = [
//             new SpecificEdge('1', '2', new SpecificEdgeData('peer', 2)),
//             new SpecificEdge('2', '3', new SpecificEdgeData('dev', 3))
//          ]
//          let s = new Graph<SpecificNodeData, SpecificEdgeData>()
//          s.setEdges(edgeArr)
//          expect(s.edgeCount()).to.deep.equal(2)
//     })

//     it('should construct a graph using constructor with nodes and edges as params', () => {
//         let nodeArr = [
//             new SpecificNode('1', new SpecificNodeData('1', '0.0.3')),
//             new SpecificNode('2', new SpecificNodeData('2', '0.0.3')),
//             new SpecificNode('3', new SpecificNodeData('3', '0.0.3'))
//          ]
//         let edgeArr = [
//         new SpecificEdge('1', '2', new SpecificEdgeData('peer', 2)),
//         new SpecificEdge('2', '3', new SpecificEdgeData('dev', 3)),
//         new SpecificEdge('3', '1', new SpecificEdgeData('peer', 2)),
//         ]
//         let s = new Graph<SpecificNodeData, SpecificEdgeData>(true, nodeArr, edgeArr)
//         expect(s.findCycles()).to.deep.equal([[ '3', '2', '1' ]])
//     })

// })

// function nodeFilterPredicateVersion(nodeData: SpecificNodeData){
//     return (nodeData.getVersion() === '2.0.0')
// }

// function nodeFilterPredicateComp(nodeData: SpecificNodeData){
//     return (nodeData.getBitId() === 'comp2')
// }

// function edgeFilterByRegularDep(edgeData: SpecificEdgeData){
//     return (edgeData.getDepType() === 'regular')
// }

// function edgeFilterByDevDep(edgeData: SpecificEdgeData){
//     return (edgeData.getDepType() === 'dev')
// }

// function edgeFilterByPeerDep(edgeData: SpecificEdgeData){
//     return (edgeData.getDepType() === 'peer')
// }

// function edgeFilterByPeerOrDevDep(edgeData: SpecificEdgeData){
//     return (edgeData.getDepType() === 'peer' || edgeData.getDepType() === 'dev')
// }

