
"use client";

import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MOCK_TEMPLATES_DATA, Template } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

function CreateTemplateDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
      dialog.removeAttribute('data-state');
      dialog.setAttribute('aria-hidden', 'true');
    }
    router.push(path);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new template</DialogTitle>
          <DialogDescription>
            How would you like to start? You can create a template from scratch or use AI to generate one for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleNavigate('/templates/edit/new')}>
              <Plus className="h-6 w-6" />
              <span>Create Manually</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleNavigate('/templates/generate')}>
              <Bot className="h-6 w-6" />
              <span>Use AI</span>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
    <div className="container mx-auto max-w-5xl p-4 pt-6 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Workout Templates</h1>
        </div>
      </header>
      
      <div className="flex flex-col items-center md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
          <Link href={`/templates/edit/${template.id}`} key={template.id} className="w-full md:max-w-none">
              <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col w-full min-h-[180px]">
              <CardHeader className="pb-4 px-4 py-4 md:p-6">
                  <CardTitle className="font-headline text-xl">{template.name}</CardTitle>
                  <CardDescription>{template.exercises.length} exercises - {template.restTime}s rest</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow px-4 py-4 md:p-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                  {template.assignedDays.map(day => (
                      <Badge key={day} variant="secondary">{day}</Badge>
                  ))}
                  </div>
              </CardContent>
              </Card>
          </Link>
          ))}
           <CreateTemplateDialog>
              <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col w-full md:max-w-none items-center justify-center min-h-[180px] cursor-pointer border-dashed">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-semibold">Create New Template</p>
                  </div>
              </Card>
            </CreateTemplateDialog>
      </div>
    </div>
  );
}
