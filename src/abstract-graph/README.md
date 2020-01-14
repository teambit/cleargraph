# Graph API

**Table of contents**

[Creating a graph](#creating-a-graph)

[Nodes](#nodes)

[Edges](#edges)

[Setters](#setters)

[Getters](#getters)

[Deletion](#deletion)

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

A node is a key-value pair, where the key is a user-supplied string, and the value can be of any serializable type.

A type is serializable and can be used in a service interface if it

* is primitive, such as char, byte, short, int, long, boolean, float, or double;
* is String, Date, or a primitive wrapper such as Character, Byte, Short, Integer, Long, Boolean, Float, or Double;
* is an array of serializable types (including other serializable arrays);
* is a serializable user-defined class

## Edges

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

## Setters

**setNode(v, [label])**  
Creates or updates the value for a single node v in the graph.
```
g.setNode("my-id", "my-label");
```

**setEdge()**  






## Getters

## Deletion

## Serialization

## Drawing