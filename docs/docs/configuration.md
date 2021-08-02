---
sidebar_position: 2
---

# Configuration

## Custom templates

`graphy-ng` allows for custom templates for nodes, edges, and SVG defs to allow for complete customization of the appearance and behavior of your graph.

### Defs template

The defs template can be used to define SVG objects that will be consumed by the node or edge templates. In the example below, an SVG of an arrow is defined, which can then be referenced by its `id` in the edge template.

```html
<ng-container *defsTemplate>
  <svg:marker
    class="arrow"
    id="arrow"
    viewBox="0 -5 10 10"
    refX="8"
    refY="0"
    markerWidth="4"
    markerHeight="4"
    orient="auto"
  >
    <svg:path d="M0,-5L10,0L0,5" />
  </svg:marker>
</ng-container>
```

### Edge template

```html
<ng-container *edgeTemplate="let edge; edges: edges">
  <svg:path class="line" marker-end="url(#arrow)" [attr.d]="edge.pathDefinition"></svg:path>
</ng-container>
```

#### Edge template context

Properties defined on the `edge` template variable.

| Name           | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| id             | The unique identifier of the edge.                                                 |
| sourceId       | The ID of the node to point from.                                                  |
| targetId       | The ID of the node to point to.                                                    |
| pathDefinition | The path to be drawn. Can be bound to the `d` attribute of a `<svg:path>` element. |
| data           | The data associated with an edge.                                                  |

### Node template

```html
<ng-container *nodeTemplate="let node; nodes: nodes">
  <svg:circle r="10" cx="5" cy="5" />
</ng-container>
```

#### Node template context

Properties defined on the `node` template variable.

| Name | Description                        |
| ---- | ---------------------------------- |
| id   | The unique identifier of the node. |
| data | The data associated with a node.   |
