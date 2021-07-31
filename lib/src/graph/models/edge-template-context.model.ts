import { TransformedEdge } from './transformed-edge.model';

/** The context object passed to edge templates. */
export interface EdgeTemplateContext<T> {
  $implicit: TransformedEdge<T>;
}
