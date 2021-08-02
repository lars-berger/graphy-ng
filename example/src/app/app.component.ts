import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { InputEdge, InputNode } from 'graphy-ng';

interface NodeData {
  title: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  nodes: InputNode<NodeData>[] = [];

  edges: InputEdge[] = [];

  createNodeForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
  });

  createEdgeForm: FormGroup = this.fb.group({
    sourceId: ['', Validators.required],
    targetId: ['', Validators.required],
  });

  nodeIdToUpdate: string | null = null;

  updateNodeForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const node1 = this.createNode('Hello');
    const node2 = this.createNode('World');

    this.createEdge(node1.id, node2.id);
  }

  submitCreateNodeForm(): void {
    const { title } = this.createNodeForm.value;

    if (title === '') {
      return;
    }

    this.createNode(title);
    this.createNodeForm.reset();
  }

  createNode(title: string): InputNode<NodeData> {
    const newNode = { id: this.createNodeId(), data: { title } };

    this.nodes = [...this.nodes, newNode];

    return newNode;
  }

  submitCreateEdgeForm(): void {
    const { sourceId, targetId } = this.createEdgeForm.value;

    if (sourceId === targetId) {
      return;
    }

    this.createEdge(sourceId, targetId);
    this.createEdgeForm.reset();
  }

  createEdge(sourceId: string, targetId: string): InputEdge {
    const newEdge = { sourceId, targetId };

    this.edges = [...this.edges, newEdge];

    return newEdge;
  }

  submitUpdateNodeForm(): void {
    const { title } = this.updateNodeForm.value;

    if (title === '') {
      return;
    }

    this.updateNode(this.nodeIdToUpdate!, title);
    this.updateNodeForm.reset();
  }

  updateNode(nodeId: string, title: string): InputNode<NodeData> {
    this.nodes = this.nodes.map((node) => {
      if (node.id !== nodeId) {
        return node;
      }

      return { ...node, data: { title } };
    });

    this.nodeIdToUpdate = null;

    return this.nodes.find((node) => node.id === nodeId)!;
  }

  showNodeUpdateForm(nodeId: string): void {
    this.nodeIdToUpdate = nodeId;

    // Fill the update form with the existing title.
    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    this.updateNodeForm.setValue({ title: nodeToUpdate?.data?.title });
  }

  /**
   * Generate a semi-random alphanumeric string for use as node ID's. Can be
   * substituted with `uuid` package or something similar.
   */
  createNodeId(): string {
    return Math.random().toString(36).slice(2);
  }
}
