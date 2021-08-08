export interface TransformedNode<N = void> {
  /** The unique identifier of the node. */
  id: string;

  /** The width of the node. */
  _width: number;

  /** The height of the node. */
  _height: number;

  /** The x-coordinate of the node. */
  _x: number;

  /** The y-coordinate of the node. */
  _y: number;

  /** CSS transform applied to nodes for placing them where they need to be in the graph. */
  _transform: string;

  /**
   * Whether a node is currently displayed. Nodes are initially hidden until their dimensions
   * in the DOM are calculated, after which their width/height are passed to Dagre.
   */
  _isVisible: boolean;

  /** The data associated with a node. */
  data: N;
}
