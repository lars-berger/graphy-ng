export interface InputEdge<T extends object = {}> {
  id: string;
  sourceId: string;
  targetId: string;
  data?: T;
}
