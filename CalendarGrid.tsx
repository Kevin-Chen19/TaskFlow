import React from 'react';
import { Task, TaskStatus } from '../types';
import { getCalendarGrid, isSameDay } from '../utils/dateUtils';
import { USERS } from '../constants';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CalendarGridProps {
  currentMonth: Date;
  tasks: Task[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, tasks }) => {
  const weeks = getCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth());

  const getUserInitials = (userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) return '??';
    return user.name.split(' ').map(n => n[0]).join('');
  };

  const getTaskStyles = (task: Task) => {
    switch (task.status) {
      case TaskStatus.InProgress:
        return 'bg-primary/10 text-primary border-primary';
      case TaskStatus.Completed:
        return 'bg-completed/10 text-emerald-700 border-completed';
      case TaskStatus.Overdue:
        return 'bg-overdue text-white border-overdue shadow-md shadow-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper to render a single week with lane logic
  const renderWeek = (week: Date[], weekIndex: number) => {
    const weekStart = week[0];
    const weekEnd = week[6];
    
    // Find tasks that intersect with this week
    // We normalize times to avoid edge case issues with hours
    const tasksInWeek = tasks.filter(task => {
        // Task end must be >= weekStart AND Task start must be <= weekEnd
        const tStart = new Date(task.startDate); tStart.setHours(0,0,0,0);
        const tEnd = new Date(task.endDate); tEnd.setHours(23,59,59,999);
        const wStart = new Date(weekStart); wStart.setHours(0,0,0,0);
        const wEnd = new Date(weekEnd); wEnd.setHours(23,59,59,999);
        
        return tEnd >= wStart && tStart <= wEnd;
    });

    // Sort by start date, then duration (longer first)
    tasksInWeek.sort((a, b) => {
        if (a.startDate.getTime() !== b.startDate.getTime()) {
            return a.startDate.getTime() - b.startDate.getTime();
        }
        const durA = a.endDate.getTime() - a.startDate.getTime();
        const durB = b.endDate.getTime() - b.startDate.getTime();
        return durB - durA; 
    });

    // Assign lanes
    const lanes: Task[][] = [];
    const taskLaneMap = new Map<string, number>();

    tasksInWeek.forEach(task => {
        let laneIndex = 0;
        while (true) {
            const lane = lanes[laneIndex] || [];
            
            // Check for overlap in this specific week view
            // We need to check if the portion of the task visible in this week overlaps with the portion of any other task in the lane visible in this week
            const hasOverlap = lane.some(existingTask => {
                // Get intersection with week for both
                const t1Start = existingTask.startDate < weekStart ? weekStart : existingTask.startDate;
                const t1End = existingTask.endDate > weekEnd ? weekEnd : existingTask.endDate;
                
                const t2Start = task.startDate < weekStart ? weekStart : task.startDate;
                const t2End = task.endDate > weekEnd ? weekEnd : task.endDate;

                // Simple date overlap check
                // We use setHours to ensure we are comparing days not milliseconds if dates are close
                const s1 = new Date(t1Start); s1.setHours(0,0,0,0);
                const e1 = new Date(t1End); e1.setHours(23,59,59,999);
                const s2 = new Date(t2Start); s2.setHours(0,0,0,0);
                const e2 = new Date(t2End); e2.setHours(23,59,59,999);

                return s1 <= e2 && s2 <= e1;
            });

            if (!hasOverlap) {
                if (!lanes[laneIndex]) lanes[laneIndex] = [];
                lanes[laneIndex].push(task);
                taskLaneMap.set(task.id, laneIndex);
                break;
            }
            laneIndex++;
        }
    });

    // Calculate dynamic height
    // Base padding top 32px (date header) + padding bottom 10px
    // Each task is 28px height + 4px gap = 32px
    const tasksHeight = lanes.length * 32;
    const minHeight = 140;
    const computedHeight = Math.max(minHeight, 32 + tasksHeight + 10);

    return (
        <div 
            key={weekIndex} 
            className="flex-1 relative border-b border-slate-200 group w-full"
            style={{ minHeight: `${computedHeight}px` }}
        >
            {/* Background Grid Cells */}
            <div className="absolute inset-0 flex pointer-events-none h-full">
                {week.map((day, dayIndex) => {
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    
                    return (
                        <div key={dayIndex} className={`flex-1 border-r border-slate-100 p-2 ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}>
                            <span className={`text-sm font-medium 
                                ${isToday 
                                    ? 'flex size-6 items-center justify-center bg-primary text-white rounded-full shadow-sm shadow-primary/40' 
                                    : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                                }`}>
                                {day.getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Task Layer */}
            <div className="absolute inset-0 top-8 flex flex-col w-full px-0.5 pointer-events-none">
                {tasksInWeek.map(task => {
                    // Logic to render bar
                    const taskStart = task.startDate < weekStart ? weekStart : task.startDate;
                    const taskEnd = task.endDate > weekEnd ? weekEnd : task.endDate;

                    // Calculate position
                    const offsetDays = Math.floor((taskStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                    const durationDays = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                    // Safety clamping
                    const validOffset = Math.max(0, offsetDays);
                    const validDuration = Math.min(7 - validOffset, durationDays);

                    const left = `${(validOffset / 7) * 100}%`;
                    const width = `${(validDuration / 7) * 100}%`;
                    
                    const laneIndex = taskLaneMap.get(task.id) || 0;
                    const top = laneIndex * 32; // Stack vertically

                    const isOverdue = task.status === TaskStatus.Overdue;
                    const isCompleted = task.status === TaskStatus.Completed;

                    return (
                        <div
                            key={`${task.id}-${weekIndex}`}
                            className={`absolute h-7 rounded text-xs font-semibold flex items-center px-2 cursor-pointer pointer-events-auto hover:brightness-95 transition-all shadow-sm z-10 
                            ${isOverdue ? '' : 'border-l-4'} 
                            ${getTaskStyles(task)}`}
                            style={{
                                left: `calc(${left} + 4px)`,
                                width: `calc(${width} - 8px)`,
                                top: `${top}px`
                            }}
                        >
                            <div className="flex items-center gap-1.5 w-full overflow-hidden">
                                {isOverdue && <AlertCircle size={14} className="text-white shrink-0" />}
                                {isCompleted && <CheckCircle size={14} className="text-emerald-600 shrink-0" />}
                                
                                <div className="flex items-center gap-2 truncate">
                                    {task.assignees.length > 0 && !isOverdue && !isCompleted && (
                                        <div className="size-4 rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-primary shadow-sm border border-blue-100 shrink-0">
                                            {getUserInitials(task.assignees[0])}
                                        </div>
                                    )}
                                    <span className="truncate">{task.title}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-0">
       <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {weeks.map((week, i) => renderWeek(week, i))}
       </div>
    </div>
  );
};

export default CalendarGrid;
