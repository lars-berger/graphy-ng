import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  TemplateRef,
  ElementRef,
  EventEmitter,
  QueryList,
  ViewChildren,
  ViewChild,
  Output,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CurveFactory, curveNatural, line } from 'd3-shape';
import * as dagre from 'dagre';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

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
export class GraphComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** The array of nodes to display in the graph. */
  // TODO: Rename property to `inputNodes`.
  @Input() nodes: InputNode[] = [];

  /** The array of edges to display in the graph. */
  // TODO: Rename property to `inputEdges`.
  @Input() edges: InputEdge[] = [];

  /** The d3.curve used for defining the shape of edges. */
  @Input() curve: CurveFactory = curveNatural;

  /** Whether to enable zooming. */
  @Input() enableZooming: boolean = true;

  /** Whether to enable panning. */
  @Input() enablePanning: boolean = true;

  /** The speed of zooming in/out, if enabled. */
  @Input() zoomSpeed: number = 0.1;

  /** Whether to center the graph on any input changes. */
  @Input() centerOnChanges: boolean = true;

  /** Width of the graph (eg. '600px'). */
  @Input() width: string = '100%';

  /** Height of the graph (eg. '600px'). */
  @Input() height: string = '100%';

  /** Event emitted when centering the graph. */
  @Output() readonly onCenter: EventEmitter<void> = new EventEmitter();

  /** Event emitted when zooming in/out of the graph. */
  @Output() readonly onZoom: EventEmitter<void> = new EventEmitter();

  /** Event emitted when the graph is being panned. */
  @Output() readonly onPan: EventEmitter<void> = new EventEmitter();

  /** Event emitted on component destroy. */
  private readonly onDestroy$: Subject<void> = new Subject();

  @ContentChild('defsTemplate') defsTemplate: TemplateRef<any>;
  @ContentChild('edgeTemplate') edgeTemplate: TemplateRef<any>;
  @ContentChild('nodeTemplate') nodeTemplate: TemplateRef<any>;

  @ViewChild('graphContainer') graphContainer: ElementRef<SVGSVGElement>;
  @ViewChild('nodesContainer') nodesContainer: ElementRef<SVGSVGElement>;
  @ViewChildren('node') nodeElements: QueryList<ElementRef>;
  @ViewChildren('edge') edgeElements: QueryList<ElementRef>;

  /** Dimensions of the container SVG view box. */
  private viewBox$: BehaviorSubject<ViewBox> = new BehaviorSubject({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  get viewBox(): ViewBox {
    return this.viewBox$.value;
  }

  /** The SVG view box in a format that can be binded to in the template. */
  stringifiedViewBox$: Observable<string> = this.viewBox$.pipe(
    map((viewBox) => `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`),
  );

  transformedNodes: TransformedNode[] = [];
  transformedEdges: TransformedEdge[] = [];

  constructor(private el: ElementRef<HTMLElement>, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.setInitialViewBox();

    this.renderGraph();

    if (this.enableZooming) {
      this.registerZoomListener();
    }

    if (this.enablePanning) {
      this.registerPanningListener();
    }

    if (this.centerOnChanges) {
      this.center();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isFirstChange: boolean = Object.values(changes).every((change) => change.firstChange === true);

    // Ignore the initialisation of inputs.
    if (isFirstChange) {
      return;
    }

    // Re-render the graph on any changes to nodes, edges, or the graph config.
    this.renderGraph();

    if (this.centerOnChanges) {
      this.center();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  updateViewBox(viewBox: Partial<ViewBox>): void {
    this.viewBox$.next({
      ...this.viewBox$.value,
      ...viewBox,
    });
  }

  private setInitialViewBox(): void {
    // Get the container dimensions.
    const hostEl: HTMLElement = this.el.nativeElement;
    const hostDimensions: DOMRect = hostEl.getBoundingClientRect();

    this.updateViewBox({
      x: 0,
      y: 0,
      width: hostDimensions.width,
      height: hostDimensions.height,
    });
  }

  /** Render nodes and edges in the SVG viewbox. */
  renderGraph() {
    const graph = new dagre.graphlib.Graph();

    graph.setGraph({
      marginx: 0,
      marginy: 0,
      rankdir: 'TB',
      align: 'UL',
    });

    graph.setDefaultEdgeLabel(() => ({}));

    if (this.nodeTemplate) {
      this.renderNodesOffscreen();
    }

    for (let node of this.nodes) {
      // The dimensions of every node need to be known before passing it to the layout engine.
      if (this.nodeTemplate) {
        const { width, height } = this.getNodeDimensions(node.id);

        graph.setNode(node.id, { width, height });
      } else {
        // TODO: Change width and height here to whatever the default node width/height is.
        graph.setNode(node.id, { width: 10, height: 10 });
      }
    }

    for (let edge of this.edges) {
      graph.setEdge(edge.sourceId, edge.targetId);
    }

    dagre.layout(graph);

    // TODO: Add definition file for `write` method.
    const { edges, nodes } = dagre.graphlib.json.write(graph);

    this.transformedNodes = nodes.map((node) => ({
      id: node.v,
      width: node.value.width,
      height: node.value.height,
      x: node.value.x,
      y: node.value.y,
      transform: `translate(${node.value.x - node.value.width / 2}, ${node.value.y - node.value.height / 2})`,
      isVisible: true,
      data: {
        ...this.nodes.find((e) => e.id === node.v).data,
      },
    }));

    this.transformedEdges = edges.map((edge) => {
      // TODO: Move this out to its own method.
      const lineFunction = line<{ x; y }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(this.curve);

      return {
        sourceId: edge.v,
        targetId: edge.w,
        pathDefinition: lineFunction(edge.value.points),
        // TODO: Need to add data property.
      };
    });

    // Not sure why this is needed.
    this.cd.detectChanges();
  }

  private renderNodesOffscreen() {
    // The node width, height, x, and y values provided here are completely arbitrary. The point
    // is to render the nodes in the DOM to see what width/height they will actually take up and
    // later provide that to the layout engine.
    this.transformedNodes = this.nodes.map((node) => ({
      id: node.id,
      width: 1,
      height: 1,
      x: 1,
      y: 1,
      transform: '',
      isVisible: false,
      data: {
        ...node.data,
      },
    }));

    this.cd.detectChanges();
  }

  /** Get the dimensions of a node element rendered in the template. */
  private getNodeDimensions(nodeId: string): DOMRect {
    const nodeEl: ElementRef<SVGSVGElement> = this.nodeElements.find((el) => el.nativeElement.id === nodeId);

    return nodeEl.nativeElement.getBBox();
  }

  private registerZoomListener() {
    // Get zoom events on the SVG element.
    const svg: SVGSVGElement = this.graphContainer.nativeElement;
    const zoom$: Observable<WheelEvent> = fromEvent<WheelEvent>(svg, 'wheel').pipe(takeUntil(this.onDestroy$));

    zoom$.subscribe((event: WheelEvent) => {
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

  private registerPanningListener() {
    const svg: SVGSVGElement = this.graphContainer.nativeElement;

    // Get mouse events on the SVG element.
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
      takeUntil(this.onDestroy$),
    );

    pan$.subscribe(({ deltaX, deltaY }) => {
      this.pan(deltaX, deltaY);
    });
  }

  /** Get the X and Y coordinates from a MouseEvent in the SVG container. */
  private getPointFromEvent(event: MouseEvent) {
    const svg: SVGSVGElement = this.graphContainer.nativeElement;

    // Create an SVG point.
    const point: DOMPoint = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    // We get the current transformation matrix of the SVG and we inverse it.
    const invertedSVGMatrix: DOMMatrix = svg.getScreenCTM().inverse();

    return point.matrixTransform(invertedSVGMatrix);
  }

  pan(deltaX: number, deltaY: number) {
    this.panX(deltaX);
    this.panY(deltaY);
  }

  panX(deltaX: number) {
    this.updateViewBox({ x: this.viewBox.x - deltaX });
    this.onPan.emit();
  }

  panY(deltaY: number) {
    this.updateViewBox({ y: this.viewBox.y - deltaY });
    this.onPan.emit();
  }

  panToCoordinates(x: number, y: number) {
    this.updateViewBox({ x, y });
    this.onPan.emit();
  }

  zoom(factor: number) {
    this.updateViewBox({ width: this.viewBox.width * factor, height: this.viewBox.height * factor });
    this.onZoom.emit();
  }

  center() {
    const boundingBox: DOMRect = this.nodesContainer.nativeElement.getBBox();

    const centerX: number = (boundingBox.x + boundingBox.width) / 2;
    const centerY: number = (boundingBox.y + boundingBox.height) / 2;

    const viewBoxCenterX: number = this.viewBox.width / 2;
    const viewBoxCenterY: number = this.viewBox.height / 2;

    // Pan to get the center point of the nodes in the middle of the view box.
    this.panToCoordinates(centerX - viewBoxCenterX, centerY - viewBoxCenterY);

    this.onCenter.emit();

    // Not sure why this is needed.
    this.cd.detectChanges();
  }

  /** Tracking for nodes and edges. */
  trackById(_index: number, object: any): string {
    return object.id;
  }
}
