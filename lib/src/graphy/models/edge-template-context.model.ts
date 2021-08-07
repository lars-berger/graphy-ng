import { TransformedEdge } from './transformed-edge.model';

export type EdgeContext<E> = TransformedEdge<E>;

/** The context object passed to edge templates. */
export interface EdgeTemplateContext<E> {
  $implicit: EdgeContext<E>;
}
