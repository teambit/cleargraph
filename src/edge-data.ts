export interface EdgeData {
    equals?(data:EdgeData): boolean
    clone?(): EdgeData
    merge?(data:EdgeData): EdgeData
  }
  