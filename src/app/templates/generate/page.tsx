
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import { generateTemplate } from '@/ai/flows/generate-template-flow';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Template } from '@/lib/mock-data';

const formSchema = z.object({
  focus: z.string().min(3, { message: "Please describe the focus of your workout (e.g., 'Upper Body Strength', 'Leg Day')." }),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.enum(['bulking', 'cutting', 'maintenance']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function GenerateTemplatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focus: '',
      level: 'intermediate',
      goal: 'maintenance',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'You must be logged in to generate a template.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const generatedTemplate = await generateTemplate(data);
      
      const newTemplate: Template = {
        ...generatedTemplate,
        id: new Date().getTime().toString(),
        assignedDays: [], // User can assign these in the editor
      };
      
      const savedTemplatesRaw = localStorage.getItem(`templates_${user.uid}`);
      const savedTemplates = savedTemplatesRaw ? JSON.parse(savedTemplatesRaw) : {};
      const newTemplates = { ...savedTemplates, [newTemplate.id]: newTemplate };
      localStorage.setItem(`templates_${user.uid}`, JSON.stringify(newTemplates));
      
      router.push(`/templates/edit/${newTemplate.id}`);
      
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating your workout template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 pt-6 md:p-6">
       <header className="flex items-center mb-6 gap-2">
         <Button variant="ghost" size="icon" onClick={() => router.back()}>
           <ArrowLeft />
         </Button>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Generate with AI</h1>
       </header>
       <Card>
        <CardHeader>
          <CardTitle>Create Your Workout Template</CardTitle>
          <CardDescription>Describe your ideal workout, and our AI will craft a personalized template for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Focus</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Upper Body Strength, Full Body HIIT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bulking">Bulking (Build Muscle)</SelectItem>
                          <SelectItem value="cutting">Cutting (Lose Fat)</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any specific exercises to include or avoid, equipment available, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Generating...' : 'Generate Template'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
