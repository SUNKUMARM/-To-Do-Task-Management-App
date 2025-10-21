import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { Subscription } from "rxjs";
import { Task, TaskDashboard, TodoService } from "src/app/service/todo.service";
import { TodoTaskCreateDialog } from "../todo-task-dialog/todo-task-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CdkDragDrop } from "@angular/cdk/drag-drop"

type ColumnId = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

@Component({
    selector: 'app-todo-view',
    templateUrl: './todo-view.html',
    styleUrls: ['./todo-view.scss']
})

export class TodoViewComponent implements OnInit {
    private subscriptions: Subscription = new Subscription();
    @ViewChild(MatSort) sort!: MatSort;
    tasks: Task[] = [];
    filteredTasks: Task[] = [];
    taskForm!: FormGroup;
    taskCreateForm!: FormGroup;
    showTaskModal = false;
    // showTaskDetailModal = false;
    selectedTask: Task | null = null;
    editingTaskId: number | null = null;
    searchTerm = '';
    filterStatus = '';
    filterPriority = '';
    filterAssignee = '';
    filterDueDate = 'all';
    currentView: 'kanban' | 'list' = 'kanban';
    dashboardMetrics: TaskDashboard | null = null;
    isLoading = false;
    isLoaderEnabled: boolean = true;
    // Mat-table displayed columns
    displayedColumns: string[] = ['task', 'assignee', 'category', 'status', 'priority', 'dueDate', 'progress', 'actions'];

    departments = ['engineering', 'product', 'design', 'marketing', 'hr', 'sales'];
    priorities = ['low', 'medium', 'high', 'urgent'];
    statuses = ['not_started', 'in_progress', 'completed', 'on_hold']; // Value view Value

    // Kanban columns
kanbanColumns: { id: ColumnId; title: string; icon: string; color: string }[] = [
  { id: 'not_started', title: 'Not Started', icon: 'fas fa-pause', color: '#8E8E93' },
  { id: 'in_progress', title: 'In Progress', icon: 'fas fa-play', color: '#007AFF' },
  { id: 'completed', title: 'Completed', icon: 'fas fa-check-circle', color: '#34C759' },
  { id: 'on_hold', title: 'On Hold', icon: 'fas fa-pause-circle', color: '#FF9500' }
];

    ngOnInit(): void {

        // Load tasks from service
        this.loadTasks();

        // Load dashboard metrics
        this.loadDashboardMetrics();

        // Subscribe to task updates
        this.subscriptions.add(
            this.todoService.tasksUpdated$.subscribe(() => {
                this.loadTasks();
                this.loadDashboardMetrics();
            })
        );
    }

    constructor(private dialog: MatDialog, private todoService: TodoService, private flagColorService: TodoService, private snackBar: MatSnackBar) {

    }
    openDialog() {
        import('../todo-task-dialog/todo-task-dialog.component').then(d => {
            const dialog = this.dialog.open(d.TodoTaskCreateDialog, {
                width: '800px',
                disableClose: false,
                panelClass: 'custom-bottom-sheet',
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
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadTasks(): void {
        this.isLoading = true;
        this.todoService.getAllTasks().subscribe({
            next: (tasks) => {
                this.tasks = tasks;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading tasks:', error);
                this.showNotification('Error loading tasks', 'error');
                this.isLoading = false;
            }
        });
    }
    loadDashboardMetrics(): void {
        this.todoService.getTaskDashboard().subscribe({
            next: (metrics) => {
                this.dashboardMetrics = metrics;
            },
            error: (error) => {
                console.error('Error loading dashboard metrics:', error);
            }
        });
    }
    applyFilters(): void {
        this.filteredTasks = this.tasks.filter(task => {
            const matchesSearch = !this.searchTerm ||
                (task.title && task.title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (task.assignedto && task.assignedtoname && task.assignedtoname.toLowerCase().includes(this.searchTerm.toLowerCase()));

            const matchesStatus = !this.filterStatus || task.status === this.filterStatus;
            const matchesPriority = !this.filterPriority || task.priority === this.filterPriority;
            const matchesAssignee = !this.filterAssignee || (task.assignedto && task.assignedtoname === this.filterAssignee);
            const matchesDueDate = this.matchesDueDateFilter(task);

            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDueDate;
        });
    }

    onSearch(): void {
        this.applyFilters();
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    deleteTask(taskId: number): void {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todoService.deleteTaskById(taskId).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.showNotification('Task deleted successfully', 'success');
                        // Tasks will reload automatically via the service subscription
                    }
                },
                error: (error) => {
                    console.error('Error deleting task:', error);
                    this.showNotification('Error deleting task', 'error');
                }
            });
        }
    }
    openTaskDetail(task: Task): void {
        // this.selectedTask = task;
        const dialogRef = this.dialog.open(TodoTaskCreateDialog, {
            width: '800px',
            maxHeight: '90vh',
            disableClose: false,
            data: {
                isEdit: false,
                selectedTask: task,
                viewTaskDeatils: true,
            },
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('New task data:', result);
                // Handle the new task creation
                // For example: this.taskService.createTask(result);
                // Or: this.tasks.push(result);
            }
        });
        // this.showTaskDetailModal = true;
    }

    updateTaskProgress(taskId: number, progress: number): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const updateData: Partial<Task> = {
                initialprogress: progress
            };

            if (progress === 100 && task.status !== 'completed') {
                updateData.status = 'completed';
            }

            this.todoService.updateTaskById(taskId, updateData).subscribe({
                next: () => {
                    this.showNotification('Task progress updated', 'success');
                },
                error: (error) => {
                    console.error('Error updating task progress:', error);
                    this.showNotification('Error updating task progress', 'error');
                }
            });
        }
    }

    updateTaskStatus(taskId: number, status: Task['status']): void {
        this.todoService.updateTaskStatusById(taskId, status).subscribe({
            next: () => {
                this.showNotification('Task status updated', 'success');
            },
            error: (error) => {
                console.error('Error updating task status:', error);
                this.showNotification('Error updating task status', 'error');
            }
        });
    }

    // getInitials(name: string): string {
    //   return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    // }

    getDueStatus(enddate: string): { text: string; class: string } {
        if (!enddate) return { text: 'No due date', class: 'due-none' };

        const due = new Date(enddate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, class: 'due-overdue' };
        } else if (diffDays === 0) {
            return { text: 'Due today', class: 'due-today' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', class: 'due-tomorrow' };
        } else if (diffDays <= 7) {
            return { text: `Due in ${diffDays} days`, class: 'due-soon' };
        } else {
            return { text: due.toLocaleDateString(), class: 'due-future' };
        }
    }

    getUniqueAssignees(): string[] {
        return [...new Set(this.tasks.map(task => task.assignedtoname))];
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'on_hold': 'On Hold'
        };
        return labels[status] || status;
    }

    getDueDateLabel(filterValue: string): string {
        const labels: { [key: string]: string } = {
            'all': 'All Due Dates',
            'overdue': 'Overdue',
            'today': 'Due Today',
            'thisweek': 'Due This Week'
        };
        return labels[filterValue] || 'All Due Dates';
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    }

    getPriorityColor(priority: string) {
        return this.flagColorService.getPriorityColor(priority);
    }
    getStatusColor(status: string) {
        return this.flagColorService.getStatusColor(status);
    }

    getProgressColor(progress: number): string {
        return this.flagColorService.getProgressColor(progress);
    }

    getCompletedTasksCount(): number {
        return this.tasks.filter(t => t.status === 'completed').length;
    }

    getInProgressTasksCount(): number {
        return this.tasks.filter(t => t.status === 'in_progress').length;
    }

    getOverdueTasksCount(): number {
        return this.tasks.filter(
            t => t.enddate && new Date(t.enddate) < new Date() && t.status !== 'completed'
        ).length;
    }

    switchView(view: 'kanban' | 'list'): void {
        this.currentView = view;
    }

    getTasksByStatus(status: string): Task[] {
        return this.filteredTasks.filter(task => task.status === status);
    }

    getColumnTaskCount(status: string): number {
        return this.getTasksByStatus(status).length;
    }

    onTaskStatusChange(taskId: number, newStatus: Task['status']): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'completed' && task.initialprogress < 100) {
                task.initialprogress = 100;
            }
            this.applyFilters();
        }
    }

    // getCategoryIcon(category: string): string {
    //   const icons: { [key: string]: string } = {
    //     'candidate-review': 'fa-user-check',
    //     'interview': 'fa-comments',
    //     'follow-up': 'fa-phone',
    //     'documentation': 'fa-file-text',
    //     'reference': 'fa-users',
    //     'onboarding': 'fa-user-plus'
    //   };
    //   return icons[category] || 'fa-tasks';
    // }

    onTaskDrop(event: CdkDragDrop<Task[]>, newStatus: Task['status']): void {
        const taskId = typeof event.item.data === 'string' ? parseInt(event.item.data) : event.item.data;
        const task = this.tasks.find(t => t.id === taskId);

        if (task && task.status !== newStatus) {
            task.status = newStatus;
            if (newStatus === 'completed' && task.initialprogress < 100) {
                task.initialprogress = 100;
            } else if (newStatus === 'not_started') {
                task.initialprogress = 0;
            }
            this.applyFilters();
        }
    }

    getConnectedDropLists(): string[] {
        return this.kanbanColumns.map(col => col.id);
    }

    matchesDueDateFilter(task: Task): boolean {
        if (this.filterDueDate === 'all') {
            return true;
        }

        if (!task.enddate) {
            return this.filterDueDate === 'no-date';
        }

        const dueDate = new Date(task.enddate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        switch (this.filterDueDate) {
            case 'overdue':
                return dueDate < today && task.status !== 'completed';
            case 'today':
                return dueDate >= today && dueDate < tomorrow;
            case 'thisweek':
                return dueDate >= today && dueDate < weekFromNow;
            default:
                return true;
        }
    }




    openEditTaskDialog(task?: Task) {
        if (!task) return;

        const dialogRef = this.dialog.open(TodoTaskCreateDialog, {
            width: '800px',
            maxHeight: '90vh',
            data: {
                isEdit: true,
                taskData: task,
                viewTaskDeatils: false
            },
            disableClose: false,
            autoFocus: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Updated task data:', result);
                this.todoService.updateTaskById(result.id, result).subscribe({
                    next: (updatedTask) => {
                        this.showNotification('Task updated successfully', 'success');
                        // Tasks will reload automatically via the service subscription
                    },
                    error: (error) => {
                        console.error('Error updating task:', error);
                        this.showNotification('Error updating task', 'error');
                    }
                });
            }
        });
    }

    openCreateTaskDialog(): void {
        const dialogRef = this.dialog.open(TodoTaskCreateDialog, {
            width: '800px',
            maxHeight: '90vh',
            disableClose: false,
            data: {
                isEdit: false,
                taskData: null,
                viewTaskDeatils: false
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('New task data:', result);
                this.todoService.createTask(result).subscribe({
                    next: (newTask) => {
                        this.showNotification('Task created successfully', 'success');
                        // Tasks will reload automatically via the service subscription
                    },
                    error: (error) => {
                        console.error('Error creating task:', error);
                        this.showNotification('Error creating task', 'error');
                    }
                });
            }
        });
    }

    showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: type === 'success' ? 'snackbar-success' : type === 'error' ? 'snackbar-error' : 'snackbar-info'
        });
    }
    
}