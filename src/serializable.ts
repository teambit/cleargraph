
export interface Serializable {
    toString(): string
    fromString?(json:string): any
}

  