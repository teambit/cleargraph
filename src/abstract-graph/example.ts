import { Graph } from './abstract-graph'

let g = new Graph()
g.setNode("a", { packageDependencies: ["graph1", "graph2"] });
g.setNode("b", { packageDependencies: ["graph1", "graph2"] });
g.setNode("c", { packageDependencies: ["graph1", "graph2"] });
console.log(g.nodes());

g.setEdge("a", "b", ["ney"])
g.setEdge("b", "c", ["yay"])

console.log(g.hasEdge("b","c"))
console.log(g.edge("a","b"))