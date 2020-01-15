# Graph API

**Table of contents**

* [Creating a graph](#creating-a-graph)

* [Nodes](#nodes)

* [Edges](#edges)

* [Sub-graph](#sub-graph)

* [Graph](#graph)

* [Serialization](#serialization)



## Creating a graph
--------------------

The creation of a new graph instance is identical to the instantiation of a graphLib object.
```
let graph = new Graph()
```
By default this will create a directed graph that does not allow multi-edges or compound nodes. The following options can be used when constructing a new graph:

* directed: set to true to get a directed graph and false to get an undirected graph. An undirected graph does not treat the order of nodes in an edge as significant. In other words, g.edge("a", "b") === g.edge("b", "a") for an undirected graph. Default: true.

* multigraph: set to true to allow a graph to have multiple edges between the same pair of nodes. Default: false.

* compound: set to true to allow a graph to have compound nodes - nodes which can be the parent of other nodes. Default: false.
To set the options, pass in an options object to the Graph constructor. For example, to create a directed compound multigraph:

```
var g = new Graph({ directed: true, compound: true, multigraph: true });
```

## Nodes
---------------

A node is a key-value pair, where the key is a user-supplied string, and the value can be of any serializable type.

A type is serializable and can be used in a service interface if it

* is primitive, such as char, byte, short, int, long, boolean, float, or double;
* is String, Date, or a primitive wrapper such as Character, Byte, Short, Integer, Long, Boolean, Float, or Double;
* is an array of serializable types (including other serializable arrays);
* is a serializable user-defined class

Methods:

***setNode(v, [label])***  

Creates or updates the value for a single node v in the graph.
```
g.setNode("my-id", "my-label");
```
***node(v)***

Returns the label assigned to the node with the id v if it is in the graph. Otherwise returns undefined. Takes O(1) time.

```
var g = new Graph();
g.setNode("my-id", "my-label");
g.node("my-id"); // returns "my-label"
```

***hasNode(v)***

Returns true if the graph has a node with the id v. Takes O(1) time.

***nodeCount()***

Returns the number of nodes in the graph.

***setDefaultNodeLabel(val)***

Sets a new default value that is assigned to nodes that are created without a label. If val is not a function it is assigned as the label directly. If val is a function, it is called with the id of the node being created.

***nodes()***

Returns the ids of the nodes in the graph. Use node(v) to get the label for each node. Takes O(|V|) time.

***filterNodes(filterFunction)*** - TODO

Returns all and only the nodes that pass the filter function.

***sources()***

Returns those nodes in the graph that have no in-edges. Takes O(|V|) time.

***sinks()***

Returns those nodes in the graph that have no out-edges. Takes O(|V|) time.

***removeNode(v)***

Remove the node with the id v in the graph or do nothing if the node is not in the graph. If the node was removed this function also removes any incident edges. Returns the graph, allowing this to be chained with other functions. Takes O(|E|) time.


## Edges
---------------

Edges in graphlib, which Graph extends, are identified by the nodes they connect. For example:

```
var g = new Graph();
g.setEdge("source", "target", "my-label");
g.edge("source", "target"); // returns "my-label"
```

However, we need a way to uniquely identify an edge in a single object for various edge queries (e.g. outEdges). We use edgeObjs for this purpose. They consist of the following properties:

v: the id of the source or tail node of an edge
w: the id of the target or head node of an edge
name (optional): the name that uniquely identifies a multi-edge.
Any edge function that takes an edge id will also work with an edgeObj. For example:

```
var g = new Graph();
g.setEdge("source", "target", "my-label");
g.edge({ v: "source", w: "target" }); // returns "my-label"
```

Methods:

***setEdge(v, w, [label], [name]) # setEdge(edgeObj, [label])***

Creates or updates the label(s) for the edge (v, w) with the optionally supplied name. If label is supplied it is set as the value for the edge. If label is not supplied and the edge was created by this call then the default edge label will be assigned. The name parameter is only useful with multigraphs. Returns the graph, allowing this to be chained with other functions. Takes O(1) time.

***hasEdge(v, w, [name]) # hasEdge(edgeObj)***

Returns true if the graph has an edge between v and w with the optional name. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

***edge(v, w, [name]) # edge(edgeObj)***

Returns the label for the edge (v, w) if the graph has an edge between v and w with the optional name. Returned undefined if there is no such edge in the graph. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

***removeEdge(v, w)***

Removes the edge (v, w) if the graph has an edge between v and w with the optional name. If not this function does nothing. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

***edgeCount()***

Returns the number of edges in the graph.

***setDefaultEdgeLabel(val)***

Sets a new default value that is assigned to edges that are created without a label. If val is not a function it is assigned as the label directly. If val is a function, it is called with the parameters (v, w, name).

***edges()***

Returns the edgeObj for each edge in the graph. Use edge(edgeObj) to get the label for each edge. Takes O(|E|) time.

***inEdges(v, [u])***

Return all edges that point to the node v. Optionally filters those edges down to just those coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead. Returns undefined if node v is not in the graph. Takes O(|E|) time.

***outEdges(v, [w])***

Return all edges that are pointed at by node v. Optionally filters those edges down to just those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead. Returns undefined if node v is not in the graph. Takes O(|E|) time.

***nodeEdges(v, [w])***

Returns all edges to or from node v regardless of direction. Optionally filters those edges down to just those between nodes v and w regardless of direction. Returns undefined if node v is not in the graph. Takes O(|E|) time.


## Sub-graph
---------------

Methods:

***predecessors(v | v[], byEdgeLabels=[], returnNodeInfo=false)*** - TODO

Return all nodes that are immediate predecessors of the specified node or undefined if node v is not in the graph. Behavior is undefined for undirected graphs - use neighbors instead. Takes O(|V|) time.

***successors(v | v[], byEdgeLabels=[], returnNodeInfo=false)*** - TODO

Return all nodes that are immediate successors of the specified node or undefined if node v is not in the graph. Behavior is undefined for undirected graphs - use neighbors instead. Takes O(|V|) time.

***neighbors(v | v[], byEdgeLabels=[], returnNodeInfo=false)*** - TODO

Return all nodes that are immediate predecessors or successors of the specified node or undefined if node v is not in the graph. Takes O(|V|) time.

***recursSuccessor(v | v[], byEdgeLabels=[], returnNodeInfo=false, returnStructure='flatList')*** - TODO  

Return all nodes that are successors of the specified node or nodes **recursively**, or undefined if node v is not in the graph, an empty array or an array with non-existing v. Behavior is undefined for undirected graphs - use neighbors instead.  
- byEdgeLabels = allows traversing the graph only along specific edge types. If empty array - traverse on all edge types.  
- returnNodeInfo = true returns all the node object. False (default) returns only the node key.  
- returnStructure = 'flatList' returns a flat list of all successor nodes.  
- returnStructure = 'subGraph' returns a sub-graph of all successor nodes.  
- returnStructure = 'layers' returns a layered representation (array of arrays) of all successor nodes.

***recursPredecessors(v | v[], byEdgeLabels=[], returnNodeInfo=false, returnStructure='flatList')*** - TODO   
Return all nodes that are predecessors of the specified node or nodes **recursively**, or undefined if node v is not in the graph, an empty array or an array with non-existing v. Behavior is undefined for undirected graphs - use neighbors instead.  
- byEdgeLabels = allows traversing the graph only along specific edge types. If empty array - traverse on all edge types.  
- returnNodeInfo = true returns all the node object. False (default) returns only the node key.
- returnStructure = 'flatList' returns a flat list of all successor nodes.
- returnStructure = 'subGraph' returns a sub-graph of all successor nodes.
- returnStructure = 'layers' returns a layered representation (array of arrays) of all successor nodes.




## Graph
---------------
Methods:

***graph()***

Returns the currently assigned label for the graph. If no label has been assigned, returns undefined. Example:

```
var g = new Graph();
g.graph(); // returns undefined
g.setGraph("graph-label");
g.graph(); // returns "graph-label"
```

***setGraph(label)***

Sets the label for the graph to label.

***diff(g)***

Gets a graph of the same type and returns two sub-graph that represent the difference:
- a sub-graph with the nodes and edges that exist in self but not in the param graph
- a sub-graph with the nodes and edges that exist in the param graph but not in self

***merge(g)***

Gets a graph of the same type and returns a graph with unified nodes and edges from both graphs.

***isDirected()***

Returns true if the graph is directed. A directed graph treats the order of nodes in an edge as significant whereas an undirected graph does not. This example demonstrates the difference:
```
var directed = new Graph({ directed: true });
directed.setEdge("a", "b", "my-label");
directed.edge("a", "b"); // returns "my-label"
directed.edge("b", "a"); // returns undefined

var undirected = new Graph({ directed: false });
undirected.setEdge("a", "b", "my-label");
undirected.edge("a", "b"); // returns "my-label"
undirected.edge("b", "a"); // returns "my-label"
```

***isMultigraph()***

Returns true if the graph is a multigraph.

***isCompound()***

Returns true if the graph is compound.

## Serialization
-----------------

***json.write(g)***

Creates a JSONrepresentation of the graph that can be serialized to a string with JSON.stringify. The graph can later be restored using json-read.

```
var g = new graphlib.Graph();
g.setNode("a", { label: "node a" });
g.setNode("b", { label: "node b" });
g.setEdge("a", "b", { label: "edge a->b" });
graphlib.json.write(g);
// Returns the object:
//
// {
//   "options": {
//     "directed": true,
//     "multigraph": false,
//     "compound": false
//   },
//   "nodes": [
//     { "v": "a", "value": { "label": "node a" } },
//     { "v": "b", "value": { "label": "node b" } }
//   ],
//   "edges": [
//     { "v": "a", "w": "b", "value": { "label": "edge a->b" } }
//   ]
// }
```

***json.read(json)***

Takes JSON as input and returns the graph representation. For example, if we have serialized the graph in json-write to a string named str, we can restore it to a graph as follows:
```
var g2 = graphlib.json.read(JSON.parse(str));
// or, in order to copy the graph
var g3 = graphlib.json.read(graphlib.json.write(g))

g2.nodes();
// ['a', 'b']
g2.edges()
// [ { v: 'a', w: 'b' } ]
```


## Algorithms
-----------------
See algorithms in [GraphLib documentation](https://github.com/dagrejs/graphlib/wiki/API-Reference#algorithms).