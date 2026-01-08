import React from 'react';
import { Task, TaskPriority } from '../types/task';
import { Calendar, Flag, Tag, MoreVertical, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
  showParent?: boolean;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'text-blue-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
};

const statusColors: Record<string, string> = {
  'todo': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
  showParent = false
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-lg p-4 
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${task.completed ? 'opacity-60' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
      style={{
        borderLeft: task.colorLabel ? `4px solid ${task.colorLabel}` : undefined
      }}
    >
      <div className="flex items-start gap-3">
        {/* Complete checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.();
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-foreground mb-1 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          
          {!compact && task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status badge */}
            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status.replace('-', ' ')}
            </Badge>

            {/* Priority */}
            <div className="flex items-center gap-1">
              <Flag className={`w-3.5 h-3.5 ${priorityColors[task.priority]}`} />
              <span className={`text-xs ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.tags.slice(0, 2).join(', ')}
                  {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                </span>
              </div>
            )}

            {/* Subtasks count */}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.();
            }}>
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
