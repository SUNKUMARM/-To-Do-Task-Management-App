import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'create-task-dialog',
    templateUrl: './todo-task-dialog.component.html',
    // styleUrls: ['']
})

export class TodoTaskCreateDialog {
    isTaskDetails: Boolean = false;
    constructor(public dialogRef: MatDialogRef<TodoTaskCreateDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
        console.log("data", data);
    }
    onCancel(): void {
        this.dialogRef.close(null);
    }
}