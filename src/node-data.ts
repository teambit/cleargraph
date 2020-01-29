
export interface NodeData {
  equals?(data:NodeData): boolean
  clone?(): NodeData
  merge?(data:NodeData): NodeData
}