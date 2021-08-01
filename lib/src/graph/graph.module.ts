import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphComponent } from './graph.component';
import { DefsTemplateDirective, EdgeTemplateDirective, NodeTemplateDirective } from './templates';

@NgModule({
  declarations: [
    DefsTemplateDirective,
    EdgeTemplateDirective,
    GraphComponent,
    NodeTemplateDirective,
  ],
  imports: [CommonModule],
  exports: [DefsTemplateDirective, EdgeTemplateDirective, GraphComponent, NodeTemplateDirective],
})
export class GraphModule {}
