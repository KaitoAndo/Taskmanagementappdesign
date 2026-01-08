# Task Manager Application Structure

## Overview
A comprehensive Windows desktop task management application built with React, featuring a Notion-inspired minimal and modern UI with full light/dark theme support.

## Core Features Implemented

### 1. Hierarchical Task Management
- Unlimited nesting of tasks (parent/subtask relationships)
- Task attributes: title, description, notes, due date, start date, duration, priority, status, tags, color labels
- Complete task lifecycle management (create, read, update, delete)

### 2. Main Views (5 Complete Views + Mini Window)

#### Dashboard View
- Overview statistics cards (progress, today's tasks, overdue, in-progress)
- Pie chart for status distribution
- Bar chart for priority distribution
- Quick access to today's and overdue tasks
- Visual progress percentage

#### List View
- Tree-structured hierarchical task list
- Expand/collapse functionality for task hierarchies
- Advanced filtering (status, priority, tags, search)
- Multiple sorting options (due date, priority, status, created date, custom)
- Inline task completion toggles
- Quick subtask addition

#### Kanban View
- Four status columns (To Do, In Progress, Review, Completed)
- Drag and drop task cards between columns
- Real-time status updates
- Column-specific task creation
- Visual task count per column

#### Calendar View
- Three viewing modes: Month, Week, Day
- Task visualization by due date
- Interactive date selection
- Color-coded task indicators
- Quick task completion from calendar

#### Gantt Chart View
- Timeline-based task visualization
- Task duration bars with color coding
- Priority-based color scheme
- Today indicator line
- Scrollable timeline with date headers
- Weekend highlighting

#### Mini Window (System Tray)
- Compact, semi-transparent design
- Quick task addition
- Today's tasks overview
- One-click task completion
- Maximize to full app

### 3. Navigation & UX

#### Sidebar
- Clean, hierarchical navigation
- Active view highlighting
- Keyboard shortcut indicators
- Theme toggle (light/dark)
- Quick access to all views
- Settings placeholder

#### Keyboard Shortcuts
- `Ctrl + N` - Create new task
- `Ctrl + /` - Toggle shortcuts dialog
- `1-5` - Switch between views
- `M` - Toggle mini window
- Full keyboard navigation support

### 4. Task Modal
- Comprehensive task editing
- All task attributes in one place
- Date pickers for start/due dates
- Duration input (in days)
- Priority and status selectors
- Tag management (comma-separated)
- Color label picker (8 colors)
- Notes and description fields

### 5. Theme System
- Light and dark mode support
- Persistent theme preference (localStorage)
- Smooth transitions between themes
- Optimized color schemes for both modes
- Professional Notion-inspired palette

## Technical Architecture

### Context Providers
1. **ThemeContext** - Theme state management
2. **TaskContext** - Task data and operations

### Component Structure
```
/src/app/
├── App.tsx                           # Main application component
├── types/
│   └── task.ts                       # TypeScript interfaces
├── context/
│   ├── TaskContext.tsx              # Task state management
│   └── ThemeContext.tsx             # Theme management
├── components/
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── TaskCard.tsx                 # Reusable task card
│   ├── TaskModal.tsx                # Task creation/editing modal
│   ├── KeyboardShortcuts.tsx        # Shortcuts dialog & hook
│   ├── EmptyState.tsx               # Empty state component
│   └── views/
│       ├── DashboardView.tsx        # Dashboard with charts
│       ├── ListView.tsx             # Hierarchical list
│       ├── KanbanView.tsx           # Drag-drop kanban
│       ├── CalendarView.tsx         # Calendar view
│       ├── GanttView.tsx            # Gantt timeline
│       └── MiniWindow.tsx           # System tray window
```

### Dependencies Used
- **recharts** - Charts and data visualization
- **react-dnd** & **react-dnd-html5-backend** - Drag and drop
- **date-fns** - Date manipulation and formatting
- **lucide-react** - Icon library
- **sonner** - Toast notifications
- **@radix-ui/** - UI primitives (dialog, select, calendar, etc.)

## Design Philosophy

### Notion-Inspired Principles
1. **Minimal & Clean** - Generous whitespace, clear hierarchy
2. **High Information Clarity** - Well-organized data presentation
3. **Professional Look** - Polished, developer-friendly interface
4. **Responsive Interactions** - Smooth transitions and hover states
5. **Keyboard-First** - Extensive keyboard shortcut support

### Color System
- **Priority Colors**: Low (blue), Medium (yellow), High (orange), Urgent (red)
- **Status Colors**: Custom badges with semantic meaning
- **Task Labels**: 8 customizable colors for visual organization
- **Theme Tokens**: Consistent design system across light/dark modes

## Data Model

### Task Interface
```typescript
{
  id: string
  title: string
  description: string
  notes: string
  dueDate: Date | null
  startDate: Date | null
  duration: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  tags: string[]
  colorLabel: string | null
  parentId: string | null
  subtasks: Task[]
  order: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}
```

## User Workflows

### Creating a Task
1. Click "New Task" button or press `Ctrl+N`
2. Fill in task details in modal
3. Optionally set priority, status, dates, tags, color
4. Save to create task

### Managing Task Hierarchies
1. Navigate to List View (press `2`)
2. Hover over parent task
3. Click "+" button to add subtask
4. Expand/collapse with chevron icons

### Drag & Drop Workflow (Kanban)
1. Navigate to Kanban View (press `3`)
2. Drag task card to different status column
3. Drop to automatically update status
4. Visual feedback during drag operation

### Timeline Planning (Gantt)
1. Navigate to Gantt View (press `5`)
2. View task timeline bars
3. Click task bar to edit
4. Adjust start date and duration in modal

## Performance Optimizations
- Memoized computed values (useMemo)
- Optimized re-renders with useCallback
- Efficient recursive task operations
- Lazy loading of views
- Virtualized lists for large task sets (ready for implementation)

## Scalability Features
- Multi-user ready architecture (add backend integration)
- Extensible task attributes
- Pluggable view system
- Modular component design
- TypeScript for type safety

## Future Enhancement Ideas
- Backend persistence (Supabase/Firebase)
- Real-time collaboration
- File attachments
- Task comments and activity log
- Advanced filtering and search
- Task templates
- Time tracking
- Notifications and reminders
- Export/import functionality
- Custom views and dashboards
