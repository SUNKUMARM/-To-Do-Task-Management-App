import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Task } from "src/app/service/todo.service";

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
        if (this.data) {
            this.patchTaskForm(this.data);
        }
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

    patchTaskForm(taskData: any) {
        if (!taskData || !taskData.taskData) return;

        const task = taskData.taskData;

        // Format dates for input fields (from ISO to YYYY-MM-DD)
        const formatDateForInput = (isoDate: string) => {
            if (!isoDate) return '';
            return isoDate.split('T')[0];
        };

        this.taskCreateForm.patchValue({
            id: task.id || '',
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'not_started',
            category: task.category || '',
            assignedto: task.assignedto || '',
            startdate: formatDateForInput(task.startdate),
            enddate: formatDateForInput(task.enddate),
            reminderdate: formatDateForInput(task.reminderdate || ''),
            estimatedhours: task.estimatedhours || 0,
            initialprogress: task.initialprogress || 0,
            candidatecode: task.candidatecode || '',
            candidatename: task.candidatename || '',
            candidateemail: task.candidateemail || '',
            reqcode: task.reqcode || '',
            tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
            externallinks: Array.isArray(task.externallinks) ? task.externallinks.join(', ') : '',
            additionalnotes: task.additionalnotes || '',
            orgid: task.orgid || '',
            tenantid: task.tenantid || '',
            createdby: task.createdby || '',
            createdbyid: task.createdbyid || '',
            createdon: task.createdon || '',
            modifiedby: task.modifiedby || '',
            modifiedbyid: task.modifiedbyid || '',
            modifiedon: task.modifiedon || ''
        });
    }

    onSubmit() {
        if (this.taskCreateForm.invalid) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        const formValue = this.taskCreateForm.value;

        // Get initials from assignee name
        const getInitials = (name: string): string => {
            if (!name) return '';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        };

        // Format date to ISO string
        const formatDateToISO = (date: any): string => {
            if (!date) return '';
            return new Date(date).toISOString();
        };

        const taskData: Partial<Task> = {
            title: formValue.title?.trim(),
            description: formValue.description?.trim() || '',
            priority: formValue.priority || 'medium',
            status: formValue.status || 'not_started',
            category: formValue.category?.trim() || '',
            assignedto: formValue.assignedto?.trim() || '',
            assignedtoid: formValue.assignedtoid || null,
            assignedtoname: formValue.assignedtoname || '',
            startdate: formatDateToISO(formValue.startdate),
            enddate: formatDateToISO(formValue.enddate),
            reminderdate: formatDateToISO(formValue.reminderdate),
            estimatedhours: Number(formValue.estimatedhours) || 0,
            initialprogress: Number(formValue.initialprogress) || 0,
            candidatecode: formValue.candidatecode?.trim() || '',
            candidatename: formValue.candidatename?.trim() || '',
            candidateemail: formValue.candidateemail?.trim() || '',
            reqcode: formValue.reqcode?.trim() || '',
            tags: formValue.tags
                ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
                : [],
            externallinks: formValue.externallinks
                ? formValue.externallinks.split(',').map((link: string) => link.trim()).filter((link: string) => link)
                : [],
            additionalnotes: formValue.additionalnotes?.trim() || ''
        };

        // If editing, include the ID
        if (this.data.isEdit && this.data.taskData) {
            (taskData as any).id = this.data.taskData.id;
            // Preserve audit fields
            (taskData as any).orgid = this.data.taskData.orgid;
            (taskData as any).tenantid = this.data.taskData.tenantid;
            (taskData as any).createdby = this.data.taskData.createdby;
            (taskData as any).createdbyid = this.data.taskData.createdbyid;
            (taskData as any).createdon = this.data.taskData.createdon;
        }

        // Close dialog and return the task data
        this.dialogRef.close(taskData);
    }
    private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        // Since MatSnackBar is not injected here, we'll just log
        // The parent component will show the notification
        console.log(`${type}: ${message}`);
    }
}