export interface InputNode<N = void> {
  /** The unique identifier of the node. */
  id: string;

  /** The data associated with a node. */
  data?: N;
}
