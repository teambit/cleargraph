# Cleargraph

Cleargraph is a graph library offering:
 * An abstraction over graphs that supports generic data types
 * Traversal over successors and predecessors
 * Use of user-defined filters on nodes and edges information and traversal
 * Strictly-typed implementation
 
## Installation

```sh
npm install cleargraph
yarn add cleargraph
```

## Getting started

The nodes and edges in the graph are represented by key-value pairs where the keys are strings, 
and the generics `N` and `E` represent the node value and edge value respectively.

When instantiating the graph, specify the values of `N` and `E`.
In addition, in order to allow graph serialization, N and E **must implement `toString()` and can implement `fromString()`**.

Here is an example of N (Node Data) and E (Edge Data) classes:

```typescript
class NodeData implements Serializable {
    name: string;
    radius: number;
    constructor(name:string, radius:number){
        this.name = name;
        this.radius = radius;
    }
    toString(){
        return JSON.stringify({name: this.name, radius: this.radius});
    }
    fromString(json:string){
        const obj = JSON.parse(json);
        return new NodeData(obj.name, obj.radius);
    }
}

class EdgeData implements Serializable {
    relationType: string;
    proximity: number;
    constructor(relationType: string, proximity: number){
        this.relationType = relationType;
        this.proximity = proximity;
    }
    toString(){
        return JSON.stringify({relationType: this.relationType, proximity: this.proximity});
    }
    fromString(json:string){
        const obj = JSON.parse(json);
        return new NodeData(obj.relationType, obj.proximity);
    }
}
```

Now we will use these classes to implement a graph:

```typescript

let g = new Graph<NodeData, EdgeData>();

new Node('a', new NodeData('comp1', '1.0.0'))

g.setNode(new Node('earth', new NodeData('earth', 6371)));
g.setNode(new Node('moon', new NodeData('moon', 1737)));
g.setNode(new Node('sun', new NodeData('sun', 696340)));
g.setEdge(new Edge('moon','earth', new EdgeData('orbits', 384400)));
g.setEdge(new Edge('earth','sun', new EdgeData('orbits', 147240000)));
```

## Contributing

Contributions are always welcome, no matter how large or small.

## License

Apache license, version 2.0
