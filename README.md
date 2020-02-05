# Cleargraph

Cleargraph is a graph library offering:
 * An abstraction over graphs that supports generic data types
 * Traversal over successors and predecessors
 * Use of user-defined filters on nodes and edges information and traversal
 * Strictly-typed implementation

## Getting started

The nodes and edges in the graph are represented by key-value pairs where the keys are strings, 
and the generics `ND` and `ED` represent the node value and edge value respectively.

When instantiating the graph, specify the values of `ND` and `ED`.

```typescript
type NodeData = { name: string, radius: number}
type EdgeData = { relationType: string, proximity: number}

let g = new Graph<NodeData, EdgeData>();

g.setNode(name: "earth", radius: 6371 );
g.setNode(name: "moon", radius: 1737);
g.setNode(name: "sun", radius: 696340);
g.setEdge("moon", "earth", { relationType: 'orbits', proximity: 384400 });
g.setEdge("earth", "sun", { relationType: 'orbits', proximity: 147240000 });

```

## Installation

```sh
npm install cleargraph
```

## Contributing

Contributions are always welcome, no matter how large or small.

## License

Apache license, version 2.0
