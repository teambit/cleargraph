# Graph API

**Table of contents**

[Creating a graph](#creating-a-graph)

[Nodes](#nodes)

[Edges](#edges)

[Sub-graph operations](#sub-graph-operations)

[Graph operations](#graph-operations)

[Serialization](#serialization)

[Drawing](#drawing)


## Creating a graph

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

**setNode(v, [label])**  

Creates or updates the value for a single node v in the graph.
```
g.setNode("my-id", "my-label");
```
**node(v)**

Returns the label assigned to the node with the id v if it is in the graph. Otherwise returns undefined. Takes O(1) time.

**hasNode(v)**

Returns true if the graph has a node with the id v. Takes O(1) time.

**nodeCount()**

Returns the number of nodes in the graph.

**setDefaultNodeLabel(val)**

Sets a new default value that is assigned to nodes that are created without a label. If val is not a function it is assigned as the label directly. If val is a function, it is called with the id of the node being created.

**nodes()**

Returns the ids of the nodes in the graph. Use node(v) to get the label for each node. Takes O(|V|) time.

**sources()**

Returns those nodes in the graph that have no in-edges. Takes O(|V|) time.

**sinks()**

Returns those nodes in the graph that have no out-edges. Takes O(|V|) time.

**removeNode(v)**

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

**setEdge(v, w, [label], [name]) # graph.setEdge(edgeObj, [label])**

Creates or updates the label for the edge (v, w) with the optionally supplied name. If label is supplied it is set as the value for the edge. If label is not supplied and the edge was created by this call then the default edge label will be assigned. The name parameter is only useful with multigraphs. Returns the graph, allowing this to be chained with other functions. Takes O(1) time.

**hasEdge(v, w, [name]) # graph.hasEdge(edgeObj)**

Returns true if the graph has an edge between v and w with the optional name. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

**edge(v, w, [name]) # graph.edge(edgeObj)**

Returns the label for the edge (v, w) if the graph has an edge between v and w with the optional name. Returned undefined if there is no such edge in the graph. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

**removeEdge(v, w)**

Removes the edge (v, w) if the graph has an edge between v and w with the optional name. If not this function does nothing. The name parameter is only useful with multigraphs. v and w can be interchanged for undirected graphs. Takes O(1) time.

**edgeCount()**

Returns the number of edges in the graph.


**setDefaultEdgeLabel(val)**

Sets a new default value that is assigned to edges that are created without a label. If val is not a function it is assigned as the label directly. If val is a function, it is called with the parameters (v, w, name).

**graph.edges()**

Returns the edgeObj for each edge in the graph. Use edge(edgeObj) to get the label for each edge. Takes O(|E|) time.

**graph.inEdges(v, [u])**

Return all edges that point to the node v. Optionally filters those edges down to just those coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead. Returns undefined if node v is not in the graph. Takes O(|E|) time.

**graph.outEdges(v, [w])**

Return all edges that are pointed at by node v. Optionally filters those edges down to just those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead. Returns undefined if node v is not in the graph. Takes O(|E|) time.

**graph.nodeEdges(v, [w])**

Returns all edges to or from node v regardless of direction. Optionally filters those edges down to just those between nodes v and w regardless of direction. Returns undefined if node v is not in the graph. Takes O(|E|) time.


## Sub-graph operations

**predecessors(v)**

Return all nodes that are immediate predecessors of the specified node or undefined if node v is not in the graph. Behavior is undefined for undirected graphs - use neighbors instead. Takes O(|V|) time.

**successors(v)**

Return all nodes that are immediate successors of the specified node or undefined if node v is not in the graph. Behavior is undefined for undirected graphs - use neighbors instead. Takes O(|V|) time.

**neighbors(v)**

Return all nodes that are immediate predecessors or successors of the specified node or undefined if node v is not in the graph. Takes O(|V|) time.

**graph.parent(v)**

Returns the node that is a parent of node v or undefined if node v does not have a parent or is not a member of the graph. Always returns undefined for graphs that are not compound. Takes O(1) time.

**graph.children(v)**

Returns all nodes that are children of node v or undefined if node v is not in the graph. Always returns [] for graphs that are not compound. Takes O(|V|) time.

**graph.setParent(v, parent)**

Sets the parent for v to parent if it is defined or removes the parent for v if parent is undefined. Throws an error if the graph is not compound. Returns the graph, allowing this to be chained with other functions. Takes O(1) time.


## Graph operations

**graph.graph()**

Returns the currently assigned label for the graph. If no label has been assigned, returns undefined. Example:

```
var g = new Graph();
g.graph(); // returns undefined
g.setGraph("graph-label");
g.graph(); // returns "graph-label"
```

**graph.setGraph(label)**

Sets the label for the graph to label.

**graph.isDirected()**

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

**graph.isMultigraph()**

Returns true if the graph is a multigraph.

**graph.isCompound()**

Returns true if the graph is compound.

## Serialization

## Drawing