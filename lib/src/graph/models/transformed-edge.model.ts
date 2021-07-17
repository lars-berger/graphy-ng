export interface TransformedEdge<T extends object = {}> {
  id: string;
  sourceId: string;
  targetId: string;
  pathDefinition: string;
  data?: T;
}
