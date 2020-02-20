import { Graph, CyclicError } from "./index"
import { expect } from "chai";


class NodeData {
    id: string;
    name: string;
    version: string;
    constructor(id: string, name:string, version:string){
        this.id = id;
        this.name = name;
        this.version = version;
    }
    toString(){
        return JSON.stringify({name: this.name, version: this.version});
    }
    fromString(json:string){
        const obj = JSON.parse(json);
        return new NodeData(obj.id, obj.name, obj.version);
    }
}

class EdgeData {
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
        return new EdgeData(obj.dep, obj.semDist);
    }
}


describe('graphTester', () => {
    let nodeArr = [
        {id: 'a', node: new NodeData('a', 'comp1', '1.0.0')},
        {id: 'b', node: new NodeData('b', 'comp2', '2.0.0')},
        {id: 'c', node: new NodeData('c', 'comp3', '1.0.0')},
        {id: 'd', node: new NodeData('d', 'comp4', '15.0.0')},
        {id: 'e', node: new NodeData('e', 'comp5', '3.0.0')},
        {id: 'f', node: new NodeData('f', 'comp6', '2.0.0')},
        {id: 'g', node: new NodeData('g', 'comp7', '2.0.0')}
    ];

    let edgeArr = [
        {sourceId: 'a', targetId: 'b', edge: new EdgeData('peer', 3)},
        {sourceId: 'a', targetId: 'c', edge: new EdgeData('dev', 3)},
        {sourceId: 'c', targetId: 'd', edge: new EdgeData('regular', 3)},
        {sourceId: 'c', targetId: 'e', edge: new EdgeData('regular', 3)},
        {sourceId: 'd', targetId: 'f', edge: new EdgeData('peer', 1)},
        {sourceId: 'e', targetId: 'd', edge: new EdgeData('dev', 1)},
        {sourceId: 'g', targetId: 'a', edge: new EdgeData('dev', 1)}
    ];

    let g = new Graph<NodeData, EdgeData>(nodeArr, edgeArr);
    
    describe('basicTester', () => {
        it('should return node', () => {
            expect(g.node("b")).to.deep.equal({ id: 'b', name: 'comp2', version: '2.0.0'});
        })

        it('should return undefined for missing node', () => {
            expect(g.node("l")).to.be.undefined;
        })

        it('should return edge', () => {
            expect(g.edge('a','b')).to.deep.equal({ dep: 'peer', semDist: 3});
        })

        it('should return undefined for missing edge', () => {
            expect(g.edge("l", "t")).to.be.undefined;
        })

        it('should return true for an existing edge', () => {
            expect(g.hasEdge("c", "d")).to.be.true;
        })

        it('should return all graph nodes as a map', () => {
            const keys = [...g.nodesMap().keys()];
            expect(keys).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
        })

        it('should return all graph edges as a map', () => {
            const keys = [...g.edgesMap().keys()];
            expect(keys).to.deep.equal(["a->b","a->c","c->d","c->e","d->f","e->d","g->a"]);
        })

        it('should return the correct node count', () => {
            expect(g.nodeCount()).to.equal(7);
        })

        it('should return the correct edge count', () => {
            expect(g.edgeCount()).to.equal(7);
        })

        it('should return all graph sources', () => {
            const res = g.sources()
            const ids = res.map(elem => elem? elem.id: '');
            expect(ids).to.deep.equal(['g']);
        })

        it('should return all graph sinks', () => {
            const res = g.sinks()
            const ids = res.map(elem => elem? elem.id: '');
            expect(ids).to.deep.equal(['b', 'f']);        })

        it('should delete node', () => {
            g.setNode('h', new NodeData('h', 'comp8', '1.0.0'));
            expect(g.nodeCount()).to.equal(8);
            g.deleteNode('h');
            expect(g.nodeCount()).to.equal(7);
        })

        it('should delete edge', () => {
            g.setEdge('g', 'd', new EdgeData('dev', 1));
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
            const keys = [...g.successors('c').keys()];
            expect(keys).to.deep.equal([ 'd', 'e' ]);
        })

        it('should find immediate predecessors of a given node', () => {
            const keys = [...g.predecessors('c').keys()];
            expect(keys).to.deep.equal([ 'a' ]);
        })

        it('should find neighbors of a given node', () => {
            const keys = [...g.neighbors('c').keys()];
            expect(keys).to.deep.equal([ 'a', 'd', 'e' ]);
        })

        it('should find recursive successors sub-graph of a given node', () => {
            const node = g.node('c');
            const subgraph = !!node? g.successorsSubgraph(node.id) : new Graph()
            const nodeKeys = [...subgraph.nodesMap().keys()];
            const edgeKeys = [...subgraph.edgesMap().keys()];
            expect(nodeKeys).to.deep.equal([ 'c', 'd', 'f', 'e' ]);
            expect(edgeKeys).to.deep.equal([ 'c->d', 'd->f', 'c->e', 'e->d' ]);
        })

        it('should find recursive predecessors sub-graph of a given node', () => {
            const node = g.node('d');
            const subgraph = !!node? g.predecessorsSubgraph(node.id) : new Graph()
            const nodeKeys = [...subgraph.nodesMap().keys()];
            const edgeKeys = [...subgraph.edgesMap().keys()];
            expect(nodeKeys).to.deep.equal([ 'd', 'c', 'a', 'g', 'e' ]);
            expect(edgeKeys).to.deep.equal(["c->d","a->c","g->a","e->d","c->e"]);
        })

        it('should find recursive successors array of a given node', () => {
            const node = g.node('c');
            const arr = !!node? g.successorsArray(node.id).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'd', 'f', 'e' ]);
        })

        it('should find recursive predecessors array of a given node', () => {
            const node = g.node('d');
            const arr = !!node? g.predecessorsArray(node.id).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'c', 'a', 'g', 'e' ]);
        })

        it('should perform topological sort on the graph', () => {
            const res = g.toposort();
            const ids = res.map(elem => elem? elem.id: '');
            expect(ids).to.deep.equal([ 'g', 'a', 'b', 'c', 'e', 'd', 'f' ]);
        })

        it('should perform topological sort on the graph and return reverse order', () => {
            const res = g.toposort(true);
            const ids = res.map(elem => elem? elem.id: '');
            expect(ids).to.deep.equal([ 'f', 'd', 'e', 'c', 'b', 'a', 'g' ]);
        })

        it('should perform topological sort on graph with unconnected components', () => {
            g.deleteEdge('g', 'a');
            const res = g.toposort();
            const ids = res.map(elem => elem? elem.id: '');
            expect(ids).to.deep.equal([ 'a', 'b', 'c', 'e', 'd', 'f', 'g' ]);
            g.setEdge('g','a', new EdgeData('dev', 1));
        })

        it('should throw cyclic dependencies error on topological sort given graph with cycles', () => {
            const f = function () {g.toposort()};
            g.setEdge('f','g', new EdgeData('dev', 2));
            expect(f).to.throw(CyclicError);
        })

    })
    
})