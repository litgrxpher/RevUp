
"use client";

import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MOCK_TEMPLATES_DATA, Template } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { useAuth } from '@/components/auth-provider';

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`templates_${user.uid}`);
      const savedTemplates = saved ? JSON.parse(saved) : MOCK_TEMPLATES_DATA;
      setTemplates(Object.values(savedTemplates));
    }
  }, [user]);

  return (
    <div className="container mx-auto max-w-4xl p-4 pt-6 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Workout Templates</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/templates/generate">
                    <Bot className="mr-2 h-4 w-4" /> Create with AI
                </Link>
            </Button>
            <Button asChild>
                <Link href="/templates/edit/new">
                    <Plus className="mr-2 h-4 w-4" /> Create
                </Link>
            </Button>
        </div>
      </header>
      
      {templates.length === 0 ? (
        <div className="flex justify-center items-center h-full py-16">
          <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold font-headline">No Templates Yet</h2>
              <p className="text-muted-foreground mt-2 mb-6">Create your first workout template to get started.</p>
              <Button asChild>
                  <Link href="/templates/edit/new">
                      <Plus className="mr-2 h-4 w-4" /> Create New Template
                  </Link>
              </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {templates.map(template => (
            <Link href={`/templates/edit/${template.id}`} key={template.id} className="w-full">
                <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col w-full">
                <CardHeader className="pb-4">
                    <CardTitle className="font-headline text-xl">{template.name}</CardTitle>
                    <CardDescription>{template.exercises.length} exercises - {template.restTime}s rest</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2">
                    {template.assignedDays.map(day => (
                        <Badge key={day} variant="secondary">{day}</Badge>
                    ))}
                    </div>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      )}
    </div>
  );
}
