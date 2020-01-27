import { EdgeData } from "./index";

export interface Edge<ED extends EdgeData> {
  sourceKey: string
  targetKey: string
  data: ED
}
