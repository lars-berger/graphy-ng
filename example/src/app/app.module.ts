import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GraphModule } from 'graphi-ng';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, GraphModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
