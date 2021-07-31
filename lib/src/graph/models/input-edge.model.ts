export interface InputEdge<T = void> {
  /** The unique identifier of the edge. */
  id: string;

  /** The ID of the node to point from. */
  sourceId: string;

  /** The ID of the node to point to. */
  targetId: string;

  /** The data associated with an edge. */
  data?: T;
}
