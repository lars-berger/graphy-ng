import { Component } from '@angular/core';

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
}
