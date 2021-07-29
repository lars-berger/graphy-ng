import { Directive, Input, TemplateRef } from '@angular/core';

import { EdgeTemplateContext } from './models/edge-template-context.model';
import { InputEdge } from './models/input-edge.model';
import { InputNode } from './models/input-node.model';
import { NodeTemplateContext } from './models/node-template-context.model';

@Directive({
  selector: '[defsTemplate]',
})
export class DefsTemplateDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[nodeTemplate]',
})
export class NodeTemplateDirective<T> {
  /** The array of nodes to display in the graph. */
  @Input('nodeTemplateNodes') inputNodes: InputNode<T>[] = [];

  static ngTemplateContextGuard<T>(dir: NodeTemplateDirective<T>, ctx: any): ctx is NodeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[edgeTemplate]',
})
export class EdgeTemplateDirective<T> {
  /** The array of edges to display in the graph. */
  @Input('edgeTemplateEdges') inputEdges: InputEdge<T>[] = [];

  static ngTemplateContextGuard<T>(dir: EdgeTemplateDirective<T>, ctx: unknown): ctx is EdgeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}
