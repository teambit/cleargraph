import { Graph, CyclicError, Serializable } from "./index"
import { Node } from "./index";
import { Edge } from "./index";
import { expect } from "chai";


class NodeData implements Serializable {
    name: string;
    version: string;
    constructor(name:string, version:string){
        this.name = name;
        this.version = version;
    }
    toString(){
        return JSON.stringify({name: this.name, version: this.version});
    }
    fromString(json:string){
        const obj = JSON.parse(json);
        return new NodeData(obj.name, obj.version);
    }
}

class EdgeData implements Serializable {
    dep: 'peer' | 'dev' | 'regular';
    semDist: number;
    constructor(dep: 'peer' | 'dev' | 'regular', semDist: number){
        this.dep = dep;
        this.semDist = semDist;
    }
    toString(){
        return JSON.stringify({dep: this.dep, semDist: this.semDist});
    }
    fromString(json:string){
        const obj = JSON.parse(json);
        return new NodeData(obj.dep, obj.semDist);
    }
}


describe('graphTester', () => {
    let nodeArr = [
        new Node('a', new NodeData('comp1', '1.0.0')),
        new Node('b', new NodeData('comp2', '2.0.0')),
        new Node('c', new NodeData('comp3', '1.0.1')),
        new Node('d', new NodeData('comp4', '15.0.0')),
        new Node('e', new NodeData('comp5', '3.0.0')),
        new Node('f', new NodeData('comp6', '2.0.0')),
        new Node('g', new NodeData('comp7', '2.0.0'))
    ];

    let edgeArr = [
        new Edge('a','b', new EdgeData('peer', 3)),
        new Edge('a','c', new EdgeData('dev', 3)),
        new Edge('c','d', new EdgeData('regular', 3)),
        new Edge('c','e', new EdgeData('regular', 3)),
        new Edge('d','f', new EdgeData('peer', 1)),
        new Edge('e','d', new EdgeData('dev', 1)),
        new Edge('g','a', new EdgeData('dev', 1)),
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
            const keys = [...g.nodesMap().keys()];
            expect(keys).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
        })

        it('should return all graph edges', () => {
            const keys = [...g.edgesMap().keys()];
            expect(keys).to.deep.equal(["a->b","a->c","c->d","c->e","d->f","e->d","g->a"]);
        })

        it('should return the correct node count', () => {
            expect(g.nodeCount()).to.equal(7);
        })

        it('should return the correct edge count', () => {
            expect(g.edgeCount()).to.equal(7);
        })

        it('should delete node', () => {
            g.setNode(new Node('h', new NodeData('comp8', '1.0.0')));
            expect(g.nodeCount()).to.equal(8);
            g.deleteNode('h');
            expect(g.nodeCount()).to.equal(7);
        })

        it('should delete edge', () => {
            g.setEdge(new Edge('g', 'd', new EdgeData('dev', 1)));
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

        it('should find recursive successors sub-graph of a given node', () => {
            const node = g.node('c');
            const subgraph = !!node? g.successorsSubgraph(node) : new Graph()
            const nodeKeys = [...subgraph.nodesMap().keys()];
            const edgeKeys = [...subgraph.edgesMap().keys()];
            expect(nodeKeys).to.deep.equal([ 'c', 'd', 'f', 'e' ]);
            expect(edgeKeys).to.deep.equal([ 'c->d', 'd->f', 'c->e', 'e->d' ]);
        })

        it('should find recursive predecessors sub-graph of a given node', () => {
            const node = g.node('d');
            const subgraph = !!node? g.predecessorsSubgraph(node) : new Graph()
            const nodeKeys = [...subgraph.nodesMap().keys()];
            const edgeKeys = [...subgraph.edgesMap().keys()];
            expect(nodeKeys).to.deep.equal([ 'd', 'c', 'a', 'g', 'e' ]);
            expect(edgeKeys).to.deep.equal(["c->d","a->c","g->a","e->d","c->e"]);
        })

        it('should find recursive successors array of a given node', () => {
            const node = g.node('c');
            const arr = !!node? g.successorsArray(node).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'd', 'f', 'e' ]);
        })

        it('should find recursive predecessors array of a given node', () => {
            const node = g.node('d');
            const arr = !!node? g.predecessorsArray(node).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'c', 'a', 'g', 'e' ]);
        })

        it('should perform topological sort on the graph', () => {
            const res = g.toposort();
            expect(res).to.deep.equal([ 'g', 'a', 'b', 'c', 'e', 'd', 'f' ]);
        })

        it('should perform topological sort on specific nodes', () => {
            const res = g.toposort(['e', 'b', 'a']);
            expect(res).to.deep.equal([ 'a', 'b', 'e' ]);
        })

        it('should perform topological sort on graph with unconnected components', () => {
            g.deleteEdge('g', 'a');
            const res = g.toposort();
            expect(res).to.deep.equal([ 'a', 'b', 'c', 'e', 'd', 'f', 'g' ]);
            g.setEdge(new Edge('g','a', new EdgeData('dev', 1)));
        })

        it('should throw cyclic dependencies error on topological sort given graph with cycles', () => {
            const f = function () {g.toposort()};
            g.setEdge(new Edge('f','g', new EdgeData('dev', 2)));
            expect(f).to.throw(CyclicError);
        })

    })
    
})