
import _ from 'lodash'

/**
 * uses the Tarjan algorithm as implemented in graphlib to return all cycles in the graph
 * @param g graph
 */

export function tarjan(g) {
var index = 0;
var stack = [];
var visited = {}; // node id -> { onStack, lowlink, index }
var results = [];

function dfs(v) {
    var entry = visited[v] = {
    onStack: true,
    lowlink: index,
    index: index++
    };
    //@ts-ignore
    stack.push(v);

    let successors = [...g.successors(v).keys()];
    successors.forEach(function(w) {
    if (!_.has(visited, w)) {
        dfs(w);
        entry.lowlink = Math.min(entry.lowlink, visited[w].lowlink);
    } else if (visited[w].onStack) {
        entry.lowlink = Math.min(entry.lowlink, visited[w].index);
    }
    });

    if (entry.lowlink === entry.index) {
    var cmpt = [];
    var w;
    do {
        w = stack.pop();
        visited[w].onStack = false;
        //@ts-ignore
        cmpt.push(w);
    } while (v !== w);
    //@ts-ignore
    results.push(cmpt);
    }
}

g.nodeKeys().forEach(function(v) {
    if (!_.has(visited, v)) {
    dfs(v);
    }
});

return results;
}