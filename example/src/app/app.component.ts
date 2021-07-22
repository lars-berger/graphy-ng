import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  nodes = [
    {
      id: '1',
      data: {
        title: 'Hello',
      },
    },
    {
      id: '2',
      data: {
        title: 'World',
      },
    },
  ];

  edges = [
    {
      id: '1',
      sourceId: '1',
      targetId: '2',
    },
  ];

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

  createNode(): void {
    const { title } = this.createNodeForm.value;

    if (title === '') {
      return;
    }

    this.nodes = [...this.nodes, { id: uuid(), data: { title } }];
    this.createNodeForm.reset();
  }

  createEdge(): void {
    const { sourceId, targetId } = this.createEdgeForm.value;

    if (sourceId === targetId) {
      return;
    }

    this.edges = [...this.edges, this.createEdgeForm.value];
    this.createEdgeForm.reset();
  }

  updateNode(): void {
    const { title } = this.updateNodeForm.value;

    if (title === '') {
      return;
    }

    this.nodes = this.nodes.map((node) => {
      if (node.id !== this.nodeIdToUpdate) {
        return node;
      }

      return { id: node.id, data: { title } };
    });

    this.updateNodeForm.reset();
    this.nodeIdToUpdate = null;
  }

  showNodeUpdateForm(nodeId: string): void {
    this.nodeIdToUpdate = nodeId;

    // Fill the update form with the existing title.
    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    this.updateNodeForm.setValue({ title: nodeToUpdate?.data.title });
  }
}
