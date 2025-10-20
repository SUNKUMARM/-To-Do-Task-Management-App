import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'create-task-dialog',
    templateUrl: './todo-task-dialog.component.html',
    styleUrls: ['./todo-task-dialog.component.scss']
})

export class TodoTaskCreateDialog implements OnInit {
    isTaskDetails: Boolean = false;
    taskCreateForm!: FormGroup;

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<TodoTaskCreateDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
        console.log("data", data);
    }
    ngOnInit(): void {
        this.createForm();
    }
    createForm() {
        this.taskCreateForm = this.fb.group({
            id: [''],
            title: ['', Validators.required],
            description: [''],
            priority: ['medium', Validators.required],
            status: ['not_started', Validators.required],
            category: [''],
            assignedto: ['', Validators.required],
            assignedtoid: ['', Validators.required],
            assignedtoname: ['', Validators.required],
            startdate: [''],
            enddate: [''],
            reminderdate: [''],
            estimatedhours: [0],
            initialprogress: [0],
            candidatecode: [''],
            candidatename: [''],
            candidateemail: [''],
            reqcode: [''],
            tags: [''],
            externallinks: [''],
            additionalnotes: [''],
            orgid: [''],
            tenantid: [''],
            createdby: [''],
            createdbyid: [''],
            createdon: [''],
            modifiedby: [''],
            modifiedbyid: [''],
            modifiedon: ['']
        })
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }
}