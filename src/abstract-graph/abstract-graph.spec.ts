import { Graph } from '.'
import { expect } from 'chai'

type DepType = 'peer' | 'regular' | 'dev'
type NodeData = { bitId: string, version: string}
type EdgeData = { depType: DepType, semDist?: 1 | 2 | 3 }

describe('GraphTester', () => {
    let g = new Graph<NodeData, EdgeData>()
    g.setNode("a", { bitId: 'comp1', version: '1.0.0'})
    g.setNode("b", { bitId: 'comp2', version: '2.0.0'})
    g.setNode("c", { bitId: 'comp3', version: '1.0.1'})
    g.setNode("d", { bitId: 'comp4', version: '15.0.0'})
    g.setNode("e", { bitId: 'comp5', version: '3.0.0'})
    g.setNode("f", { bitId: 'comp6', version: '2.0.0'})
    g.setNode("g", { bitId: 'comp7', version: '2.0.0'})
    g.setEdge("a", "b", {depType: "peer", semDist: 3})
    g.setEdge("a", "c", {depType: "dev", semDist: 3})
    g.setEdge("c", "d", {depType: "regular"})
    g.setEdge("c", "e", {depType: "regular", semDist: 2})
    g.setEdge("d", "f", {depType: "peer"})
    g.setEdge("e", "d", {depType: "dev"})
    g.setEdge("g", "a", {depType: "dev", semDist: 1})

    it('should return node value', () => {
        expect(g.node("b")).to.deep.equal({ bitId: 'comp2', version: '2.0.0'})
    })

    it('should get node info for a single node key', () => {
        expect(g.getNodeInfo("a")).to.deep.equal({ a: { bitId: 'comp1', version: '1.0.0'}})
    })

    it('should get node info for multiple node keys', () => {
        expect(g.getNodeInfo(["a","b"])).to.deep.equal(
            { "a": { bitId: 'comp1', version: '1.0.0'},
              "b": { bitId: 'comp2', version: '2.0.0'}})
    })

    it('should return graph nodes', () => {
        expect(g.nodes()).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ])
    })

    it('should return true for existing node', () => {
        expect(g.hasNode('c')).to.be.true
    })

    it('should return false for non-existing node', () => {
        expect(g.hasNode('h')).to.be.false
    })

    it('should return correct number of nodes in the graph', () => {
        expect(g.nodeCount()).to.equal(7)
    })

    it('should return correct sources', () => {
        expect(g.sources()).to.deep.equal(['g'])
    })

    it('should return correct sinks', () => {
        expect(g.sinks()).to.deep.equal(['b', 'f'])
    })

    it('should return true for existing edge', () => {
        expect(g.hasEdge('c', 'd')).to.be.true
    })

    it('should return false for edge in the wrong direction', () => {
        expect(g.hasEdge('d','c')).to.be.false
    })

    it('should return a value for an edge in the graph', () => {
        expect(g.edge('a','b')).to.deep.equal({depType: "peer", semDist: 3})
    })

    it('should return correct number of graph edges', () => {
        expect(g.edgeCount()).to.equal(7)
    })

    it('should return correct number of graph edges with filter function', () => {
        expect(g.edgeCount(edgeFilterByDevDep)).to.equal(3)
    })

    it('should return in edges', () => {
        expect(g.inEdges('a')).to.deep.equal([
            {"v":"g", "w":"a"}
        ])
    })

    it('should return only in edges that pass filter function', () => {
        expect(g.inEdges('d', edgeFilterByRegularDep)).to.deep.equal([
            {"v":"c", "w":"d"}
        ])
    })

    it('should return out edges', () => {
        expect(g.outEdges('c')).to.deep.equal([
            {"v":"c", "w":"d"},
            {"v":"c", "w":"e"}
        ])
    })

    it('should return only out edges that pass filter function', () => {
        expect(g.outEdges('a', edgeFilterByDevDep)).to.deep.equal([
            {"v":"a", "w":"c"}
        ])
    })

    it('should return all node edges', () => {
        expect(g.nodeEdges('c')).to.deep.equal([
            {"v":"a", "w":"c"},
            {"v":"c", "w":"d"},
            {"v":"c", "w":"e"}
        ])
    })

    it('should return only node edges that pass filter function', () => {
        expect(g.nodeEdges('a', edgeFilterByDevDep)).to.deep.equal([
            {"v":"g", "w":"a"},
            {"v":"a", "w":"c"}
        ])
    })

    it('should return all node predecessors', () => {
        expect(g.predecessors('a')).to.deep.equal(['f','g'])
    })

    it('should return all node predecessors by filter function', () => {
        expect(g.predecessors('a', edgeFilterByRegularDep)).to.deep.equal(['f'])
    })

    it('should return all node successors', () => {
        expect(g.successors('a')).to.deep.equal(['b','c'])
    })

    it('should return all node successors by filter function - one dep type', () => {
        expect(g.successors('a', edgeFilterByPeerDep)).to.deep.equal(['b'])
    })

    it('should return empty successors by filter function - foreign dep type', () => {
        expect(g.successors('a', edgeFilterByRegularDep)).to.deep.equal([])
    })

    it('should return all node successors by filter function - two dep types', () => {
        expect(g.successors('a', edgeFilterByPeerOrDevDep)).to.deep.equal(['b','c'])
    })

    it('should return all neighbors for a given node', () => {
        expect(g.neighbors('a')).to.deep.equal(['f','g','b','c'])
    })

    it('should return all successors recursively for a node', () => {
        expect(g.recursSuccessors('a')).to.deep.equal([ 'b', 'c', 'd', 'f', 'a', 'e' ])
    })

    it('should return all successors recursively for a node with filter function - one dep type', () => {
        expect(g.recursSuccessors('a', edgeFilterByDevDep)).to.deep.equal([ 'c' ])
    })

    it('should return all successors recursively for a node with filter function - two dep types', () => {
        expect(g.recursSuccessors('a', edgeFilterByRegularOrDevDep)).to.deep.equal([ 'c', 'e', 'd' ])
    })

    it('should throw error for circular dependencies', () => {
        g.setEdge("f", "a", {depType: "regular"}) // adding a circular dependency
        expect(g.successors('a', edgeFilterByPeerOrDevDep)).to.deep.equal(['b','c'])
    })

})

function nodeFilterPredicate(nodeData: NodeData){}

function edgeFilterByRegularDep(edgeData: EdgeData){
    return (edgeData.depType === 'regular')
}

function edgeFilterByDevDep(edgeData: EdgeData){
    return (edgeData.depType === 'dev')
}

function edgeFilterByPeerDep(edgeData: EdgeData){
    return (edgeData.depType === 'peer')
}

function edgeFilterByPeerOrDevDep(edgeData: EdgeData){
    return (edgeData.depType === 'peer' || edgeData.depType === 'dev')
}

function edgeFilterByRegularOrDevDep(edgeData: EdgeData){
    return (edgeData.depType === 'regular' || edgeData.depType === 'dev')
}

