import { Component } from '@angular/core';
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

  createEdgeForm: FormGroup = this.fb.group({
    sourceId: ['', Validators.required],
    targetId: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  createEdge(): void {
    const { sourceId, targetId } = this.createEdgeForm.value;

    if (sourceId === targetId) {
      return;
    }

    this.edges = [...this.edges, this.createEdgeForm.value];
    this.createEdgeForm.reset();
  }
}
