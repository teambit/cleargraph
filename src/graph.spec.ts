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
    stringify(){
        return JSON.stringify({name: this.name, version: this.version});
    }
}

class EdgeData {
    dep: 'peer' | 'dev' | 'regular';
    semDist: number;
    constructor(dep: 'peer' | 'dev' | 'regular', semDist: number){
        this.dep = dep;
        this.semDist = semDist;
    }
    stringify(){
        return JSON.stringify({dep: this.dep, semDist: this.semDist});
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
    let h = new Graph<NodeData, EdgeData>();
    let i = new Graph<NodeData, EdgeData>();
    
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

        it('should return edge source and target Ids by edgeId', () => {
            const { sourceId, targetId } = g.edgeNodesById('a->b');
            expect(sourceId).to.equal('a');
            expect(targetId).to.equal('b');
        })

        it('should return all graph nodes as a map', () => {
            const keys = [...g.nodes.keys()];
            expect(keys).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
        })

        it('should return all graph edges as a map', () => {
            const keys = [...g.edges.keys()];
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
            const nodeKeys = [...subgraph.nodes.keys()];
            const edgeKeys = [...subgraph.edges.keys()];
            expect(nodeKeys).to.deep.equal([ 'c', 'd', 'f', 'e' ]);
            expect(edgeKeys).to.deep.equal([ 'c->d', 'd->f', 'c->e', 'e->d' ]);
        })

        it('should find recursive predecessors sub-graph of a given node', () => {
            const node = g.node('d');
            const subgraph = !!node? g.predecessorsSubgraph(node.id) : new Graph()
            const nodeKeys = [...subgraph.nodes.keys()];
            const edgeKeys = [...subgraph.edges.keys()];
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
            g.deleteEdge('f','g');
        })

        it('should find all paths from one node to another', () => {
            g.setEdge('a','d', new EdgeData('dev', 2));
            g.setEdge('e','f', new EdgeData('dev', 2));
            expect(g.allPaths('a', 'd')).to.deep.equal([
                ['a', 'c', 'd'],
                ['a', 'c', 'e', 'd'],
                ['a', 'd']
            ]);
            g.deleteEdge('a','d');
            g.deleteEdge('e','f');
        })

        it('should return all cycles in graph', () => {
            g.setEdge('f','g', new EdgeData('dev', 2));
            expect(g.findCycles()).to.deep.equal([ [ 'e', 'g', 'f', 'd', 'c', 'a' ] ]);
            g.deleteEdge('f','g');
        })

        // it('should stringify graph', () => {
        //     const res = g.stringify();
        //     console.log(res)
        // })

        it('should build graph from JSON', () => {
            const json = {
                "nodes": [
                    {"id": 'a', "node": 'hello'},
                    {"id": 'b', node: 'world'}
                ],
                "edges": [
                    {"sourceId": 'a', "targetId": 'b', "edge": {}}
                ]
            };
            const newGraph = Graph.parse(JSON.stringify(json));
            expect([...newGraph.nodes.keys()]).to.deep.equal(['a', 'b']);
            expect([...newGraph.edges.keys()]).to.deep.equal(['a->b']);
            // const str = newGraph.stringify();
            // const graphFromStr = Graph.parse(str);
        } )
        

        before('creating graphs for merge', function(){
            console.log('before');
            h.setNode('a', new NodeData('a', 'comp17', '12.0.0'));
            h.setNode('h', new NodeData('h', 'comp20', '1.0.0'));
            h.setNode('i', new NodeData('i', 'comp11', '3.0.0'));
            h.setEdge('a', 'h', new EdgeData('peer', 3));
            h.setEdge('i', 'h', new EdgeData('dev', 2));

            i.setNode('a', new NodeData('a', 'comp34', '3.0.0'));
            i.setNode('j', new NodeData('j', 'comp53', '1.0.0'));
            i.setEdge('j', 'a', new EdgeData('peer', 1));
          });

        it('should merge graphs', () => {
            const res = g.merge([h, i]);
            expect(res.nodes.size).to.equal(10);
            expect(res.edges.size).to.equal(10);
            expect(res.edges.has('i->h')).to.be.true;

        })
    })
})