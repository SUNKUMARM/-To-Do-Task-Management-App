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

    // Status options
    statusOptions = [
        { viewValue: "Not Started", value: "not_started" },
        { viewValue: "In Progress", value: "in_progress" },
        { viewValue: "Completed", value: "completed" },
        { viewValue: "On Hold", value: "on_hold" }
    ];

    // Priority options
    priorityOptions = [
        { viewValue: "Low", value: "low" },
        { viewValue: "Medium", value: "medium" },
        { viewValue: "High", value: "high" },
        { viewValue: "Urgent", value: "urgent" }
    ];

    // Category options
    categoryOptions = [
        { viewValue: "Candidate Review", value: "candidate-review" },
        { viewValue: "Interview Process", value: "interview-process" },
        { viewValue: "Job Posting", value: "job-posting" },
        { viewValue: "Onboarding", value: "onboarding" },
        { viewValue: "Reference Check", value: "reference-check" },
        { viewValue: "Offer Negotiation", value: "offer-negotiation" },
        { viewValue: "Candidate Sourcing", value: "candidate-sourcing" },
        { viewValue: "Phone Screening", value: "phone-screening" },
        { viewValue: "General Task", value: "general-task" }
    ];

    // Priority options
    userOptions = [
        { viewValue: "Admin", value: "admin" },
        { viewValue: "Panel", value: "panel" },
        { viewValue: "Recruitment Manager", value: "recruiter" },
        { viewValue: "Finance Approver", value: "finance" }
    ];

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
        });
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onSubmit() {
        console.log("this.taskCreateForm", this.taskCreateForm);
    }
}