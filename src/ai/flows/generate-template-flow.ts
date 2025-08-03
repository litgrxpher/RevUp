
'use server';
/**
 * @fileOverview An AI flow for generating workout templates.
 * 
 * - generateTemplate - A function that handles the workout template generation process.
 * - GenerateTemplateInput - The input type for the generateTemplate function.
 * - GenerateTemplateOutput - The return type for the generateTemplate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateTemplateInputSchema = z.object({
    focus: z.string().describe("The primary focus of the workout, e.g., 'Upper Body Strength', 'Leg Day', 'Full Body HIIT'"),
    level: z.enum(['beginner', 'intermediate', 'advanced']).describe('The user\'s experience level.'),
    goal: z.enum(['bulking', 'cutting', 'maintenance']).describe('The user\'s primary fitness goal.'),
    notes: z.string().optional().describe('Any additional notes or constraints, like specific exercises to include/avoid or available equipment.'),
});
export type GenerateTemplateInput = z.infer<typeof GenerateTemplateInputSchema>;

const GenerateTemplateOutputSchema = z.object({
  name: z.string().describe("A concise, descriptive name for the generated workout template. Max 3-4 words."),
  exercises: z.array(z.object({
    name: z.string().describe("The name of the exercise."),
    // sets: z.number().int().positive().describe("The recommended number of sets for this exercise."),
    // reps: z.number().int().positive().describe("The recommended number of repetitions per set."),
  })).describe("A list of 3 to 6 exercises for the workout template."),
  restTime: z.number().int().positive().describe("Recommended rest time in seconds between sets. Common values are 60, 90, 120, or 180."),
});
export type GenerateTemplateOutput = z.infer<typeof GenerateTemplateOutputSchema>;


export async function generateTemplate(input: GenerateTemplateInput): Promise<GenerateTemplateOutput> {
  return generateTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTemplatePrompt',
  input: { schema: GenerateTemplateInputSchema },
  output: { schema: GenerateTemplateOutputSchema },
  prompt: `You are a world-class personal trainer and fitness expert. Your task is to create a structured workout template based on the user's specifications.

  User Specifications:
  - Workout Focus: {{{focus}}}
  - Experience Level: {{{level}}}
  - Primary Goal: {{{goal}}}
  {{#if notes}}
  - Additional Notes: {{{notes}}}
  {{/if}}

  Instructions:
  1.  Generate a workout template with a clear, concise name (e.g., "Advanced Upper Body Strength").
  2.  Provide a list of 3 to 6 relevant exercises that align with the user's focus, level, and goal.
  3.  Recommend an appropriate rest time in seconds between sets (e.g., 60 for shorter rests, 120-180 for heavy compound lifts).
  4.  The output MUST strictly follow the provided JSON schema. Do not include sets or reps in the output, only the exercise name.
  5.  You must provide between 3 and 6 exercises in the 'exercises' array.
`,
});

const generateTemplateFlow = ai.defineFlow(
  {
    name: 'generateTemplateFlow',
    inputSchema: GenerateTemplateInputSchema,
    outputSchema: GenerateTemplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid output.");
    }
    return output;
  }
);
