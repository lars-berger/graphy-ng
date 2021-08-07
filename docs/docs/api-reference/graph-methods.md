---
sidebar_position: 2
---

# Graph methods

Methods that can be called on the `lib-graph` component, eg. through the use of `@ViewChild(GraphComponent)`:

- #### `pan(deltaX: number, deltaY: number): void`

Pan horizontally and vertically by given pixel deltas.

- #### `panX(deltaX: number): void`

Pan horizontally by a given pixel delta.

- #### `panY(deltaY: number): void`

Pan vertically by a given pixel delta.

- #### `zoom(factor: number): void`

Zoom by a factor.

- #### `panToCoordinates(x: number, y: number): void`

Pan to a specific x, y coordinate.

- #### `center(): void`

Pan to get the center point of the nodes in the middle of the view box.

- #### `renderGraph(): void`

Force the graph to re-render. For example, this can refresh the graph if input nodes were modified in-place (instead of mutated).
