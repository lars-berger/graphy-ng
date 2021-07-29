import { TransformedNode } from './transformed-node.model';

export interface NodeTemplateContext<T> {
  $implicit: TransformedNode<T>;
}
