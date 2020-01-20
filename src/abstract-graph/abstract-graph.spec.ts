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
    g.setEdge("f", "a", {depType: "regular"})
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
        expect(g.sinks()).to.deep.equal(['b'])
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

    it('should return correct numbe of graph edges', () => {
        expect(g.edgeCount()).to.equal(8)
    })

    it('should return in edges', () => {
        expect(g.inEdges('a')).to.deep.equal([
            {"v":"f", "w":"a"},
            {"v":"g", "w":"a"}
        ])
    })

    it('should return out edges', () => {
        expect(g.outEdges('c')).to.deep.equal([
            {"v":"c", "w":"d"},
            {"v":"c", "w":"e"}
        ])
    })

    it('should return all node edges', () => {
        expect(g.nodeEdges('c')).to.deep.equal([
            {"v":"a", "w":"c"},
            {"v":"c", "w":"d"},
            {"v":"c", "w":"e"}
        ])
    })

    it('should return all node predecessors', () => {
        expect(g.predecessors('a')).to.deep.equal(['f','g'])
    })

    it('should return all node predecessors by edge label', () => {
        expect(g.predecessors('a', {key: "depType", val:"dev"})).to.deep.equal(['g'])
    })

    it('should return all node predecessors by edge label with node info', () => {
        expect(g.predecessors('a', {key: "depType", val:"dev"}, true)).to.deep.equal({"g" :{ packageDependencies: ["13", "14"] }})
    })

    it('should return all node successors', () => {
        expect(g.successors('a')).to.deep.equal(['b','c'])
    })

    it('should return all node successors by edge label', () => {
        expect(g.successors('a', {key: "depType", val:"dev"})).to.deep.equal(['c'])
    })

    it('should return all node predecessors by edge label with node info', () => {
        expect(g.successors('a', {key: "depType", val:"dev"}, true)).to.deep.equal({"c": { packageDependencies: ["5", "6"] }})
    })

    it('should return all neighbors for a given node without node info', () => {
        expect(g.neighbors('a')).to.deep.equal(['f','g','b','c'])
    })

    it('should return all neighbors for a given node with node info', () => {
        expect(g.neighbors('a',{key:'',val:''}, true)).to.deep.equal({
            "f": { packageDependencies: ["11", "12"] },
            "g": { packageDependencies: ["13", "14"] },
            "b": { packageDependencies: ["3", "4"] },
            "c": { packageDependencies: ["5", "6"] }

        })
    })

    it('should return all successors recursively for a node', () => {
        expect(g.recursSuccessors('a')).to.deep.equal([ 'b', 'c', 'd', 'f', 'a', 'e' ])
    })
})

function nodeFilterPredicate(nodeData: NodeData){}

function edgeFilterByPackageDep(edgeData: EdgeData){
    return (edgeData.depType === 'regular')
}

function edgeFilterByPackageOrDevDep(edgeData: EdgeData){
    return (edgeData.depType === 'regular' || edgeData.depType === 'dev')
}

