# Change Log

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog. and this project adheres to Semantic Versioning.

## [5.7.0] - 2020-11-19

### New
* Returning types as `this` instead of `Graph<N, E>` to improve support for inheritence.
* Added graphNodes and graphEdges getters that return full nodes/edges objects.

## [5.7.0] - 2020-05-05

### New
* Added successorsLayers and predecessorsLayers.

## [5.6.0] - 2020-04-01

### New
* successors and predecessors subgraph methods refactored and support multiple entry points.

## [5.5.0] - 2020-03-31

### New
* added overrideExisting flag (default true) to setNode(), setNodes(), setEdge(), setEdges()

## [5.4.0] - 2020-03-24

### New
* g.parse() can now accept json param as string or object.

## [5.3.0] - 2020-03-23

### New
* Added g.toJson() that returns the graph as a JSON object. User can define on N and E a specific toJson() method. If not defined, the N and E objects will be used as they are.
* Added optional parameters to g.parse(): parseNode() and parseEdge() which allows users to define their own parse functions to the generic Node and Edge


## [5.2.0] - 2020-03-12

### New
* Added edgeNodesById(edgeId:string) that allows sending an edgeId of the format "a->b" and returns { sourceId: string | undefined, targetId: string | undefined}


## [5.1.0] - 2020-03-10

### New
* Added allPaths(source, target) which finds all possible paths between two nodes


## [5.0.0] - 2020-03-10

### BREAKING CHANGES
* Changed the output of graph stringify() to match the input of graph parse():
```
{
    nodes: {id: string, node: string}[],
    edges: {sourceId: string, targetId: string, edge: string}[]
}
```

## [4.3.0] - 2020-03-09

### bug fixes
* fixed graph stringify()

### New
* Added graph parse(json:string) which builds a graph from JSON string
* N and E should now implement 'strigify()' instead of 'toString()' for graph serialization. Otherwise a default stringify() will be called, which may not work with complex objects.


## [4.2.2] - 2020-03-04

### bug fixes
* fixed findCycles()

## [4.2.1] - 2020-02-27

### bug fixes
* return type change in toposort and small fix in readme


## [4.2.0] - 2020-02-27

### New
* Added merge() method.


## [4.1.0] - 2020-02-25

### BREAKING CHANGES
* Removed nodesMap() and edgesMap(). nodes and edges getters now return a map.

### Bug fixes
* Corrected graph.stringify()

## [4.0.0] - 2020-02-20

### BREAKING CHANGES
* Separated node and edge IDs from their data:
    * setters signatures changed:
        * setNode(id: string, node: N)
        * setEdge(sourceId: string, targetId: string, edge: E)
        * setNodes(nodes: {id: string, node: N}[])
        * setEdges(edges: {sourceId: string, targetId: string, edge:E}[])
    * API getters now get nodeId(string), and return N (user defined node) objects and not the internal GraphNode objects.
    * Updated all related code and added internal getters and setters that return GraphNode objects.
* No longer need to implement Serializable. Implementing toString() is now optional on the user-defined node (N). If not implemented, the default JSON.stringify() is used. 

## [3.0.3] - 2020-02-12

### New
* Added graph sinks and sources.

## [3.0.2] - 2020-02-12

### Bug fixes
* Made sure toposort can't return undefined.

## [3.0.1] - 2020-02-12

### New
* Added fromString() and fromObject() static functions on Node and Edge.

## [3.0.0] - 2020-02-12

### BREAKING CHANGES
* In toposort() removed initial nodes filter and added reverse (default false) for ordering of results.
* In toposort() now returning an array of nodes and not an array of keys. 

## [2.0.3] - 2020-02-11

### Changes
* Changed fromString() to optional on Serializable.

## [2.0.0] - 2020-02-10

### New
* findCycles()
* isCyclic()
* tarjan algorithm
* stringify() on whole graph or sub-graph

### Changes
* generics N and E now extend Serializable. Must implement toString() and fromString()

## [1.0.0] - 2020-02-05

### BREAKING CHANGES
* Removed GraphLib and rewrote Graph from scratch without dependency on external graph library. New set of APIs and models.

### Changes
* Basic graph setters and getters
* Added successors and predecessors
* Added recursive successors and predecessors returned as array and sub-graph 


