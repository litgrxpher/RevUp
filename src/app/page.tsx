
"use client";

import { addDays, format, isPast, isSameDay, startOfWeek, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { DailyWorkoutSheet, Workout } from '@/components/daily-workout-sheet';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MOCK_WORKOUTS_DATA_INITIAL, MOCK_TEMPLATES_DATA, MOCK_COMPLETED_DATES_INITIAL, Template } from '@/lib/mock-data';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

function HorizontalCalendar({ selectedDate, onDateSelect, workouts, completedDates }: { selectedDate: Date, onDateSelect: (date: Date) => void, workouts: { [key:string]: any }, completedDates: Date[] }) {
  const isMobile = useIsMobile();
  const daysToShow = isMobile ? 5 : 7;
  const [currentDate, setCurrentDate] = useState(subDays(selectedDate, Math.floor(daysToShow / 2)));

  const handlePrevDays = () => {
    setCurrentDate(subDays(currentDate, daysToShow));
  };

  const handleNextDays = () => {
    setCurrentDate(addDays(currentDate, daysToShow));
  };
  
  const days = Array.from({ length: daysToShow }).map((_, i) => addDays(currentDate, i));

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={handlePrevDays} className="h-24 w-12 shrink-0">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="flex-1 overflow-x-auto whitespace-nowrap" style={{'scrollbarWidth': 'none', 'msOverflowStyle': 'none'}}>
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex justify-around space-x-2 p-1 scrollbar-hide">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasWorkout = workouts[dateKey] && workouts[dateKey].length > 0;
            const isCompleted = completedDates.some(d => isSameDay(d, day));
            const isSelected = isSameDay(selectedDate, day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button key={day.toISOString()} 
                onClick={() => onDateSelect(day)}
                className={cn(
                  'flex flex-col flex-shrink-0 items-center justify-center p-3 rounded-xl w-16 h-24 transition-colors',
                  isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50',
                  isToday && !isSelected && 'text-accent'
                )}>
                <span className="text-sm uppercase">{format(day, 'E')}</span>
                <span className="text-2xl font-bold">{format(day, 'd')}</span>
                {hasWorkout && <div className={`w-2 h-2 rounded-full mt-1.5 ${isCompleted ? 'bg-accent' : 'bg-muted-foreground'}`}></div>}
              </button>
            );
          })}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={handleNextDays} className="h-24 w-12 shrink-0">
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}

export type Unit = 'lbs' | 'kgs';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [unit, setUnit] = useState<Unit>(() => {
    if (typeof window !== 'undefined' && user) {
      const savedUnit = localStorage.getItem(`unit_${user.uid}`) as Unit;
      if (savedUnit && ['lbs', 'kgs'].includes(savedUnit)) {
        return savedUnit;
      }
    }
    return 'kgs'; // Default to kgs
  });

  const [workouts, setWorkouts] = useState(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`workouts_${user.uid}`);
      return saved ? JSON.parse(saved) : MOCK_WORKOUTS_DATA_INITIAL;
    }
    return MOCK_WORKOUTS_DATA_INITIAL;
  });

  const [templates, setTemplates] = useState(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`templates_${user.uid}`);
      return saved ? JSON.parse(saved) : MOCK_TEMPLATES_DATA;
    }
    return MOCK_TEMPLATES_DATA;
  });

  const [completedDates, setCompletedDates] = useState(MOCK_COMPLETED_DATES_INITIAL);
  const { toast } = useToast();

  const [finishedWorkouts, setFinishedWorkouts] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`finishedWorkouts_${user.uid}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (user) {
      const savedTemplates = localStorage.getItem(`templates_${user.uid}`);
      if (!savedTemplates || Object.keys(JSON.parse(savedTemplates)).length === 0) {
        router.push('/templates');
      }
    }
  }, [user, router]);


  useEffect(() => {
    if (user) {
      localStorage.setItem(`finishedWorkouts_${user.uid}`, JSON.stringify(finishedWorkouts));
    }
  }, [finishedWorkouts, user]);

  const saveWorkouts = (newWorkouts: any) => {
    setWorkouts(newWorkouts);
    if (user) {
      localStorage.setItem(`workouts_${user.uid}`, JSON.stringify(newWorkouts));
      const newCompletedDates = Object.entries(newWorkouts)
        .filter(([date, WOs]) => (WOs as Workout[]).length > 0 && (WOs as Workout[]).every(wo => wo.loggedSets.length > 0 && wo.loggedSets.every(s => s)))
        .map(([date]) => new Date(date));
      setCompletedDates(newCompletedDates);
    }
  }

  useEffect(() => {
    if (user) {
      localStorage.setItem(`templates_${user.uid}`, JSON.stringify(templates));
    }
  }, [templates, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`unit_${user.uid}`, unit);
    }
  }, [unit, user]);

  const toggleUnit = () => {
    const newUnit = unit === 'lbs' ? 'kgs' : 'lbs';
    setUnit(newUnit);
  };
  
  const handleWorkoutUpdate = (updatedWorkouts: Workout[]) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newWorkouts = {
      ...workouts,
      [dateKey]: updatedWorkouts
    };
    saveWorkouts(newWorkouts);
  };
  
  const handleFinishWorkout = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const currentWorkouts = workouts[dateKey] || [];
    const newWorkouts = {
      ...workouts,
      [dateKey]: currentWorkouts
    };
    saveWorkouts(newWorkouts);
    setFinishedWorkouts(prev => [...prev, dateKey]);
    toast({
        title: "Workout Saved!",
        description: `Your progress for ${format(selectedDate, "MMMM d")} has been saved.`,
    });
  };

  const handleAddTemplate = (template: Template) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    const allPastWorkoutDates = Object.keys(workouts)
      .map(dateStr => new Date(dateStr))
      .filter(date => date < selectedDate)
      .sort((a, b) => b.getTime() - a.getTime());

    const newWorkouts: Workout[] = template.exercises.map(ex => {
      let lastWeight = 0;
      for (const date of allPastWorkoutDates) {
        const pastDateKey = format(date, 'yyyy-MM-dd');
        const workoutForDate = workouts[pastDateKey]?.find(w => w.name === ex.name);
        if (workoutForDate) {
          const latestLog = workoutForDate.loggedSets.length > 0;
          if (latestLog) {
            lastWeight = workoutForDate.weight; 
            break; 
          }
        }
      }
      
      return {
        name: ex.name,
        sets: 3,
        reps: 8,
        weight: lastWeight,
        lastWeight: lastWeight,
        color: 'bg-gray-500',
        loggedSets: [],
        restTime: template.restTime,
      };
    });
    const updatedWorkouts = {
      ...workouts,
      [dateKey]: newWorkouts,
    }
    saveWorkouts(updatedWorkouts);
  };
  
  const selectedDayWorkouts = workouts[format(selectedDate, 'yyyy-MM-dd')] || [];
  const isWorkoutFinishedForSelectedDate = finishedWorkouts.includes(format(selectedDate, 'yyyy-MM-dd'));
  const isToday = isSameDay(selectedDate, new Date());
  const isEditable = isToday && !isWorkoutFinishedForSelectedDate;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="container mx-auto max-w-4xl p-4 pt-6 md:p-6 w-full">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <Logo />
            <h1 className="text-2xl md:text-3xl font-bold font-headline">RevUp</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center space-x-2">
                <Label htmlFor="unit-toggle" className="text-sm cursor-pointer w-12 text-right">
                  {unit.toUpperCase()}
                </Label>
                <Switch id="unit-toggle" checked={unit === 'kgs'} onCheckedChange={toggleUnit} />
              </div>
            <ThemeToggle />
          </div>
        </header>
        
        <section className="mb-6 -mx-4 md:-mx-6 bg-card/50">
          <HorizontalCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} workouts={workouts} completedDates={completedDates} />
        </section>

        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-headline">{format(selectedDate, "eeee, MMMM d")}</h2>
              <p className="text-muted-foreground">
                {selectedDayWorkouts.length > 0 ? "Today's Focus: Push Day" : "No workout scheduled"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="warmup-toggle" className={cn("flex items-center gap-2 text-sm", !isEditable && "cursor-not-allowed opacity-50")}>
                <Flame className="h-4 w-4 text-accent" /> Warm-up
              </Label>
              <Switch id="warmup-toggle" disabled={!isEditable} />
            </div>
          </div>

          <DailyWorkoutSheet 
            workouts={selectedDayWorkouts} 
            unit={unit} 
            onUpdate={handleWorkoutUpdate}
            onFinish={handleFinishWorkout}
            isToday={isToday}
            templates={Object.values(templates)}
            onAddTemplate={handleAddTemplate}
            isFinished={isWorkoutFinishedForSelectedDate}
            selectedDate={selectedDate}
            />
        </section>
      </div>
    </div>
  );
}
