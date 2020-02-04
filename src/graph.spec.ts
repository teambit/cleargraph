import { Graph } from "./index"
import { Node } from "./index";
import { Edge } from "./index";
import { expect } from "chai";

type NodeData = {name: string, version: string}
type EdgeData = {dep: string, semDist: number}

describe('graphTester', () => {
    let nodeArr = [
        new Node('a', {name: 'comp1', version: '1.0.0'}),
        new Node('b', {name: 'comp2', version: '2.0.0'}),
        new Node('c', {name: 'comp3', version: '1.0.1'}),
        new Node('d', {name: 'comp4', version: '15.0.0'}),
        new Node('e', {name: 'comp5', version: '3.0.0'}),
        new Node('f', {name: 'comp6', version: '2.0.0'}),
        new Node('g', {name: 'comp7', version: '2.0.0'})
    ];

    let edgeArr = [
        new Edge('a','b', {dep:'peer', semDist:3}),
        new Edge('a','c', {dep:'dev', semDist:3}),
        new Edge('c','d', {dep:'regular', semDist:3}),
        new Edge('c','e', {dep:'regular', semDist:2}),
        new Edge('d','f', {dep:'peer', semDist:1}),
        new Edge('e','d', {dep:'dev', semDist:1}),
        new Edge('g','a', {dep:'dev', semDist:1})
    ];

    let g = new Graph<NodeData, EdgeData>(nodeArr, edgeArr);
    
    describe('basicTester', () => {
        it('should return node', () => {
            expect(g.node("b")?.attr).to.deep.equal({ name: 'comp2', version: '2.0.0'});
        })

        it('should return undefined for missing node', () => {
            expect(g.node("l")).to.be.undefined;
        })

        it('should return edge', () => {
            expect(g.edge('a','b')?.attr).to.deep.equal({ dep: 'peer', semDist: 3});
        })

        it('should return undefined for missing edge', () => {
            expect(g.edge("l", "t")).to.be.undefined;
        })

        it('should return true for an existing edge', () => {
            expect(g.hasEdge("c", "d")).to.be.true;
        })

        it('should return all graph nodes', () => {
            const keys = [...g.allNodes().keys()];
            expect(keys).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
        })

        it('should return all graph edges', () => {
            const keys = [...g.allEdges().keys()];
            expect(keys).to.deep.equal(["a->b","a->c","c->d","c->e","d->f","e->d","g->a"]);
        })

        it('should return the correct node count', () => {
            expect(g.nodeCount()).to.equal(7);
        })

        it('should return the correct edge count', () => {
            expect(g.edgeCount()).to.equal(7);
        })

        it('should delete node', () => {
            g.setNode(new Node('h', {name: 'comp8', version: '1.0.0'}));
            expect(g.nodeCount()).to.equal(8);
            g.deleteNode('h');
            expect(g.nodeCount()).to.equal(7);
        })

        it('should delete edge', () => {
            g.setEdge(new Edge('g', 'd', {dep:'dev', semDist:1}));
            expect(g.edgeCount()).to.equal(8);
            g.deleteEdge('g','d');
            expect(g.edgeCount()).to.equal(7);
        })        

        it('should find all in edges of a given node', () => {
            const keys = [...g.inEdges('d').keys()];
            expect(keys).to.deep.equal([ 'c->d', 'e->d' ]);
        })

        it('should find all out edges of a given node', () => {
            const keys = [...g.outEdges('a').keys()];
            expect(keys).to.deep.equal([ 'a->b', 'a->c' ]);
        })

        it('should find all node edges of a given node', () => {
            const keys = [...g.nodeEdges('a').keys()];
            expect(keys).to.deep.equal([ 'g->a', 'a->b', 'a->c' ]);
        })

        it('should find immediate successors of a given node', () => {
            const keys = [...g.immediateSuccessors('c').keys()];
            expect(keys).to.deep.equal([ 'd', 'e' ]);
        })

        it('should find immediate predecessors of a given node', () => {
            const keys = [...g.immediatePredecessors('c').keys()];
            expect(keys).to.deep.equal([ 'a' ]);
        })

        it('should find neighbors of a given node', () => {
            const keys = [...g.neighbors('c').keys()];
            expect(keys).to.deep.equal([ 'a', 'd', 'e' ]);
        })

    })
    
})