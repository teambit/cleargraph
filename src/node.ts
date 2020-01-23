export type NodeId = string;

export class Node<N> {
  constructor(readonly key: NodeId, readonly value: N) {}

  static fromObject<N>(object: { key: NodeId; value: N }) {
    return new Node(object.key, object.value);
  }
}
