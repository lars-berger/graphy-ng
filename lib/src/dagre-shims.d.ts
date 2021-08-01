/**
 * Add type definition for `dagre.graphlib.json.write` method.
 */

import dagre from 'dagre';

export interface GraphOutputNode {
  v: string;
  value: dagre.Node;
}

export interface GraphOutputEdge {
  v: string;
  w: string;
  value: dagre.GraphEdge;
}

export interface GraphOutputOptions {
  compound: boolean;
  directed: boolean;
  multigraph: boolean;
}

export interface GraphOutputValue {
  align: string;
  height: number;
  marginx: number;
  marginy: number;
  rankdir: string;
  width: number;
}

export interface GraphOutput {
  nodes: GraphOutputNode[];
  edges: GraphOutputEdge[];
  options: GraphOutputOptions;
  value: GraphOutputValue;
}

declare module 'dagre' {
  namespace graphlib {
    namespace json {
      function write(graph: Graph): GraphOutput;
    }
  }
}
