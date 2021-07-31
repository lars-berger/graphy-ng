export interface TransformedNode<T = {}> {
  /** The unique identifier of the node. */
  id: string;

  /** The width of the node. */
  width: number;

  /** The height of the node. */
  height: number;

  /** The x-coordinate of the node. */
  x: number;

  /** The y-coordinate of the node. */
  y: number;

  /** CSS transform applied to nodes for placing them where they need to be in the graph. */
  transform: string;

  /**
   * Whether a node is currently displayed. Nodes are initially hidden until their dimensions
   * in the DOM are calculated, after which their width/height are passed to Dagre.
   */
  isVisible: boolean;

  /** The data associated with a node. */
  data: T;
}
