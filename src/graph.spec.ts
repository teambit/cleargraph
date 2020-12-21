import { Graph, CyclicError, Node, Edge } from "./index"
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
            expect(g.node("b")).to.deep.equal({
                id:"b",
                attr:{"id":"b","name":"comp2","version":"2.0.0"},
                _inEdges:["a->b"],
                _outEdges:[]});
        })

        it('should return undefined for missing node', () => {
            expect(g.node("l")).to.be.undefined;
        })

        it('should return edge', () => {
            expect(g.edge('a','b')).to.deep.equal({
                sourceId:"a",
                targetId:"b",
                attr:{"dep":"peer","semDist":3}});
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

        it('should override existing node with same id', () => {
            const newNodes = [{id: 'c', node: new NodeData('c', 'newNode', '1.0.0')}];
            expect(g.setNodes(newNodes).node('c')?.attr.name).to.equal('newNode');
            g.setNode('c', new NodeData('c', 'comp3', '1.0.0'));
        })

        it('should override existing edge with same source, target ids', () => {
            const newEdges = [{sourceId: 'a', targetId: 'b', edge: new EdgeData('dev', 3)}];
            g.setEdges(newEdges);
            expect(g.edge('a', 'b')?.attr.dep).to.equal('dev');
            g.setEdge('a', 'b', new EdgeData('peer', 3));
        })

        it('should not override existing node with same id', () => {
            const newNodes = [{id: 'c', node: new NodeData('c', 'newNode', '1.0.0')}];
            expect(g.setNodes(newNodes, false).node('c')?.attr.name).to.equal('comp3');
            g.setNode('c', new NodeData('c', 'comp3', '1.0.0'));
        })

        it('should not override existing edge with same source, target ids', () => {
            const newEdges = [{sourceId: 'a', targetId: 'b', edge: new EdgeData('dev', 3)}];
            g.setEdges(newEdges, false);
            expect(g.edge('a', 'b')?.attr.dep).to.equal('peer');
            g.setEdge('a', 'b', new EdgeData('peer', 3));
        })

        it('should return all graph nodes as a map', () => {
            const keys = [...g.nodeMap.keys()];
            expect(keys).to.deep.equal([ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
        })

        it('should return all graph edges as a map', () => {
            const keys = [...g.edgeMap.keys()];
            expect(keys).to.deep.equal(["a->b","a->c","c->d","c->e","d->f","e->d","g->a"]);
        })

        it('should return all graph nodes as an array', () => {
            const nodes = g.nodes;
            expect(nodes.length).to.equal(7);
            expect(nodes[0]).to.be.an('object');
        })

        it('should return all graph edges as an array', () => {
            const edges = g.edges;
            expect(edges.length).to.equal(7);
            expect(edges[0]).to.be.an('object');
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

        it('should return a map of all in edges of a given node', () => {
            const keys = [...g.inEdgesMap('d').keys()];
            expect(keys).to.deep.equal([ 'c->d', 'e->d' ]);
        })

        it('should return a map of all out edges of a given node', () => {
            const keys = [...g.outEdgesMap('a').keys()];
            expect(keys).to.deep.equal([ 'a->b', 'a->c' ]);
        })

        it('should return a map of all node edges of a given node', () => {
            const keys = [...g.nodeEdgesMap('a').keys()];
            expect(keys).to.deep.equal([ 'g->a', 'a->b', 'a->c' ]);
        })

        it('should return an array of all in edges of a given node', () => {
            const inEdges = g.inEdges('d');
            expect(inEdges.length).to.equal(2);
            expect(inEdges[0]).to.be.an('object');
            expect(inEdges[0].id).to.equal('c->d');
            // expect(inEdges).to.deep.equal([ 'c->d', 'e->d' ]);
        })

        it('should return an array of all out edges of a given node', () => {
            const outEdges = g.outEdges('a');
            expect(outEdges.length).to.equal(2);
            expect(outEdges[0]).to.be.an('object');
            expect(outEdges[0].id).to.equal('a->b');
            // expect(keys).to.deep.equal([ 'a->b', 'a->c' ]);
        })

        it('should return an array of all node edges of a given node', () => {
            const nodeEdges = g.nodeEdges('a');
            expect(nodeEdges.length).to.equal(3);
            expect(nodeEdges[0]).to.be.an('object');
            expect(nodeEdges[0].id).to.equal('g->a');
            // expect(nodeEdges).to.deep.equal([ 'g->a', 'a->b', 'a->c' ]);
        })

        it('should find immediate successors of a given node', () => {
            const keys = [...g.successorMap('c').keys()];
            expect(keys).to.deep.equal([ 'd', 'e' ]);
        })

        it('should find immediate predecessors of a given node', () => {
            const keys = [...g.predecessorMap('c').keys()];
            expect(keys).to.deep.equal([ 'a' ]);
        })

        it('should find neighbors of a given node', () => {
            const keys = [...g.neighborMap('c').keys()];
            expect(keys).to.deep.equal([ 'a', 'd', 'e' ]);
        })

        it('should find recursive successors sub-graph of a given node', () => {
            const node = g.node('c');
            const subgraph = node? g.successorsSubgraph(node.id) : new Graph()
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal([ 'c', 'd', 'f', 'e' ]);
            expect(edgeKeys).to.deep.equal([ 'c->d', 'd->f', 'c->e', 'e->d' ]);
        })

        it('should find recursive successors sub-graph of two nodes where one is a successor of the other', () => {
            const node1 = g.node('a');
            const node2 = g.node('c')
            const subgraph = node1 && node2? g.successorsSubgraph([node1.id, node2.id]) : new Graph();
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal([ 'a', 'b', 'c', 'd', 'f', 'e' ]);
            expect(edgeKeys).to.deep.equal([ 'a->b', 'a->c', 'c->d', 'd->f', 'c->e', 'e->d' ]);
        })

        it('should find recursive successors sub-graph of two nodes where one is *not* a successor of the other', () => {
            g.setNode('h', new NodeData('h', 'comp22', '1.0.0'));
            g.setEdge('b', 'h', new EdgeData('peer', 1));
            const node1 = g.node('b');
            const node2 = g.node('c')
            const subgraph = node1 && node2? g.successorsSubgraph([node1.id, node2.id]) : new Graph();
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal([ "b", "h", "c", "d", "f", "e" ]);
            expect(edgeKeys).to.deep.equal([ "b->h", "c->d", "d->f", "c->e", "e->d" ]);
            g.deleteNode('h');
            g.deleteEdge('b', 'h');
        })

        it('should find recursive predecessors sub-graph of a given node', () => {
            const node = g.node('d');
            const subgraph = node? g.predecessorsSubgraph(node.id) : new Graph()
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal([ 'd', 'c', 'a', 'g', 'e' ]);
            expect(edgeKeys).to.deep.equal(["c->d","a->c","g->a","e->d","c->e"]);
        })

        it('should find recursive predecessors sub-graph of two nodes where one is a predecessor of the other', () => {
            const node1 = g.node('d');
            const node2 = g.node('c')
            const subgraph = node1 && node2? g.predecessorsSubgraph([node1.id, node2.id]) : new Graph();
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal(["d", "c", "a", "g", "e"]);
            expect(edgeKeys).to.deep.equal(["c->d", "a->c", "g->a", "e->d", "c->e"]);
        })

        it('should find recursive predecessors sub-graph of two nodes where one is *not* a predecessor of the other', () => {
            g.setNode('h', new NodeData('h', 'comp22', '1.0.0'));
            g.setEdge('b', 'h', new EdgeData('peer', 1));
            const node1 = g.node('d');
            const node2 = g.node('h')
            const subgraph = node1 && node2? g.predecessorsSubgraph([node1.id, node2.id]) : new Graph();
            const nodeKeys = [...subgraph.nodeMap.keys()];
            const edgeKeys = [...subgraph.edgeMap.keys()];
            expect(nodeKeys).to.deep.equal( ["d", "c", "a", "g", "e", "h", "b"]);
            expect(edgeKeys).to.deep.equal(["c->d", "a->c", "g->a", "e->d", "c->e", "b->h", "a->b"]);
            g.deleteNode('h');
            g.deleteEdge('b', 'h');
        })

        it('should find recursive successors array of a given node', () => {
            const node = g.node('c');
            const arr = !!node? g.successors(node.id).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'd', 'f', 'e' ]);
        })

        it('should find recursive predecessors array of a given node', () => {
            const node = g.node('d');
            const arr = !!node? g.predecessors(node.id).map(elem => elem.id) : [];
            expect(arr).to.deep.equal([ 'c', 'a', 'g', 'e' ]);
        })

        it('should return all node successors recursively as layers - version 1', () => {
            expect(g.successorsLayers('a')).to.deep.equal([["a"],["b","c"],["e"],["d"],["f"]])
        })
    
        it('should return all node successors recursively as layers - version 2', () => {
            let a = new Graph<NodeData, EdgeData>()
            a.setNode('a', new NodeData('a', 'comp1', '1.0.0'));
            a.setNode('b', new NodeData('b', 'comp2', '2.0.0'));
            a.setNode('c', new NodeData('c', 'comp3', '1.0.1'));
            a.setNode('d', new NodeData('d', 'comp4', '15.0.0'));
            a.setNode('e', new NodeData('e', 'comp5', '3.0.0'));
            a.setNode('f', new NodeData('f', 'comp6', '2.0.0'));
            a.setNode('g', new NodeData('g', 'comp7', '2.0.0'));
            a.setNode('h', new NodeData('h', 'comp8', '2.0.0'));

            a.setEdge('a','b', new EdgeData('peer', 3));
            a.setEdge('a','g', new EdgeData('peer', 3));
            a.setEdge('b','c', new EdgeData('dev', 3));
            a.setEdge('b','f', new EdgeData('regular', 2));
            a.setEdge('c','e', new EdgeData('regular', 3));
            a.setEdge('c','d', new EdgeData('peer', 3));
            a.setEdge('d','f', new EdgeData('dev', 3));
            a.setEdge('f','g', new EdgeData('dev', 3));
            a.setEdge('e','h', new EdgeData('dev', 1));
            expect(a.successorsLayers('a')).to.deep.equal([["a"],["b"],["c"],["e","d"],["h","f"],["g"]])
        })
    
        it('should return all node successors recursively as layers with filter function', () => {
            expect(g.successorsLayers('a', edgeFilterByDevDep)).to.deep.equal([ ['a'], ['c'] ])
        })

        it('should return all node predecessors recursively as layers - version 1', () => {
            expect(g.predecessorsLayers('d')).to.deep.equal([["d"],["e"],["c"],["a"],["g"]])
        })
    
        it('should throw error for circular dependencies for successors as layers', () => {
            g.setEdge('f','a', new EdgeData('regular', 3));
            try{
                g.successorsLayers('a')
            } catch(e){
                expect(e.message).to.equal('cyclic dependency')
                g.deleteEdge('f','a');
                return
            }
            g.deleteEdge('f','a');
            expect.fail('should have thrown exception')
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
            g.setEdge('c','g', new EdgeData('dev', 2));
            g.setEdge('f','e', new EdgeData('dev', 2));
            const cycles = g.findCycles();
            expect(cycles).to.deep.equal([["e","f","d"],["g","c","a"]]);
            g.deleteEdge('c','g');
            g.deleteEdge('f','e');
        })

        // it('should stringify graph', () => {
        //     const res = g.stringify();
        //     console.log(res)
        // })

        it('should convert graph to json object', () => {
            const res = g.toJson();
            expect(res.nodes.length).to.equal(7);
            expect(res.edges.length).to.equal(7);
        })

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
            expect([...newGraph.nodeMap.keys()]).to.deep.equal(['a', 'b']);
            expect([...newGraph.edgeMap.keys()]).to.deep.equal(['a->b']);
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
            expect(res.nodeMap.size).to.equal(10);
            expect(res.edgeMap.size).to.equal(10);
            expect(res.edgeMap.has('i->h')).to.be.true;

        })
    })
})

function nodeFilterPredicateVersion(nodeData: Node<NodeData>){
    return (nodeData.attr.version === '2.0.0')
}

function nodeFilterPredicateComp(nodeData: Node<NodeData>){
    return (nodeData.attr.id === 'comp2')
}

function edgeFilterByRegularDep(edgeData: Edge<EdgeData>){
    return (edgeData.attr.dep === 'regular')
}

function edgeFilterByDevDep(edgeData: Edge<EdgeData>){
    return (edgeData.attr.dep === 'dev')
}

function edgeFilterByPeerDep(edgeData: Edge<EdgeData>){
    return (edgeData.attr.dep === 'peer')
}

function edgeFilterByPeerOrDevDep(edgeData: Edge<EdgeData>){
    return (edgeData.attr.dep === 'peer' || edgeData.attr.dep === 'dev')
}