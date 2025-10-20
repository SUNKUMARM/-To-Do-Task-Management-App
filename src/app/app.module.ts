import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { TodoTaskCreateDialog } from './component/todo-task-dialog/todo-task-dialog.component';
import { TodoViewComponent } from './component/todo-view/todo-view';

@NgModule({
  declarations: [
    AppComponent,
    TodoTaskCreateDialog,
    TodoViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
