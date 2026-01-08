export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  notes: string;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  colorLabel: string | null;
  parentId: string | null;
  subtasks: Task[];
  order: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  duration: number; // in days
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  dueDateRange?: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery?: string;
}

export type SortOption = 'dueDate' | 'priority' | 'status' | 'createdAt' | 'custom';
