
export const MOCK_WORKOUTS_DATA_INITIAL = {
  [format(addDays(new Date(), -2), 'yyyy-MM-dd')]: [
    { name: 'Bench Press', sets: 3, reps: 8, weight: 130, lastWeight: 125, color: 'bg-red-500', loggedSets: [true, true, true], restTime: 90 },
    { name: 'Squat', sets: 4, reps: 5, weight: 180, lastWeight: 175, color: 'bg-blue-500', loggedSets: [true, true, true, false], restTime: 120 },
  ],
  [format(new Date(), 'yyyy-MM-dd')]: [
    { name: 'Bench Press', sets: 3, reps: 8, weight: 135, lastWeight: 130, color: 'bg-red-500', loggedSets: [], restTime: 90 },
    { name: 'Squat', sets: 4, reps: 5, weight: 185, lastWeight: 180, color: 'bg-blue-500', loggedSets: [], restTime: 120 },
    { name: 'Deadlift', sets: 1, reps: 5, weight: 225, lastWeight: 220, color: 'bg-green-500', loggedSets: [], restTime: 180 },
    { name: 'Overhead Press', sets: 3, reps: 8, weight: 85, lastWeight: 80, color: 'bg-yellow-500', loggedSets: [], restTime: 90 },
  ],
  [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: [
    { name: 'Pull Day Special', sets: 3, reps: 8, weight: 80, lastWeight: 75, color: 'bg-purple-500', loggedSets: [], restTime: 90 },
  ],
};

import { addDays, format } from 'date-fns';

export interface Template {
  id: string;
  name: string;
  exercises: { name: string }[];
  assignedDays: string[];
  restTime: number;
}

export const MOCK_TEMPLATES_DATA: { [key: string]: Template } = {
  '1': { id: '1', name: 'Push Day', exercises: [{name: 'Bench Press'}, {name: 'Overhead Press'}, {name: 'Tricep Pushdown'}], assignedDays: ['Mon', 'Thu'], restTime: 90 },
  '2': { id: '2', name: 'Pull Day', exercises: [{name: 'Pull Ups'}, {name: 'Rows'}, {name: 'Bicep Curls'}, {name: 'Face Pulls'}], assignedDays: ['Tue', 'Fri'], restTime: 120 },
  '3': { id: '3', name: 'Leg Day', exercises: [{name: 'Squat'}, {name: 'Deadlift'}, {name: 'Leg Press'}, {name: 'Calf Raises'}, {name: 'Leg Curls'}], assignedDays: ['Wed', 'Sat'], restTime: 180 },
};

export const MOCK_COMPLETED_DATES_INITIAL = [
  addDays(new Date(), -2),
  addDays(new Date(), -3),
];
