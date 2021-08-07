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
export class NodeTemplateDirective<N> {
  /** Subject that emits when input nodes are mutated. */
  readonly _onNodeChanges$: Subject<void> = new Subject();

  /** The array of nodes to display in the graph. */
  @Input('nodeTemplateNodes')
  get inputNodes(): InputNode<N>[] {
    return this._inputNodes;
  }
  set inputNodes(value: InputNode<N>[]) {
    this._inputNodes = value;
    this._onNodeChanges$.next();
  }
  _inputNodes: InputNode<N>[] = [];

  static ngTemplateContextGuard<N>(
    _dir: NodeTemplateDirective<N>,
    _ctx: unknown,
  ): _ctx is NodeTemplateContext<N> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[edgeTemplate]',
})
export class EdgeTemplateDirective<E> {
  /** Subject that emits when input edges are mutated. */
  readonly _onEdgeChanges$: Subject<void> = new Subject();

  /** The array of edges to display in the graph. */
  @Input('edgeTemplateEdges')
  get inputEdges(): InputEdge<E>[] {
    return this._inputEdges;
  }
  set inputEdges(value: InputEdge<E>[]) {
    this._inputEdges = value;
    this._onEdgeChanges$.next();
  }
  _inputEdges: InputEdge<E>[] = [];

  static ngTemplateContextGuard<E>(
    _dir: EdgeTemplateDirective<E>,
    _ctx: unknown,
  ): _ctx is EdgeTemplateContext<E> {
    return true;
  }

  constructor(public template: TemplateRef<any>) {}
}
