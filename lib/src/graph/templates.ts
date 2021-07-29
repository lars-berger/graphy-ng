import { Directive, TemplateRef } from '@angular/core';
import { TransformedEdge } from './models/transformed-edge.model';

import { TransformedNode } from './models/transformed-node.model';

@Directive({
  selector: '[defsTemplate]',
})
export class DefsTemplateDirective {
  constructor(public template: TemplateRef<any>) {}
}

interface NodeTemplateContext<T extends object> {
  $implicit: TransformedNode<T>;
}

@Directive({
  selector: '[nodeTemplate]',
})
export class NodeTemplateDirective<T> {
  static ngTemplateContextGuard<T extends object>(
    dir: NodeTemplateDirective<T>,
    ctx: unknown,
  ): ctx is NodeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}
interface EdgeTemplateContext<T extends object> {
  $implicit: TransformedEdge<T>;
}

@Directive({
  selector: '[edgeTemplate]',
})
export class EdgeTemplateDirective<T> {
  static ngTemplateContextGuard<T extends object>(
    dir: EdgeTemplateDirective<T>,
    ctx: unknown,
  ): ctx is EdgeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}
