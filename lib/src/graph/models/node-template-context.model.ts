import { TransformedNode } from './transformed-node.model';

/** The context object passed to node templates. */
export interface NodeTemplateContext<T> {
  $implicit: TransformedNode<T>;
}
