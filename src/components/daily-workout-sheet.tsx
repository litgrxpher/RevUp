
"use client"

import { useState, useEffect, useRef, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Timer, Trash2, PlusCircle, ClipboardList, GripVertical, CheckCircle } from 'lucide-react';
import { type Unit } from '@/app/page';
import { type Template } from '@/lib/mock-data';
import { cn, convertToKgs, convertToLbs } from '@/lib/utils';
import { isPast, isToday as isTodayDate } from 'date-fns';

export interface Workout {
  name: string;
  sets: number;
  reps: number;
  weight: number; // Always stored in lbs
  lastWeight: number; // Always stored in lbs
  color: string;
  loggedSets: boolean[];
  restTime: number; // in seconds
}

interface DailyWorkoutSheetProps {
  workouts: Workout[];
  unit: Unit;
  onUpdate: (workouts: Workout[]) => void;
  onFinish: () => void;
  isToday: boolean;
  templates: Template[];
  onAddTemplate: (template: Template) => void;
  isFinished: boolean;
  selectedDate: Date;
}

function RestTimerDisplay({ duration, onSkip }: { duration: number, onSkip: () => void }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    onSkip(); // Or a new handler for when timer finishes
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [duration, onSkip]);
    
    const handleSkip = () => {
        if(intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        onSkip();
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex items-center justify-between text-sm w-full bg-muted/50 p-2 rounded-md">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4"/>
                <span>Resting...</span>
            </div>
            <span className="font-mono font-semibold text-lg">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
        </div>
    )
}

const WorkoutRow = ({
  exercise,
  exerciseIndex,
  unit,
  isSetLogged,
  handleLogSet,
  isToday,
  restingState,
  setRestingState,
  handleInputChange,
  removeSet,
  addSet,
  isFinished,
  isEditable
}: {
  exercise: Workout;
  exerciseIndex: number;
  unit: Unit;
  isSetLogged: (exIndex: number, setIndex: number) => boolean;
  handleLogSet: (exIndex: number, setIndex: number) => void;
  isToday: boolean;
  restingState: {exerciseIndex: number, setIndex: number} | null;
  setRestingState: (state: {exerciseIndex: number, setIndex: number} | null) => void;
  handleInputChange: (exerciseIndex: number, field: 'reps' | 'weight', value: string) => void;
  removeSet: (exIndex: number, setIndex: number) => void;
  addSet: (exIndex: number) => void;
  isFinished: boolean;
  isEditable: boolean;
}) => {
  const displayWeight = unit === 'kgs' ? convertToKgs(exercise.weight) : exercise.weight;
  const displayLastWeight = unit === 'kgs' ? convertToKgs(exercise.lastWeight) : exercise.lastWeight;
  const weightDiff = displayWeight - displayLastWeight;

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 p-4 border-b">
        <div className="flex items-center gap-3">
          <GripVertical className={cn("h-5 w-5 text-muted-foreground", isEditable && !isFinished ? "cursor-move" : "cursor-not-allowed")} />
          <span className={`w-2 h-10 rounded-full ${exercise.color}`}></span>
          <div>
            <CardTitle className="text-lg font-headline">{exercise.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{exercise.sets} sets x {exercise.reps} reps</p>
          </div>
        </div>
        <div className="text-right self-end md:self-center">
          <p className="text-lg font-bold">{displayWeight.toFixed(1)} {unit}</p>
          <p className={`text-xs ${weightDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weightDiff >= 0 ? '↑' : '↓'} {Math.abs(weightDiff).toFixed(1)} {unit} vs last
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {Array.from({ length: exercise.sets }).map((_, setIndex) => (
          <div key={setIndex}>
            {restingState?.exerciseIndex === exerciseIndex && restingState?.setIndex === setIndex && isToday ? (
              <RestTimerDisplay duration={exercise.restTime} onSkip={() => setRestingState(null)} />
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md overflow-x-auto">
                <span className="font-medium text-sm whitespace-nowrap">Set {setIndex + 1}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Input
                      type="number"
                      className="w-20 h-8 text-center"
                      defaultValue={exercise.reps}
                      onChange={(e) => handleInputChange(exerciseIndex, 'reps', e.target.value)}
                      aria-label="Reps"
                      disabled={isFinished || !isEditable}
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                  <Input
                      type="number"
                      className="w-24 h-8 text-center"
                      defaultValue={displayWeight.toFixed(1)}
                      onChange={(e) => handleInputChange(exerciseIndex, 'weight', e.target.value)}
                      aria-label="Weight"
                      disabled={isFinished || !isEditable}
                    />
                    <span className="text-sm text-muted-foreground">{unit}</span>
                  
                  {isSetLogged(exerciseIndex, setIndex) ? (
                     <div className="flex items-center justify-center gap-2 text-primary w-20 h-9">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Done</span>
                     </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleLogSet(exerciseIndex, setIndex)} disabled={!isToday}>
                        Log
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSet(exerciseIndex, setIndex)} disabled={isFinished || !isEditable}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
          <Button variant="ghost" className="w-full mt-2" onClick={() => addSet(exerciseIndex)} disabled={isFinished || !isEditable}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Set
        </Button>
      </CardContent>
    </Card>
  )
};


export function DailyWorkoutSheet({ workouts, unit, onUpdate, onFinish, isToday, templates, onAddTemplate, isFinished, selectedDate }: DailyWorkoutSheetProps) {
  const [editableWorkouts, setEditableWorkouts] = useState(workouts);
  const [restingState, setRestingState] = useState<{exerciseIndex: number, setIndex: number} | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditable = isTodayDate(selectedDate) || !isPast(selectedDate);

  useEffect(() => {
    setEditableWorkouts(workouts);
  }, [workouts]);
  
  const handleLogSet = (exerciseIndex: number, setIndex: number) => {
    if (!isToday) return;

    const newWorkouts = [...editableWorkouts];
    // We only set the timer if we are logging the set, not un-logging it.
    if (!newWorkouts[exerciseIndex].loggedSets[setIndex]) {
      setRestingState({ exerciseIndex, setIndex });
    }

    const loggedSets = [...newWorkouts[exerciseIndex].loggedSets];
    const isLogging = !loggedSets[setIndex];
    
    // Ensure the array is long enough
    while(loggedSets.length <= setIndex) {
      loggedSets.push(false);
    }
    
    loggedSets[setIndex] = isLogging;
    newWorkouts[exerciseIndex].loggedSets = loggedSets;
    onUpdate(newWorkouts);

  };
  
  const isSetLogged = (exerciseIndex: number, setIndex: number) => {
    return editableWorkouts[exerciseIndex]?.loggedSets?.[setIndex] || false;
  }

  const handleInputChange = (exerciseIndex: number, field: 'reps' | 'weight', value: string) => {
    const newWorkouts = [...editableWorkouts];
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (field === 'weight') {
        const weightInLbs = unit === 'kgs' ? convertToLbs(numValue) : numValue;
        newWorkouts[exerciseIndex] = { ...newWorkouts[exerciseIndex], weight: weightInLbs };
      } else {
        newWorkouts[exerciseIndex] = { ...newWorkouts[exerciseIndex], [field]: numValue };
      }
      onUpdate(newWorkouts);
    }
  }

  const addSet = (exerciseIndex: number) => {
    const newWorkouts = [...editableWorkouts];
    newWorkouts[exerciseIndex].sets += 1;
    newWorkouts[exerciseIndex].loggedSets.push(false);
    onUpdate(newWorkouts);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newWorkouts = [...editableWorkouts];
    if (newWorkouts[exerciseIndex].sets > 1) {
      newWorkouts[exerciseIndex].sets -= 1;
      newWorkouts[exerciseIndex].loggedSets.splice(setIndex, 1);
      onUpdate(newWorkouts);
    }
  };

  const onDragStart = (index: number) => {
    if (!isEditable || isFinished) return;
    setDraggedIndex(index);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newWorkouts = [...editableWorkouts];
    const draggedItem = newWorkouts[draggedIndex];
    newWorkouts.splice(draggedIndex, 1);
    newWorkouts.splice(index, 0, draggedItem);
    
    onUpdate(newWorkouts);
    setDraggedIndex(null);
  };
  
  const handleFinish = () => {
    setIsSaving(true);
    onFinish();
    setTimeout(() => {
        // The button will be removed from the DOM by the parent's `isFinished` prop
    }, 2000); // Show "Saved!" for 2 seconds
  }

  if (workouts.length === 0) {
    return (
      <Card className="text-center p-8 border-dashed">
        <CardHeader>
            <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground" />
            <CardTitle>No Workout Scheduled</CardTitle>
            <CardDescription>Choose a template to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {templates.map(template => (
                <Button key={template.id} variant="outline" className="w-full" onClick={() => onAddTemplate(template)} disabled={isFinished || !isEditable}>
                    Add {template.name}
                </Button>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {editableWorkouts.map((exercise, exerciseIndex) => (
        <div
          key={exerciseIndex}
          draggable={isEditable && !isFinished}
          onDragStart={() => onDragStart(exerciseIndex)}
          onDragOver={onDragOver}
          onDrop={() => onDrop(exerciseIndex)}
          onDragEnd={() => setDraggedIndex(null)}
          className={cn(draggedIndex === exerciseIndex && "opacity-50")}
        >
          <WorkoutRow 
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            unit={unit}
            isSetLogged={isSetLogged}
            handleLogSet={handleLogSet}
            isToday={isToday}
            restingState={restingState}
            setRestingState={setRestingState}
            handleInputChange={handleInputChange}
            removeSet={removeSet}
            addSet={addSet}
            isFinished={isFinished}
            isEditable={isEditable}
          />
        </div>
      ))}
      <Button variant="outline" className="w-full" disabled={isFinished || !isEditable}>
        <Plus className="mr-2 h-4 w-4" /> Add Exercise
      </Button>
       {isToday && !isFinished && (
         <Button className="w-full" size="lg" onClick={handleFinish} disabled={isSaving}>
            <CheckCircle className="mr-2 h-5 w-5" /> 
            {isSaving ? "Saved!" : "Finish Workout"}
        </Button>
       )}
    </div>
  );
}
