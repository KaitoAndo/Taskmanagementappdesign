import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Task, TaskFilter, SortOption, TaskPriority, TaskStatus } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addSubtask: (parentId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'parentId'>) => void;
  moveTask: (taskId: string, newParentId: string | null, newOrder: number) => void;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  getTaskById: (id: string) => Task | undefined;
  getAllTasks: () => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

// Generate mock tasks
const generateMockTasks = (): Task[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design System Architecture',
      description: 'Plan and design the component architecture',
      notes: 'Focus on reusability and scalability',
      dueDate: today,
      priority: 'high',
      status: 'in-progress',
      tags: ['design', 'architecture'],
      colorLabel: '#3b82f6',
      parentId: null,
      subtasks: [],
      order: 0,
      completed: false,
      createdAt: new Date(today.getTime() - 86400000 * 3),
      updatedAt: new Date(),
      startDate: new Date(today.getTime() - 86400000 * 2),
      duration: 5
    },
    {
      id: '2',
      title: 'API Integration',
      description: 'Integrate backend APIs',
      notes: '',
      dueDate: tomorrow,
      priority: 'medium',
      status: 'todo',
      tags: ['development', 'backend'],
      colorLabel: '#10b981',
      parentId: null,
      subtasks: [],
      order: 1,
      completed: false,
      createdAt: new Date(today.getTime() - 86400000 * 2),
      updatedAt: new Date(),
      startDate: today,
      duration: 3
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review pull requests from team',
      notes: 'Check PR #234 and #235',
      dueDate: yesterday,
      priority: 'urgent',
      status: 'todo',
      tags: ['review'],
      colorLabel: '#ef4444',
      parentId: null,
      subtasks: [],
      order: 2,
      completed: false,
      createdAt: new Date(today.getTime() - 86400000 * 4),
      updatedAt: new Date(),
      startDate: yesterday,
      duration: 1
    },
    {
      id: '4',
      title: 'Documentation Update',
      description: 'Update project documentation',
      notes: '',
      dueDate: nextWeek,
      priority: 'low',
      status: 'review',
      tags: ['documentation'],
      colorLabel: '#8b5cf6',
      parentId: null,
      subtasks: [],
      order: 3,
      completed: false,
      createdAt: new Date(today.getTime() - 86400000),
      updatedAt: new Date(),
      startDate: new Date(today.getTime() + 86400000 * 2),
      duration: 4
    },
    {
      id: '5',
      title: 'Testing Framework Setup',
      description: 'Set up Jest and React Testing Library',
      notes: 'Include E2E tests with Playwright',
      dueDate: today,
      priority: 'high',
      status: 'completed',
      tags: ['testing', 'development'],
      colorLabel: '#f59e0b',
      parentId: null,
      subtasks: [],
      order: 4,
      completed: true,
      createdAt: new Date(today.getTime() - 86400000 * 5),
      updatedAt: new Date(),
      startDate: new Date(today.getTime() - 86400000 * 3),
      duration: 2
    }
  ];

  // Add subtasks
  tasks.push({
    id: '1-1',
    title: 'Create component library',
    description: 'Build reusable UI components',
    notes: '',
    dueDate: today,
    priority: 'high',
    status: 'in-progress',
    tags: ['design'],
    colorLabel: '#3b82f6',
    parentId: '1',
    subtasks: [],
    order: 0,
    completed: false,
    createdAt: new Date(today.getTime() - 86400000 * 2),
    updatedAt: new Date(),
    startDate: new Date(today.getTime() - 86400000 * 2),
    duration: 2
  });

  tasks.push({
    id: '1-2',
    title: 'Define design tokens',
    description: 'Colors, typography, spacing',
    notes: '',
    dueDate: today,
    priority: 'medium',
    status: 'completed',
    tags: ['design'],
    colorLabel: '#3b82f6',
    parentId: '1',
    subtasks: [],
    order: 1,
    completed: true,
    createdAt: new Date(today.getTime() - 86400000 * 2),
    updatedAt: new Date(),
    startDate: new Date(today.getTime() - 86400000 * 2),
    duration: 1
  });

  // Build subtask relationships
  tasks.forEach(task => {
    if (task.parentId) {
      const parent = tasks.find(t => t.id === task.parentId);
      if (parent) {
        parent.subtasks.push(task);
      }
    }
  });

  return tasks.filter(t => !t.parentId); // Return only top-level tasks
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks());
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sortOption, setSortOption] = useState<SortOption>('custom');

  const getAllTasksFlat = useCallback((taskList: Task[]): Task[] => {
    const result: Task[] = [];
    const traverse = (task: Task) => {
      result.push(task);
      task.subtasks.forEach(traverse);
    };
    taskList.forEach(traverse);
    return result;
  }, []);

  const getAllTasks = useCallback(() => {
    return getAllTasksFlat(tasks);
  }, [tasks, getAllTasksFlat]);

  const getTaskById = useCallback((id: string): Task | undefined => {
    const allTasks = getAllTasks();
    return allTasks.find(t => t.id === id);
  }, [getAllTasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: []
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updateRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === id) {
          return { ...task, ...updates, updatedAt: new Date() };
        }
        if (task.subtasks.length > 0) {
          return { ...task, subtasks: updateRecursive(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(prev => updateRecursive(prev));
  }, []);

  const deleteTask = useCallback((id: string) => {
    const deleteRecursive = (taskList: Task[]): Task[] => {
      return taskList
        .filter(task => task.id !== id)
        .map(task => ({
          ...task,
          subtasks: deleteRecursive(task.subtasks)
        }));
    };
    setTasks(prev => deleteRecursive(prev));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    const updateRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            status: newCompleted ? 'completed' : 'todo',
            updatedAt: new Date()
          };
        }
        if (task.subtasks.length > 0) {
          return { ...task, subtasks: updateRecursive(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(prev => updateRecursive(prev));
  }, []);

  const addSubtask = useCallback((parentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'parentId'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: []
    };

    const addRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: [...task.subtasks, newTask]
          };
        }
        if (task.subtasks.length > 0) {
          return { ...task, subtasks: addRecursive(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(prev => addRecursive(prev));
  }, []);

  const moveTask = useCallback((taskId: string, newParentId: string | null, newOrder: number) => {
    // Implementation for drag and drop reordering
    // This is a simplified version
    setTasks(prev => {
      const allTasks = getAllTasksFlat(prev);
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return prev;

      // Remove task from current location
      const removeRecursive = (taskList: Task[]): Task[] => {
        return taskList
          .filter(t => t.id !== taskId)
          .map(t => ({
            ...t,
            subtasks: removeRecursive(t.subtasks)
          }));
      };

      let updated = removeRecursive(prev);

      // Add task to new location
      const taskToAdd = { ...task, parentId: newParentId, order: newOrder };

      if (newParentId === null) {
        updated = [...updated, taskToAdd];
      } else {
        const addRecursive = (taskList: Task[]): Task[] => {
          return taskList.map(t => {
            if (t.id === newParentId) {
              return { ...t, subtasks: [...t.subtasks, taskToAdd] };
            }
            return { ...t, subtasks: addRecursive(t.subtasks) };
          });
        };
        updated = addRecursive(updated);
      }

      return updated;
    });
  }, [getAllTasksFlat]);

  const getTodayTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getAllTasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && !task.completed;
    });
  }, [getAllTasks]);

  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return getAllTasks().filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    });
  }, [getAllTasks]);

  const value = useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubtask,
    moveTask,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    getTaskById,
    getAllTasks,
    getTodayTasks,
    getOverdueTasks
  }), [
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubtask,
    moveTask,
    filter,
    sortOption,
    getTaskById,
    getAllTasks,
    getTodayTasks,
    getOverdueTasks
  ]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
