export interface TransformedEdge<T = {}> {
  id: string;
  sourceId: string;
  targetId: string;
  pathDefinition: string;
  data: T;
}
