import { isEqual } from 'lodash';

export type VertexId = string;

export class Vertex<VD> {
  constructor(
    /**
     * ID of the vertex.
     */
    readonly id: VertexId, 

    /**
     * data of
     */
    readonly attr: VD
  ) {}

  equals(vertex: Vertex<VD>) {
    if (this.id !== vertex.id) return false;
    return isEqual(this.attr, vertex.attr);
  }

  static fromObject<VD>(object: { id: VertexId; attr: VD }) {
    return new Vertex(object.id, object.attr);
  }
}
