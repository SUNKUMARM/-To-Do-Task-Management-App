import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  category: string;

  assignedto: string;
  assignedtoid: any;
  assignedtoname: string

  startdate: string;
  enddate: string;
  reminderdate?: string;

  estimatedhours: number;
  initialprogress: number;

  candidatecode?: string;
  candidatename?: string;
  candidateemail?: string;
  reqcode?: string;

  tags?: string[];
  externallinks?: string[];
  additionalnotes?: string;

  orgid: string;
  tenantid: string;

  createdby: string;
  createdbyid: string;
  createdon: string;

  modifiedby: string;
  modifiedbyid: string;
  modifiedon: string;
}

export interface TaskDashboard {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

export interface TaskDataTableRequest {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  filterassignedto?: string;
  filtercreatedbyid?: string;
  filterstatus?: string;
  filterenddate?: 'overdue' | 'today' | 'thisweek' | 'all';
  filterpriority?: string;
}

export interface TaskDataTableResponse {
  tasks: Task[];
  totalRecords: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // API Base URL - Update this when backend is ready
  private apiUrl = '/api/tasks'; // Change to actual API URL

  // Mock data storage (remove when API is ready)
  private mockTasks: Task[] = [
    {
      "id": 1,
      "title": "Review CV - John Smith (Senior Developer)",
      "description": "Comprehensive review of John Smith's CV for Senior Frontend Developer position. Focus on React, TypeScript expertise, leadership experience, and cultural fit assessment.",
      "priority": "urgent",
      "status": "not_started",
      "category": "candidate-review",
      "assignedto": "admin@crescoworks.com",
      "assignedtoid": 4,
      "assignedtoname": 'Admin Crescoworks',
      "startdate": "2025-10-12T09:00:00.000Z",
      "enddate": "2025-10-15T17:00:00.000Z",
      "reminderdate": "2025-10-13T09:00:00.000Z",
      "estimatedhours": 2,
      "initialprogress": 0,
      "candidatecode": "CAND-001",
      "candidatename": "John Smith",
      "candidateemail": "john.smith@email.com",
      "reqcode": "REQ-DEV-1023",
      "tags": ["urgent", "senior-role", "frontend"],
      "externallinks": ["https://linkedin.com/in/johnsmith-dev"],
      "additionalnotes": "Candidate comes highly recommended. 8+ years in React and team leadership.",
      "orgid": "ORG-001",
      "tenantid": "TNT-001",
      "createdby": "Mike Davis",
      "createdbyid": "USR-010",
      "createdon": "2025-10-12T08:45:00.000Z",
      "modifiedby": "Mike Davis",
      "modifiedbyid": "USR-010",
      "modifiedon": "2025-10-12T08:45:00.000Z"
    },
    {
      "id": 2,
      "title": "Schedule Interview - Priya R (UI/UX Designer)",
      "description": "Arrange initial round of interviews for Priya focusing on design process, Figma proficiency, and UX case studies.",
      "priority": "high",
      "status": "in_progress",
      "category": "interview-scheduling",
            "assignedto": "admin@crescoworks.com",
      "assignedtoid": 4,
      "assignedtoname": 'Admin Crescoworks',
      "startdate": "2025-10-10T10:00:00.000Z",
      "enddate": "2025-10-17T10:00:00.000Z",
      "reminderdate": "2025-10-15T10:00:00.000Z",
      "estimatedhours": 4,
      "initialprogress": 40,
      "candidatecode": "CAND-002",
      "candidatename": "Priya R",
      "candidateemail": "priya.r@email.com",
      "reqcode": "REQ-DES-2045",
      "tags": ["design", "uiux", "interview"],
      "externallinks": ["https://portfolio.priyar.design"],
      "additionalnotes": "Ensure inclusion of design lead in the panel.",
      "orgid": "ORG-001",
      "tenantid": "TNT-001",
      "createdby": "Sarah Johnson",
      "createdbyid": "USR-011",
      "createdon": "2025-10-10T09:30:00.000Z",
      "modifiedby": "Rahul Menon",
      "modifiedbyid": "USR-012",
      "modifiedon": "2025-10-14T09:30:00.000Z"
    },
    {
      "id": 3,
      "title": "Background Verification - Amit Patel",
      "description": "Initiate background verification for Amit Patel including employment history, academic credentials, and criminal record check.",
      "priority": "medium",
      "status": "in_progress",
      "category": "background-check",
            "assignedto": "admin@crescoworks.com",
      "assignedtoid": 4,
      "assignedtoname": 'Admin Crescoworks',
      "startdate": "2025-10-09T08:00:00.000Z",
      "enddate": "2025-10-20T17:00:00.000Z",
      "reminderdate": "2025-10-18T08:00:00.000Z",
      "estimatedhours": 6,
      "initialprogress": 60,
      "candidatecode": "CAND-003",
      "candidatename": "Amit Patel",
      "candidateemail": "amit.patel@email.com",
      "reqcode": "REQ-BE-3010",
      "tags": ["background", "verification"],
      "externallinks": ["https://verifications.io/report?id=BE3010"],
      "additionalnotes": "Pending confirmation from last employer.",
      "orgid": "ORG-002",
      "tenantid": "TNT-002",
      "createdby": "Neha Singh",
      "createdbyid": "USR-013",
      "createdon": "2025-10-09T07:30:00.000Z",
      "modifiedby": "Neha Singh",
      "modifiedbyid": "USR-013",
      "modifiedon": "2025-10-14T07:30:00.000Z"
    },
    {
      "id": 4,
      "title": "Offer Letter Draft - Karthik N (Backend Engineer)",
      "description": "Prepare offer letter draft for Karthik N with compensation details, joining date, and benefits summary.",
      "priority": "high",
      "status": "not_started",
      "category": "offer-preparation",
            "assignedto": "admin@crescoworks.com",
      "assignedtoid": 4,
      "assignedtoname": 'Admin Crescoworks',
      "startdate": "2025-10-15T09:00:00.000Z",
      "enddate": "2025-10-18T09:00:00.000Z",
      "reminderdate": "2025-10-17T09:00:00.000Z",
      "estimatedhours": 3,
      "initialprogress": 0,
      "candidatecode": "CAND-004",
      "candidatename": "Karthik N",
      "candidateemail": "karthik.n@email.com",
      "reqcode": "REQ-BE-3088",
      "tags": ["offer", "backend", "draft"],
      "externallinks": ["https://docs.company.com/offers/template"],
      "additionalnotes": "Awaiting final compensation approval from finance.",
      "orgid": "ORG-003",
      "tenantid": "TNT-003",
      "createdby": "Mike Davis",
      "createdbyid": "USR-010",
      "createdon": "2025-10-15T08:30:00.000Z",
      "modifiedby": "Mike Davis",
      "modifiedbyid": "USR-010",
      "modifiedon": "2025-10-15T08:30:00.000Z"
    },
    {
      "id": 5,
      "title": "Post-Interview Feedback - Lisa George",
      "description": "Collect and compile interview feedback for Lisa George from all panel members for the Marketing Manager position.",
      "priority": "medium",
      "status": "completed",
      "category": "feedback-compilation",
           "assignedto": "admin@crescoworks.com",
      "assignedtoid": 4,
      "assignedtoname": 'Admin Crescoworks',
      "startdate": "2025-10-05T10:00:00.000Z",
      "enddate": "2025-10-10T18:00:00.000Z",
      "reminderdate": "2025-10-07T10:00:00.000Z",
      "estimatedhours": 1.5,
      "initialprogress": 100,
      "candidatecode": "CAND-005",
      "candidatename": "Lisa George",
      "candidateemail": "lisa.george@email.com",
      "reqcode": "REQ-MKT-1109",
      "tags": ["feedback", "marketing"],
      "externallinks": ["https://docs.company.com/feedback/lisageorge"],
      "additionalnotes": "Feedback consolidated and sent to hiring manager.",
      "orgid": "ORG-004",
      "tenantid": "TNT-004",
      "createdby": "Sarah Johnson",
      "createdbyid": "USR-011",
      "createdon": "2025-10-05T09:00:00.000Z",
      "modifiedby": "Vikram Shah",
      "modifiedbyid": "USR-014",
      "modifiedon": "2025-10-10T09:00:00.000Z"
    }
  ];

  // Subject to notify components of data changes
  private tasksUpdated = new BehaviorSubject<boolean>(true);
  public tasksUpdated$ = this.tasksUpdated.asObservable();

  constructor(private http: HttpClient) { }

  // ==================== API METHODS ====================

  /**
   * 1. Create Task
   * POST /api/tasks
   */
  createTask(taskData: Partial<Task>): Observable<Task> {
    // MOCK Implementation - Remove when API is ready
    const newTask: Task = {
      id: this.getNextId(),
      title: taskData.title || '',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'not_started',
      category: taskData.category || '',
      assignedto: taskData.assignedto || '',
      assignedtoid: taskData.assignedtoid || null,
      assignedtoname: taskData.assignedtoname || '',
      startdate: taskData.startdate || '',
      enddate: taskData.enddate || '',
      reminderdate: taskData.reminderdate || '',
      estimatedhours: taskData.estimatedhours || 0,
      initialprogress: taskData.initialprogress || 0,
      candidatecode: taskData.candidatecode || '',
      candidatename: taskData.candidatename || '',
      candidateemail: taskData.candidateemail || '',
      reqcode: taskData.reqcode || '',
      tags: taskData.tags || [],
      externallinks: taskData.externallinks || [],
      additionalnotes: taskData.additionalnotes || '',
      orgid: taskData.orgid || 'ORG-001',
      tenantid: taskData.tenantid || 'TNT-001',
      createdby: 'Current User',
      createdbyid: 'USR-001',
      createdon: new Date().toISOString(),
      modifiedby: 'Current User',
      modifiedbyid: 'USR-001',
      modifiedon: new Date().toISOString()
    };

    this.mockTasks.push(newTask);
    this.tasksUpdated.next(true);
    return of(newTask).pipe(delay(500)); // Simulate network delay

    // REAL API Implementation - Uncomment when ready
    // return this.http.post<Task>(this.apiUrl, taskData);
  }

  /**
   * 2. Update Task By ID
   * PUT /api/tasks/:id
   */
  updateTaskById(id: number, taskData: Partial<Task>): Observable<Task> {
    // MOCK Implementation - Remove when API is ready
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks[index] = {
        ...this.mockTasks[index],
        ...taskData,
        modifiedby: 'Current User',
        modifiedbyid: 'USR-001',
        modifiedon: new Date().toISOString()
      };
      this.tasksUpdated.next(true);
      return of(this.mockTasks[index]).pipe(delay(500));
    }
    throw new Error('Task not found');

    // REAL API Implementation - Uncomment when ready
    // return this.http.put<Task>(`${this.apiUrl}/${id}`, taskData);
  }

  /**
   * 3. Delete Task By ID (Soft Delete)
   * DELETE /api/tasks/:id
   */
  deleteTaskById(id: number): Observable<{ success: boolean; message: string }> {
    // MOCK Implementation - Remove when API is ready
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks.splice(index, 1);
      this.tasksUpdated.next(true);
      return of({ success: true, message: 'Task deleted successfully' }).pipe(delay(500));
    }
    return of({ success: false, message: 'Task not found' });

    // REAL API Implementation - Uncomment when ready
    // return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * 4. Update Task Status By ID
   * PATCH /api/tasks/:id/status
   */
  updateTaskStatusById(id: number, status: Task['status']): Observable<Task> {
    // MOCK Implementation - Remove when API is ready
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks[index].status = status;

      // Auto-update progress based on status
      if (status === 'completed' && this.mockTasks[index].initialprogress < 100) {
        this.mockTasks[index].initialprogress = 100;
      } else if (status === 'not_started') {
        this.mockTasks[index].initialprogress = 0;
      }

      this.mockTasks[index].modifiedby = 'Current User';
      this.mockTasks[index].modifiedbyid = 'USR-001';
      this.mockTasks[index].modifiedon = new Date().toISOString();

      this.tasksUpdated.next(true);
      return of(this.mockTasks[index]).pipe(delay(500));
    }
    throw new Error('Task not found');

    // REAL API Implementation - Uncomment when ready
    // return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * 5. Get Task Dashboard Metrics
   * GET /api/tasks/dashboard
   */
  getTaskDashboard(userId?: string): Observable<TaskDashboard> {
    // MOCK Implementation - Remove when API is ready
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalTasks = this.mockTasks.length;
    const completedTasks = this.mockTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = this.mockTasks.filter(t =>
      t.enddate && new Date(t.enddate) < today && t.status !== 'completed'
    ).length;
    const dueTodayTasks = this.mockTasks.filter(t => {
      if (!t.enddate) return false;
      const dueDate = new Date(t.enddate);
      return dueDate >= today && dueDate < tomorrow && t.status !== 'completed';
    }).length;

    const dashboard: TaskDashboard = {
      totalTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks
    };

    return of(dashboard).pipe(delay(500));

    // REAL API Implementation - Uncomment when ready
    // const params = userId ? new HttpParams().set('userId', userId) : new HttpParams();
    // return this.http.get<TaskDashboard>(`${this.apiUrl}/dashboard`, { params });
  }

  /**
   * 6. Get Tasks DataTable with Filters, Sort, Pagination
   * GET /api/tasks/datatable
   */
  getTasksDataTable(request: TaskDataTableRequest): Observable<TaskDataTableResponse> {
    // MOCK Implementation - Remove when API is ready
    let filteredTasks = [...this.mockTasks];

    // Apply search filter
    if (request.searchTerm) {
      const searchLower = request.searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignedtoname?.toLowerCase().includes(searchLower) ||
        task.candidatename?.toLowerCase().includes(searchLower)
      );
    }

    // Apply preset filters
    if (request.filterassignedto) {
      filteredTasks = filteredTasks.filter(t => t.assignedtoname === request.filterassignedto);
    }

    if (request.filtercreatedbyid) {
      filteredTasks = filteredTasks.filter(t => t.createdbyid === request.filtercreatedbyid);
    }

    if (request.filterstatus) {
      filteredTasks = filteredTasks.filter(t => t.status === request.filterstatus);
    }

    if (request.filterpriority) {
      filteredTasks = filteredTasks.filter(t => t.priority === request.filterpriority);
    }

    // Apply date filter
    if (request.filterenddate && request.filterenddate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filteredTasks = filteredTasks.filter(task => {
        if (!task.enddate) return false;
        const dueDate = new Date(task.enddate);

        switch (request.filterenddate) {
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return dueDate >= today && dueDate < tomorrow;
          case 'thisweek':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate >= today && dueDate < weekFromNow;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (request.sortField) {
      filteredTasks.sort((a, b) => {
        const aVal = (a as any)[request.sortField!];
        const bVal = (b as any)[request.sortField!];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return request.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const totalRecords = filteredTasks.length;
    const startIndex = (request.page - 1) * request.pageSize;
    const paginatedTasks = filteredTasks.slice(startIndex, startIndex + request.pageSize);

    const response: TaskDataTableResponse = {
      tasks: paginatedTasks,
      totalRecords,
      page: request.page,
      pageSize: request.pageSize
    };

    return of(response).pipe(delay(500));

    // REAL API Implementation - Uncomment when ready
    // let params = new HttpParams()
    //   .set('page', request.page.toString())
    //   .set('pageSize', request.pageSize.toString());

    // if (request.sortField) params = params.set('sortField', request.sortField);
    // if (request.sortOrder) params = params.set('sortOrder', request.sortOrder);
    // if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    // if (request.filterassignedto) params = params.set('filterassignedto', request.filterassignedto);
    // if (request.filtercreatedbyid) params = params.set('filtercreatedbyid', request.filtercreatedbyid);
    // if (request.filterstatus) params = params.set('filterstatus', request.filterstatus);
    // if (request.filterenddate) params = params.set('filterenddate', request.filterenddate);
    // if (request.filterpriority) params = params.set('filterpriority', request.filterpriority);

    // return this.http.get<TaskDataTableResponse>(`${this.apiUrl}/datatable`, { params });
  }

  /**
   * 7. Get Task By ID
   * GET /api/tasks/:id
   */
  getTaskById(id: number): Observable<Task> {
    // MOCK Implementation - Remove when API is ready
    const task = this.mockTasks.find(t => t.id === id);
    if (task) {
      return of(task).pipe(delay(500));
    }
    throw new Error('Task not found');

    // REAL API Implementation - Uncomment when ready
    // return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // ==================== HELPER METHODS ====================

  private getNextId(): number {
    return this.mockTasks.length > 0
      ? Math.max(...this.mockTasks.map(t => t.id)) + 1
      : 1;
  }

  // Get all tasks (for local use)
  getAllTasks(): Observable<Task[]> {
    return of([...this.mockTasks]).pipe(delay(300));
  }
}
