
"use client";

import { useState, useEffect, DragEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, GripVertical, Timer, Trash2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MOCK_TEMPLATES_DATA, Template } from '@/lib/mock-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth-provider';

const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const templateId = params.id as string;
  const isNew = templateId === 'new';

  const [templates, setTemplates] = useState(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`templates_${user.uid}`);
      return saved ? JSON.parse(saved) : MOCK_TEMPLATES_DATA;
    }
    return MOCK_TEMPLATES_DATA;
  });
  
  const [template, setTemplate] = useState<Template>(() => {
    if (isNew) {
      return { id: new Date().getTime().toString(), name: '', exercises: [{name: ''}], assignedDays: [], restTime: 60 };
    }
    return templates[templateId] || { id: 'not-found', name: 'Not Found', exercises: [], assignedDays: [], restTime: 60 };
  });
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleExerciseChange = (index, value) => {
    const newExercises = [...template.exercises];
    newExercises[index].name = value;
    setTemplate({ ...template, exercises: newExercises });
  };
  
  const addExercise = () => {
    setTemplate(prev => ({ ...prev, exercises: [...prev.exercises, {name: ''}] }));
  };
  
  const removeExercise = (index) => {
    const newExercises = template.exercises.filter((_, i) => i !== index);
    setTemplate({ ...template, exercises: newExercises });
  };

  const toggleDay = (day: string) => {
    const assignedDays = template.assignedDays.includes(day)
      ? template.assignedDays.filter(d => d !== day)
      : [...template.assignedDays, day];
    setTemplate({ ...template, assignedDays });
  };
  
  const handleRestTimeChange = (e) => {
    const time = parseInt(e.target.value, 10);
    setTemplate({ ...template, restTime: isNaN(time) ? 0 : time });
  };

  const handleSave = () => {
    if (user) {
      const newTemplates = { ...templates, [template.id]: template };
      localStorage.setItem(`templates_${user.uid}`, JSON.stringify(newTemplates));
      router.push('/templates');
    }
  };

  const handleDelete = () => {
    if (user) {
      const newTemplates = { ...templates };
      delete newTemplates[templateId];
      localStorage.setItem(`templates_${user.uid}`, JSON.stringify(newTemplates));
      router.push('/templates');
    }
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newExercises = [...template.exercises];
    const draggedItem = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedItem);
    
    setTemplate({...template, exercises: newExercises});
    setDraggedIndex(null);
  };

  useEffect(() => {
    if(user){
      const saved = localStorage.getItem(`templates_${user.uid}`);
      const savedTemplates = saved ? JSON.parse(saved) : MOCK_TEMPLATES_DATA;
      setTemplates(savedTemplates);
      if(!isNew && savedTemplates[templateId]){
        setTemplate(savedTemplates[templateId]);
      }
    }
  }, [user, isNew, templateId]);


  if (!isNew && !templates[templateId]) {
      return <div className="p-4 text-center">Template not found.</div>
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 pt-6 md:p-6">
      <header className="flex justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger className="md:hidden" />
          <Button variant="ghost" size="icon" onClick={() => router.push('/templates')}>
            <ArrowLeft />
          </Button>
          <Input 
            className="text-2xl md:text-3xl font-bold font-headline h-auto p-0 border-none bg-transparent flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            placeholder="Template Name"
          />
        </div>
        {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    template.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        )}
      </header>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assigned Days</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {ALL_DAYS.map(day => (
                    <Button 
                        key={day}
                        variant={template.assignedDays.includes(day) ? 'default': 'outline'}
                        onClick={() => toggleDay(day)}
                    >
                        {day}
                    </Button>
                ))}
            </CardContent>
          </Card>
          
          <Card className="mb-6">
              <CardHeader>
                  <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="rest-time" className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        Rest Time
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="rest-time"
                            type="number"
                            value={template.restTime}
                            onChange={handleRestTimeChange}
                            className="w-24"
                            placeholder="e.g. 90"
                        />
                        <span>seconds</span>
                    </div>
                  </div>
              </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.exercises.map((exercise, index) => (
              <div 
                  key={index} 
                  className={cn("flex items-center gap-2 p-2 rounded-md", draggedIndex === index && "bg-muted opacity-50")}
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(index)}
                  onDragEnd={() => setDraggedIndex(null)}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <Input
                  value={exercise.name}
                  onChange={(e) => handleExerciseChange(index, e.target.value)}
                  placeholder="Exercise Name"
                />
                <Button variant="ghost" size="icon" onClick={() => removeExercise(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addExercise}>
              <Plus className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/templates')}>Cancel</Button>
        <Button onClick={handleSave}>Save Template</Button>
      </div>
    </div>
  );
}
