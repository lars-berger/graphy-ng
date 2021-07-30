/**
 * Add type definition for `dagre.graphlib.json.write` method.
 */

import * as dagre from 'dagre';

declare module 'dagre' {
  namespace graphlib {
    interface GraphOutputNode {
      v: string;
      value: Node;
    }

    interface GraphOutputEdge {
      v: string;
      w: string;
      value: GraphEdge;
    }

    interface GraphOutputOptions {
      compound: boolean;
      directed: boolean;
      multigraph: boolean;
    }

    interface GraphOutputValue {
      align: string;
      height: number;
      marginx: number;
      marginy: number;
      rankdir: string;
      width: number;
    }

    interface GraphOutput {
      nodes: GraphOutputNode[];
      edges: GraphOutputEdge[];
      options: GraphOutputOptions;
      value: GraphOutputValue;
    }

    namespace json {
      function write(graph: Graph): GraphOutput;
    }
  }
}
