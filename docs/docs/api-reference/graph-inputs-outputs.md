---
sidebar_position: 1
---

# Graph inputs & outputs

## Inputs

Inputs that can be passed to the `lib-graph` component:

| Name                | Type                   | Default                        | Description                                                                                                                                                                      |
| ------------------- | ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| curve               | `d3shape.CurveFactory` | `d3shape.curveBasis`           | The D3 curve used for defining the shape of edges (from `'d3-shape'` library). Available options can be found [here](https://github.com/d3/d3-shape/blob/main/README.md#curves). |
| enableZooming       | `boolean`              | `true`                         | Whether to enable zooming.                                                                                                                                                       |
| enablePanning       | `boolean`              | `true`                         | Whether to enable panning.                                                                                                                                                       |
| zoomSpeed           | `number`               | `0.1`                          | The speed of zooming in/out, if zoom is enabled.                                                                                                                                 |
| invertZoomDirection | `boolean`              | `false`                        | Whether to reverse the zoom direction, if zoom is enabled.                                                                                                                       |
| centerOnChanges     | `boolean`              | `false`                        | Whether to center the graph on any input changes to nodes or edges.                                                                                                              |
| direction           | `GraphDirection`       | `GraphDirection.TOP_TO_BOTTOM` | The direction of the graph layout. For example, using `GraphOrientation.LEFT_TO_RIGHT` in an acyclic graph will cause edges to point from the left to the right.                 |
| marginX             | `number`               | `0`                            | Number of pixels to use as a margin around the left and right of the graph.                                                                                                      |
| marginY             | `number`               | `0`                            | Number of pixels to use as a margin around the top and bottom of the graph.                                                                                                      |
| width               | `string`               | `'100%'`                       | The width of the graph (eg. `'600px'`).                                                                                                                                          |
| height              | `string`               | `'100%'`                       | The height of the graph (eg. `'600px'`).                                                                                                                                         |

## Outputs

Outputs emitted by the `lib-graph` component:

| Name     | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| onCenter | `void` | Event emitted when centering the graph.         |
| onZoom   | `void` | Event emitted when zooming in/out of the graph. |
| onPan    | `void` | Event emitted when the graph is being panned.   |
