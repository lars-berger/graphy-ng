export interface TransformedEdge<E = void> {
  /** The unique identifier of the edge. */
  id?: string;

  /** The ID of the node to point from. */
  sourceId: string;

  /** The ID of the node to point to. */
  targetId: string;

  /** The path to be drawn. Can be bound to the `d` attribute of a `<svg:path>` element. */
  pathDefinition: string;

  /** The data associated with an edge. */
  data: E;
}
