import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphyComponent } from './graphy.component';
import { DefsTemplateDirective, EdgeTemplateDirective, NodeTemplateDirective } from './templates';

@NgModule({
  declarations: [
    DefsTemplateDirective,
    EdgeTemplateDirective,
    GraphyComponent,
    NodeTemplateDirective,
  ],
  imports: [CommonModule],
  exports: [DefsTemplateDirective, EdgeTemplateDirective, GraphyComponent, NodeTemplateDirective],
})
export class GraphyModule {}
