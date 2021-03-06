---
sidebar_position: 3
---

# Custom templates

The appearance and behavior of your graph is customizable with custom templates for nodes, edges, and SVG defs. Node and edge templates are required.

## Defs template

The defs template can be used to define SVG objects that will be consumed by the node or edge templates. In the example below, an SVG of an arrow is defined, which can then be referenced by its `id` in the edge template.

Not required if no defs are needed for the node or edge templates.

```html
<ng-container *defsTemplate>
  <svg:marker
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

## Edge template

The edge template is used for rendering the edges between nodes and exposes the `edge` template variable.

```html
<ng-container *edgeTemplate="let edge; edges: edges">
  <svg:path marker-end="url(#arrow)" [attr.d]="edge.pathDefinition"></svg:path>
</ng-container>
```

### Edge template inputs

Inputs that can be passed to the `*edgeTemplate` structural directive:

| Name  | Type          | Default | Description                                 |
| ----- | ------------- | ------- | ------------------------------------------- |
| edges | `InputEdge[]` | `[]`    | The array of edges to display in the graph. |

### Edge template context

Properties defined on the `edge` template variable of type `EdgeContext<E>`:

| Name           | Type     | Description                                                                        |
| -------------- | -------- | ---------------------------------------------------------------------------------- |
| id             | `string` | The unique identifier of the edge.                                                 |
| sourceId       | `string` | The ID of the node to point from.                                                  |
| targetId       | `string` | The ID of the node to point to.                                                    |
| pathDefinition | `string` | The path to be drawn. Can be bound to the `d` attribute of a `<svg:path>` element. |
| data           | `<E>`    | The data associated with an edge.                                                  |

## Node template

The node template is used for rendering the nodes and exposes the `node` template variable.

```html
<ng-container *nodeTemplate="let node; nodes: nodes">
  <svg:circle cx="25" cy="25" r="25" />
  <svg:text fill="blue" transform="translate(0 30)">{{ node.data.name }}</svg:text>
</ng-container>
```

### Node template inputs

Inputs that can be passed to the `*nodeTemplate` structural directive:

| Name  | Type          | Default | Description                                 |
| ----- | ------------- | ------- | ------------------------------------------- |
| nodes | `InputNode[]` | `[]`    | The array of nodes to display in the graph. |

### Node template context

Properties defined on the `node` template variable of type `NodeContext<N>`:

| Name | Type     | Description                        |
| ---- | -------- | ---------------------------------- |
| id   | `string` | The unique identifier of the node. |
| data | `<N>`    | The data associated with a node.   |
