export interface InputEdge<T = void> {
  id: string;
  sourceId: string;
  targetId: string;
  data?: T;
}
