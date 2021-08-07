import { TransformedEdge } from './transformed-edge.model';

type EdgeContext<T> = TransformedEdge<T>;

/** The context object passed to edge templates. */
export interface EdgeTemplateContext<T> {
  $implicit: EdgeContext<T>;
}
