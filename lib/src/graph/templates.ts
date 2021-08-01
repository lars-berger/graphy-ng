import { Directive, Input, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

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
  /** Subject that emits when input nodes are mutated. */
  readonly onNodeChanges$: Subject<void> = new Subject();

  /** The array of nodes to display in the graph. */
  private _inputNodes: InputNode<T>[] = [];
  get inputNodes(): InputNode<T>[] {
    return this._inputNodes;
  }
  @Input('nodeTemplateNodes') set inputNodes(value: InputNode<T>[]) {
    this._inputNodes = value;
    this.onNodeChanges$.next();
  }

  static ngTemplateContextGuard<T>(
    dir: NodeTemplateDirective<T>,
    ctx: any,
  ): ctx is NodeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[edgeTemplate]',
})
export class EdgeTemplateDirective<T> {
  /** Subject that emits when input edges are mutated. */
  readonly onEdgeChanges$: Subject<void> = new Subject();

  /** The array of edges to display in the graph. */
  private _inputEdges: InputEdge<T>[] = [];
  get inputEdges(): InputEdge<T>[] {
    return this._inputEdges;
  }
  @Input('edgeTemplateEdges') set inputEdges(value: InputEdge<T>[]) {
    this._inputEdges = value;
    this.onEdgeChanges$.next();
  }

  static ngTemplateContextGuard<T>(
    dir: EdgeTemplateDirective<T>,
    ctx: unknown,
  ): ctx is EdgeTemplateContext<T> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}
