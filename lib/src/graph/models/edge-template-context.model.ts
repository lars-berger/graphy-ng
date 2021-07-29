import { TransformedEdge } from './transformed-edge.model';

export interface EdgeTemplateContext<T> {
  $implicit: TransformedEdge<T>;
}
