import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Task, TaskPriority, TaskStatus, SortOption } from '../../types/task';
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Plus, Calendar, Flag, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { format } from 'date-fns';

interface TaskRowProps {
  task: Task;
  level: number;
  onToggleExpand: (taskId: string) => void;
  expandedTasks: Set<string>;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onAddSubtask: (parentId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'text-blue-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
};

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  level,
  onToggleExpand,
  expandedTasks,
  onEditTask,
  onToggleComplete,
  onAddSubtask
}) => {
  const isExpanded = expandedTasks.has(task.id);
  const hasSubtasks = task.subtasks.length > 0;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <>
      <div
        className={`
          group flex items-center gap-3 py-2.5 px-4 
          border-b border-border hover:bg-accent/50 transition-colors
          ${task.completed ? 'opacity-60' : ''}
        `}
        style={{ paddingLeft: `${16 + level * 32}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => hasSubtasks && onToggleExpand(task.id)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
        >
          {hasSubtasks && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        {/* Color indicator */}
        {task.colorLabel && (
          <div
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: task.colorLabel }}
          />
        )}

        {/* Title */}
        <button
          onClick={() => onEditTask(task)}
          className={`
            flex-1 text-left font-medium text-foreground hover:text-primary transition-colors
            ${task.completed ? 'line-through' : ''}
          `}
        >
          {task.title}
        </button>

        {/* Priority */}
        <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
          <Flag className="w-4 h-4" />
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-sm min-w-[80px] ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}

        {/* Status Badge */}
        <Badge variant="secondary" className="min-w-[100px] justify-center">
          {task.status.replace('-', ' ')}
        </Badge>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex items-center gap-1 min-w-[120px]">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">
              {task.tags[0]}
              {task.tags.length > 1 && ` +${task.tags.length - 1}`}
            </span>
          </div>
        )}

        {/* Add Subtask Button */}
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAddSubtask(task.id);
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Subtasks */}
      {isExpanded && hasSubtasks && task.subtasks.map(subtask => (
        <TaskRow
          key={subtask.id}
          task={subtask}
          level={level + 1}
          onToggleExpand={onToggleExpand}
          expandedTasks={expandedTasks}
          onEditTask={onEditTask}
          onToggleComplete={onToggleComplete}
          onAddSubtask={onAddSubtask}
        />
      ))}
    </>
  );
};

export const ListView: React.FC<{
  onEditTask: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
}> = ({ onEditTask, onAddSubtask }) => {
  const { tasks, toggleTaskComplete, sortOption, setSortOption } = useTaskContext();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (taskList: Task[]) => {
      taskList.forEach(task => {
        if (task.subtasks.length > 0) {
          allIds.add(task.id);
          collectIds(task.subtasks);
        }
      });
    };
    collectIds(tasks);
    setExpandedTasks(allIds);
  };

  const collapseAll = () => {
    setExpandedTasks(new Set());
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply filters
    const filterRecursive = (taskList: Task[]): Task[] => {
      return taskList
        .filter(task => {
          if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }
          if (statusFilter !== 'all' && task.status !== statusFilter) {
            return false;
          }
          if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
            return false;
          }
          return true;
        })
        .map(task => ({
          ...task,
          subtasks: filterRecursive(task.subtasks)
        }));
    };

    filtered = filterRecursive(filtered);

    // Apply sorting
    const sortRecursive = (taskList: Task[]): Task[] => {
      const sorted = [...taskList].sort((a, b) => {
        switch (sortOption) {
          case 'dueDate':
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'priority':
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          case 'status':
            const statusOrder = { 'todo': 0, 'in-progress': 1, 'review': 2, 'completed': 3 };
            return statusOrder[a.status] - statusOrder[b.status];
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return a.order - b.order;
        }
      });

      return sorted.map(task => ({
        ...task,
        subtasks: sortRecursive(task.subtasks)
      }));
    };

    return sortRecursive(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortOption]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-border">
        <h2 className="text-3xl font-semibold text-foreground">List View</h2>
        <p className="text-muted-foreground mt-1">Hierarchical task organization</p>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Order</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        ) : (
          <div>
            {filteredAndSortedTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                level={0}
                onToggleExpand={toggleExpand}
                expandedTasks={expandedTasks}
                onEditTask={onEditTask}
                onToggleComplete={toggleTaskComplete}
                onAddSubtask={onAddSubtask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
