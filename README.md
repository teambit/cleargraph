# Cleargraph

Cleargraph is a graph library extending Graphlib's functionality. It adds:
 * An abstraction over graphs that supports generic data types
 * Traversal over successors and predecessors
 * Use of user-defined filters on nodes and edges information and traversal
 * Strictly-typed implementation

## Getting started

The nodes and edges in the graph are represented by key-value pairs where the keys are strings, 
and the generics N and E represent the node value and edge value respectively.

When instantiating the graph, specify the values of N and E, and decide on the type of connections between the nodes using the 'directed' and 'multigraph' params.

* directed: set to true to get a directed graph and false to get an undirected graph. An undirected graph does not treat the order of nodes in an edge as significant. In other words, g.edge("a", "b") === g.edge("b", "a") for an undirected graph. Default: true.

* multigraph: set to true to allow a graph to have multiple edges between the same pair of nodes. Default: true.

```typescript
type NodeData = { name: string, radius: number}
type EdgeData = { relationType: string, proximity: number}
let g = new Graph<NodeData, EdgeData>() // by default this will create a directed graph that allows multi-edges
g.setNode(name: "earth", radius: 6371 );
g.setNode(name: "moon", radius: 1737);
g.setNode(name: "sun", radius: 696340);
g.setEdge("moon", "earth", { relationType: 'orbits', proximity: 384400 });
g.setEdge("earth", "sun", { relationType: 'orbits', proximity: 147240000 });
```

## Installation

> the library is not yet published.

## Contributing

Contributions are always welcome, no matter how large or small.

## License

Apache license, version 2.0
