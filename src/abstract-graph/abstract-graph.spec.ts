import { Graph } from '.'
import { expect } from 'chai'

describe('GraphTester', () => {
    let g = new Graph()
    g.setNode("a", { packageDependencies: ["1", "2"] })
    g.setNode("b", { packageDependencies: ["3", "4"] })
    g.setNode("c", { packageDependencies: ["5", "6"] })
    g.setNode("d", { packageDependencies: ["7", "8"] })
    g.setNode("e", { packageDependencies: ["9", "10"] })
    g.setNode("f", { packageDependencies: ["11", "12"] })
    g.setNode("g", { packageDependencies: ["13", "14"] })
    g.setEdge("a", "b", {depType: "peer", semDist: 3})
    g.setEdge("a", "c", {depType: "dev", semDist: 1})
    g.setEdge("c", "d", {depType: "package"})
    g.setEdge("c", "e", {depType: "package", semDist: 2})
    g.setEdge("d", "f", {depType: "peer"})
    g.setEdge("e", "d", {depType: "dev"})
    g.setEdge("f", "a", {depType: "package"})
    g.setEdge("g", "a", {depType: "dev", semDist: 1})


    it('should return node value', () => {
        expect(g.node("b")).to.deep.equal({ packageDependencies: ["3", "4"] })
    })

    it('should get node info for a single node key', () => {
        expect(g.getNodeInfo("a")).to.deep.equal({ "a": { packageDependencies: ["1", "2"] } })
    })

    it('should get node info for multiple node keys', () => {
        expect(g.getNodeInfo(["a","b"])).to.deep.equal(
            { "a": { packageDependencies: ["1", "2"] },
              "b": { packageDependencies: ["3", "4"] }})
    })

    it('should return graph nodes', () => {
        expect(g.nodes()).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ])
    })

    it('should return graph nodes and values', () => {
        let k = new Graph()
        k.setNode('1', {'name':'comp1'})
        k.setNode('2', {'name':'comp2'})
        let nodes = k.nodes(true)
        expect(nodes).to.deep.equal({"1":{"name":"comp1"},"2":{"name":"comp2"}})
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
  
})
