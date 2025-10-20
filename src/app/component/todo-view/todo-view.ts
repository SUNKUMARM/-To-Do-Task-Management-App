import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-todo-view',
    templateUrl: './todo-view.html',
    styleUrls: ['./todo-view.scss']
})

export class TodoViewComponent {
    constructor(private dialog: MatDialog,) {

    }
    openDialog() {
        import('../todo-task-dialog/todo-task-dialog.component').then(d => {
            const dialog = this.dialog.open(d.TodoTaskCreateDialog, {
                width: '800px',
                maxHeight: '90vh',
                disableClose: false,
                data: {
                    isEdit: false,
                    taskData: null,
                    viewTaskDeatils: false
                }
            });
            dialog.afterClosed().subscribe(result => {
                console.log("result", result);
            })

        })

    }
}