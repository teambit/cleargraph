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
In addition, in order to allow graph serialization, N and E **should implement `stringify()`**.
If it's not implemented, the graph will call its own default serialization method that might not work for complex objects.

Here is an example of N (Node Data) and E (Edge Data) classes:

```typescript
class Orb { // a node in the graph
    name: string;
    radius: number;
    constructor(name:string, radius:number){
        this.name = name;
        this.radius = radius;
    }
    stringify(){ // Add a specific stringify() implementation if your class will not stringify correctly with just JSON.stringiy when serializing the graph
        return JSON.stringify({name: this.name, radius: this.radius});
    }
}

class OrbRelation{ // an edge in the graph
    relationType: string;
    proximity: number;
    constructor(relationType: string, proximity: number){
        this.relationType = relationType;
        this.proximity = proximity;
    }
    stringify(){
        return JSON.stringify({relationType: this.relationType, proximity: this.proximity});
    }
}
```

Using these classes to implement a graph:

```typescript

let g = new Graph<Orb, OrbRelation>();

g.setNode('earth', new Orb('earth', 6371));
g.setNode('moon', new Orb('moon', 1737));
g.setNode('sun', new Orb('sun', 696340));
g.setEdge('moon','earth', new OrbRelation('orbits', 384400));
g.setEdge('earth','sun', new OrbRelation('orbits', 147240000));
```

Some uses of the graph:

```typescript
g.node('moon');
// Orb{name: 'moon', radius: 1737}
```

```typescript
g.edge('earth', 'sun');
//OrbRelation{relationType: 'orbits', proximity: 147240000}
```

```typescript
g.succssors('moon'); // returns the immediate nodes the given node point to
// Map 
// {"earth" => Orb} {key: "earth", value: Orb}
//     key:"earth"
//     value:Orb {name: "earth", radius: 6371}
```

```typescript
g.successorsArray('moon'); // returns an array of all the nodes the given node points to *recursively*
// Array(2) [Orb, Orb]
// 0:Orb {name: "earth",radius: 6371}
// 1:Orb {name: "sun", radius: 696340}
```

```typescript
g.toposort(); // performs a topological sort on the graph
// Array(3) [Orb, Orb, Orb]
// 0:Orb {name: "moon",radius: 1737}
// 1:Orb {name: "earth",radius: 6371}
// 2:Orb {name: "sun", radius: 696340}
```

## Contributing

Contributions are always welcome, no matter how large or small.

## License

Apache license, version 2.0
