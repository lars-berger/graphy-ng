import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  ElementRef,
  EventEmitter,
  QueryList,
  ViewChildren,
  ViewChild,
  Output,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { curveBasis, CurveFactory, Line, line } from 'd3-shape';
import dagre from 'dagre';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { DefsTemplateDirective, EdgeTemplateDirective, NodeTemplateDirective } from './templates';
import { GraphDirection } from './models/graph-direction.model';
import { GraphOutputEdge, GraphOutputNode } from '../dagre-shims';
import { InputEdge } from './models/input-edge.model';
import { InputNode } from './models/input-node.model';
import { TransformedEdge } from './models/transformed-edge.model';
import { TransformedNode } from './models/transformed-node.model';
import { ViewBox } from './models/view-box.model';

@Component({
  selector: 'lib-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent<NData, EData> implements AfterViewInit, OnDestroy {
  /** The d3.curve used for defining the shape of edges. */
  @Input() curve: CurveFactory = curveBasis;

  /** Whether to enable zooming. */
  @Input() enableZooming: boolean = true;

  /** Whether to enable panning. */
  @Input() enablePanning: boolean = true;

  /** The speed of zooming in/out, if enabled. */
  @Input() zoomSpeed: number = 0.1;

  /** Whether to center the graph on any input changes. */
  @Input() centerOnChanges: boolean = false;

  /** The width of the graph (eg. '600px'). */
  @Input()
  get width(): string {
    return this._width;
  }
  set width(value: string) {
    this._width = value;
    this.resetViewBoxDimensions();
  }
  _width = '100%';

  /** The height of the graph (eg. '600px'). */
  @Input()
  get height(): string {
    return this._height;
  }
  set height(value: string) {
    this._height = value;
    this.resetViewBoxDimensions();
  }
  _height = '100%';

  /**
   * The direction of the graph layout. For example, using `GraphOrientation.LEFT_TO_RIGHT` in an
   * acyclic graph will cause edges to point from the left to the right.
   */
  @Input() direction: GraphDirection = GraphDirection.TOP_TO_BOTTOM;

  /** Number of pixels to use as a margin around the left and right of the graph. */
  @Input() marginX: number = 0;

  /** Number of pixels to use as a margin around the top and bottom of the graph. */
  @Input() marginY: number = 0;

  /** Event emitted when centering the graph. */
  @Output() readonly onCenter: EventEmitter<void> = new EventEmitter();

  /** Event emitted when zooming in/out of the graph. */
  @Output() readonly onZoom: EventEmitter<void> = new EventEmitter();

  /** Event emitted when the graph is being panned. */
  @Output() readonly onPan: EventEmitter<void> = new EventEmitter();

  /** Subject that emits when the component has been destroyed. */
  private readonly onDestroy$: Subject<void> = new Subject();

  /** The structural directive that holds the template for SVG defs. */
  @ContentChild(DefsTemplateDirective) readonly defsTemplate: DefsTemplateDirective;

  /** The structural directive that holds the template for edges. */
  @ContentChild(EdgeTemplateDirective) readonly edgeTemplate: EdgeTemplateDirective<EData>;

  /** The structural directive that holds the template for nodes. */
  @ContentChild(NodeTemplateDirective) readonly nodeTemplate: NodeTemplateDirective<NData>;

  /** Reference to the SVG container element. */
  @ViewChild('graphContainer') private readonly graphContainer: ElementRef<SVGSVGElement>;

  /** Reference to the nodes container element. */
  @ViewChild('nodesContainer') private readonly nodesContainer: ElementRef<SVGSVGElement>;

  /** Reference to the individual node elements. */
  @ViewChildren('node') private readonly nodeElements: QueryList<ElementRef>;

  /** The dimensions of the container SVG view box. */
  private viewBox$: BehaviorSubject<ViewBox> = new BehaviorSubject({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  /** The current dimensions of the container SVG view box. */
  get viewBox(): ViewBox {
    return this.viewBox$.value;
  }

  /** The SVG view box in a format that can be bound to in the template. */
  readonly stringifiedViewBox$: Observable<string> = this.viewBox$.pipe(
    map((viewBox) => `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`),
  );

  /** The array of nodes to display, along with additional layout information. */
  transformedNodes: TransformedNode<NData>[] = [];

  /** The array of edges to display, along with additional layout information. */
  transformedEdges: TransformedEdge<EData>[] = [];

  /** The array of nodes to display in the graph. */
  private get inputNodes(): InputNode<NData>[] {
    return this.nodeTemplate.inputNodes;
  }

  /** The array of edges to display in the graph. */
  private get inputEdges(): InputEdge<EData>[] {
    return this.edgeTemplate.inputEdges;
  }

  /** The curve interpolation function for edge lines. */
  private get curveInterpolationFn(): Line<{ x: number; y: number }> {
    return line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(this.curve);
  }

  constructor(private el: ElementRef<HTMLElement>, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (!this.edgeTemplate || !this.nodeTemplate) {
      throw new Error('Templates for nodes and edges are required.');
    }

    this.resetViewBoxDimensions();

    this.renderGraph();

    if (this.enableZooming) {
      this.registerZoomListener();
    }

    if (this.enablePanning) {
      this.registerPanningListener();
    }

    // TODO: Add a subject for when graph is initially rendered or re-rendered.
    if (this.centerOnChanges) {
      this.center();
    }

    const inputChanges$: Observable<void> = merge(
      this.edgeTemplate.onEdgeChanges$,
      this.nodeTemplate.onNodeChanges$,
    );

    // Re-render the graph on any changes to nodes or edges.
    inputChanges$.subscribe(() => {
      this.renderGraph();

      if (this.centerOnChanges) {
        this.center();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  private updateViewBox(viewBox: Partial<ViewBox>): void {
    this.viewBox$.next({
      ...this.viewBox$.value,
      ...viewBox,
    });
  }

  /** Set width/height of the view box container to match the dimensions of the host element. */
  private resetViewBoxDimensions(): void {
    // Get the container dimensions.
    const hostEl: HTMLElement = this.el.nativeElement;
    const hostDimensions: DOMRect = hostEl.getBoundingClientRect();

    this.updateViewBox({
      width: hostDimensions.width,
      height: hostDimensions.height,
    });
  }

  /** Render the input nodes and edges into the SVG container. */
  renderGraph(): void {
    const graph: dagre.graphlib.Graph = this.createDagreGraph();

    // Update edges and nodes with layout information.
    dagre.layout(graph);

    const { edges, nodes } = dagre.graphlib.json.write(graph);

    this.transformedNodes = nodes.map((node: GraphOutputNode) => {
      const inputNode: InputNode<NData> = this.getInputNode(node.v);
      const { width, height, x, y } = node.value;

      return {
        id: inputNode.id,
        width: width,
        height: height,
        x: x,
        y: y,
        transform: `translate(${x - width / 2}, ${y - height / 2})`,
        isVisible: true,
        data: {
          ...inputNode.data,
        },
      };
    });

    this.transformedEdges = edges.map((edge: GraphOutputEdge) => {
      const inputEdge: InputEdge<EData> = this.getInputEdge(edge.v, edge.w);

      return {
        id: inputEdge.id,
        sourceId: edge.v,
        targetId: edge.w,
        pathDefinition: this.curveInterpolationFn(edge.value.points),
        data: {
          ...inputEdge.data,
        },
      };
    });

    this.cd.detectChanges();
  }

  /** Create the Dagre graph object using the user-defined config, edges, and nodes. */
  private createDagreGraph(): dagre.graphlib.Graph {
    const graph = new dagre.graphlib.Graph();

    graph.setGraph({
      marginx: this.marginX,
      marginy: this.marginY,
      rankdir: this.direction,
      align: 'UL',
    });

    // Default to assigning a new object as a label for each new edge.
    graph.setDefaultEdgeLabel(() => ({}));

    this.renderNodesOffscreen();

    for (let node of this.inputNodes) {
      // The dimensions of every node needs to be known before passing it to the layout engine.
      const { width, height } = this.getNodeDimensions(node.id);

      graph.setNode(node.id, { width, height });
    }

    for (let edge of this.inputEdges) {
      graph.setEdge(edge.sourceId, edge.targetId);
    }

    return graph;
  }

  /** Get an input node by its ID. */
  private getInputNode(id: string): InputNode<NData> {
    return this.inputNodes.find((node) => node.id === id);
  }

  /** Get an input edge by its source ID and target ID. */
  private getInputEdge(sourceId: string, targetId: string): InputEdge<EData> {
    return this.inputEdges.find((edge) => edge.sourceId === sourceId && edge.targetId === targetId);
  }

  /** Render nodes with `visibility: hidden` CSS attribute. */
  private renderNodesOffscreen(): void {
    // The node width, height, x, and y values provided here are completely arbitrary. The point
    // is to render the nodes in the DOM to see what width/height they will actually take up and
    // afterwards provide that to the layout engine.
    this.transformedNodes = this.inputNodes.map((node) => ({
      id: node.id,
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      transform: '',
      isVisible: false,
      data: {
        ...node.data,
      },
    }));

    this.cd.detectChanges();
  }

  /** Get the dimensions of a node element. */
  private getNodeDimensions(nodeId: string): Readonly<{ width: number; height: number }> {
    // Query the DOM for the rendered node element.
    const nodeEl: ElementRef<SVGSVGElement> = this.nodeElements.find(
      (el) => el.nativeElement.id === nodeId,
    );

    const { width, height } = nodeEl.nativeElement.getBBox();
    return { width, height };
  }

  /** Listen for zoom events and update the view box accordingly. */
  private registerZoomListener(): void {
    const svg: SVGSVGElement = this.graphContainer.nativeElement;

    // Get zoom events on the SVG container.
    const zoom$: Observable<WheelEvent> = fromEvent<WheelEvent>(svg, 'wheel');

    zoom$.pipe(takeUntil(this.onDestroy$)).subscribe((event: WheelEvent) => {
      // Prevent the page from scrolling as well.
      event.preventDefault();

      // Compute the zoom factor and zoom in/out accordingly.
      const zoomDirection: number = event.deltaY < 0 ? 1 : -1;
      const zoomFactor: number = Math.exp(zoomDirection * this.zoomSpeed);
      this.zoom(zoomFactor);

      // Get the X and Y coordinates of the pointer position.
      const { x: originX, y: originY } = this.getPointFromEvent(event);

      // Need to pan towards cursor when zooming in, and pan out when zooming out.
      const deltaX: number = (originX - this.viewBox.x) * (zoomFactor - 1);
      const deltaY: number = (originY - this.viewBox.y) * (zoomFactor - 1);
      this.pan(deltaX, deltaY);
    });
  }

  /** Listen for panning events and update the view box accordingly. */
  private registerPanningListener(): void {
    const svg: SVGSVGElement = this.graphContainer.nativeElement;

    // Get mouse events on the SVG container.
    const pointerdown$: Observable<MouseEvent> = fromEvent<MouseEvent>(svg, 'pointerdown');
    const pointermove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'pointermove');
    const pointerup$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'pointerup');

    const pan$ = pointerdown$.pipe(
      switchMap((event: MouseEvent) => {
        // Get the X and Y coordinates of the original pointer position.
        const { x: originX, y: originY } = this.getPointFromEvent(event);

        return pointermove$.pipe(
          map((event: MouseEvent) => {
            // Prevent the pointer movement from doing a selection highlight on the page.
            event.preventDefault();

            // Get the X and Y coordinates of the updated pointer position.
            const { x: updatedX, y: updatedY } = this.getPointFromEvent(event);

            // Get the difference between the original and updated coordinates.
            const deltaX: number = updatedX - originX;
            const deltaY: number = updatedY - originY;

            return { deltaX, deltaY };
          }),
          takeUntil(pointerup$),
        );
      }),
    );

    pan$.pipe(takeUntil(this.onDestroy$)).subscribe(({ deltaX, deltaY }) => {
      this.pan(deltaX, deltaY);
    });
  }

  /** Get the X and Y coordinates from a `MouseEvent` in the SVG container. */
  private getPointFromEvent(event: MouseEvent): DOMPoint {
    const svg: SVGSVGElement = this.graphContainer.nativeElement;

    // Create an SVG point.
    const point: DOMPoint = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    // Convert a screen coordinate to an SVG coordinate.
    const invertedSVGMatrix: DOMMatrix = svg.getScreenCTM().inverse();
    return point.matrixTransform(invertedSVGMatrix);
  }

  /** Pan horizontally and vertically by given pixel deltas. */
  pan(deltaX: number, deltaY: number): void {
    this.updateViewBox({
      x: this.viewBox.x - deltaX,
      y: this.viewBox.y - deltaY,
    });

    this.onPan.emit();
  }

  /** Pan horizontally by a given pixel delta. */
  panX(deltaX: number): void {
    this.updateViewBox({ x: this.viewBox.x - deltaX });

    this.onPan.emit();
  }

  /** Pan vertically by a given pixel delta. */
  panY(deltaY: number): void {
    this.updateViewBox({ y: this.viewBox.y - deltaY });

    this.onPan.emit();
  }

  /** Pan to a specific x, y coordinate. */
  panToCoordinates(x: number, y: number): void {
    this.updateViewBox({ x, y });

    this.onPan.emit();
  }

  /** Zoom by a factor. */
  zoom(factor: number): void {
    this.updateViewBox({
      width: this.viewBox.width * factor,
      height: this.viewBox.height * factor,
    });

    this.onZoom.emit();
  }

  /** Pan to get the center point of the nodes in the middle of the view box. */
  center(): void {
    // Get the center coordinates of the rendered nodes.
    const boundingBox: DOMRect = this.nodesContainer.nativeElement.getBBox();
    const centerX: number = (boundingBox.x + boundingBox.width) / 2;
    const centerY: number = (boundingBox.y + boundingBox.height) / 2;

    // Get the center coordinates of the SVG view box.
    const viewBoxCenterX: number = this.viewBox.width / 2;
    const viewBoxCenterY: number = this.viewBox.height / 2;

    this.panToCoordinates(centerX - viewBoxCenterX, centerY - viewBoxCenterY);

    this.onCenter.emit();
    this.cd.detectChanges();
  }

  /** Tracking function for nodes and edges. */
  trackById(_index: number, object: any): string {
    return object.id;
  }
}
