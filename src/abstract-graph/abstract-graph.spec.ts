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
    g.setEdge("a", "b", ["depends on"])
    g.setEdge("a", "c", ["depends on"])
    g.setEdge("c", "d", ["depends on"])
    g.setEdge("c", "e", ["depends on"])
    g.setEdge("d", "f", ["depends on"])
    g.setEdge("e", "d", ["depends on"])
    g.setEdge("f", "a", ["depends on"])
    g.setEdge("g", "a", ["depends on"])


    it('should return node value', () => {
        expect(g.node("b")).to.deep.equal({ packageDependencies: ["3", "4"] })
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




  
})
