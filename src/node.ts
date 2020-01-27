import { NodeData } from "./index";

export interface Node<ND extends NodeData> {
  key: string
  data: ND
}