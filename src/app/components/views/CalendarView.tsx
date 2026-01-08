import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Task } from '../../types/task';
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<{
  onEditTask: (task: Task) => void;
}> = ({ onEditTask }) => {
  const { getAllTasks, toggleTaskComplete } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allTasks = getAllTasks();

  const tasksWithDates = useMemo(() => {
    return allTasks.filter(task => task.dueDate !== null);
  }, [allTasks]);

  const getTasksForDate = (date: Date): Task[] => {
    return tasksWithDates.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const tasksForDay = getTasksForDate(currentDay);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isCurrentDay = isToday(currentDay);

        days.push(
          <div
            key={currentDay.toString()}
            onClick={() => setSelectedDate(currentDay)}
            className={`
              min-h-[120px] border border-border p-2 cursor-pointer
              transition-colors hover:bg-accent/50
              ${!isCurrentMonth ? 'bg-muted/30' : 'bg-background'}
              ${isCurrentDay ? 'ring-2 ring-primary' : ''}
              ${selectedDate && isSameDay(selectedDate, currentDay) ? 'bg-accent' : ''}
            `}
          >
            <div className={`text-sm font-medium mb-2 ${!isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}`}>
              {format(currentDay, 'd')}
            </div>
            <div className="space-y-1">
              {tasksForDay.slice(0, 3).map(task => (
                <button
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className={`
                    w-full text-left text-xs px-2 py-1 rounded
                    bg-primary/10 hover:bg-primary/20
                    truncate transition-colors
                    ${task.completed ? 'line-through opacity-60' : ''}
                  `}
                  style={{
                    borderLeft: task.colorLabel ? `3px solid ${task.colorLabel}` : undefined
                  }}
                >
                  {task.title}
                </button>
              ))}
              {tasksForDay.length > 3 && (
                <div className="text-xs text-muted-foreground px-2">
                  +{tasksForDay.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-0">{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const tasksForDay = getTasksForDate(day);

      days.push(
        <div key={day.toString()} className="border-r border-border last:border-r-0">
          <div className={`p-3 border-b border-border text-center ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}`}>
            <div className="text-sm font-medium">{format(day, 'EEE')}</div>
            <div className="text-lg font-semibold">{format(day, 'd')}</div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {tasksForDay.map(task => (
              <button
                key={task.id}
                onClick={() => onEditTask(task)}
                className="w-full text-left p-3 rounded-lg border border-border hover:shadow-md transition-all bg-card"
                style={{
                  borderLeft: task.colorLabel ? `4px solid ${task.colorLabel}` : undefined
                }}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">{days}</div>;
  };

  const renderDayView = () => {
    const tasksForDay = getTasksForDate(currentDate);

    return (
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        {tasksForDay.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No tasks scheduled for this day
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForDay.map(task => (
              <button
                key={task.id}
                onClick={() => onEditTask(task)}
                className="w-full text-left p-4 rounded-lg border border-border hover:shadow-md transition-all bg-card"
                style={{
                  borderLeft: task.colorLabel ? `4px solid ${task.colorLabel}` : undefined
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="secondary">{task.status.replace('-', ' ')}</Badge>
                      <Badge variant="secondary">{task.priority}</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const navigatePrev = () => {
    setCurrentDate(prev => {
      switch (mode) {
        case 'month':
          return addMonths(prev, -1);
        case 'week':
          return addDays(prev, -7);
        case 'day':
          return addDays(prev, -1);
        default:
          return prev;
      }
    });
  };

  const navigateNext = () => {
    setCurrentDate(prev => {
      switch (mode) {
        case 'month':
          return addMonths(prev, 1);
        case 'week':
          return addDays(prev, 7);
        case 'day':
          return addDays(prev, 1);
        default:
          return prev;
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-border">
        <h2 className="text-3xl font-semibold text-foreground">Calendar View</h2>
        <p className="text-muted-foreground mt-1">Schedule and timeline overview</p>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigatePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <div className="ml-4 text-lg font-semibold">
            {mode === 'month' && format(currentDate, 'MMMM yyyy')}
            {mode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
            {mode === 'day' && format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mode === 'month' ? 'default' : 'outline'}
            onClick={() => setMode('month')}
          >
            Month
          </Button>
          <Button
            variant={mode === 'week' ? 'default' : 'outline'}
            onClick={() => setMode('week')}
          >
            Week
          </Button>
          <Button
            variant={mode === 'day' ? 'default' : 'outline'}
            onClick={() => setMode('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6 overflow-auto">
        {mode === 'month' && (
          <>
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            {renderMonthView()}
          </>
        )}
        {mode === 'week' && renderWeekView()}
        {mode === 'day' && renderDayView()}
      </div>
    </div>
  );
};
