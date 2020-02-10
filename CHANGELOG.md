# Change Log

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog. and this project adheres to Semantic Versioning.

## [2.0.0] - 2020-02-10

### New
* findCycles()
* isCyclic()
* tarjan algorithm
* stringify() on whole graph or sub-graph

### Changes
* generics ND and ED now extend Serializable. Must implement toString() and fromString()

## [1.0.0] - 2020-02-10

### BREAKING CHANGES
* Removed GraphLib and rewrote Graph from scratch without dependency on external graph library. New set of APIs and models.

### Changes
* Basic graph setters and getters
* Added successors and predecessors
* Added recursive successors and predecessors returned as array and sub-graph 


