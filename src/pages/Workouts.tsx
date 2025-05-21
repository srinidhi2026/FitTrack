
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { ArrowRight, Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WorkoutDay } from '@/types/workout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WorkoutsPage = () => {
  const { workouts, isLoading } = useData();
  const [selectedExercise, setSelectedExercise] = React.useState<any>(null);
  
  const days: WorkoutDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const handleSelectExercise = (exercise: any) => {
    setSelectedExercise(exercise);
  };
  
  const closeExerciseDetails = () => {
    setSelectedExercise(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Weekly Workout Plan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your 6-day workout routine for maximum gains
        </p>
      </div>

      <Tabs defaultValue="monday" className="space-y-6">
        <TabsList className="grid grid-cols-7 max-w-5xl">
          {days.map((day) => (
            <TabsTrigger key={day} value={day} className="capitalize">
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {days.map((day) => {
          const dayWorkout = workouts.find(workout => workout.day === day);
          
          return (
            <TabsContent key={day} value={day} className="animate-slide-up">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {day.charAt(0).toUpperCase() + day.slice(1)} - {dayWorkout?.title || 'Rest Day'}
                  </CardTitle>
                  <CardDescription>
                    {dayWorkout?.description || 'Rest, recover, and prepare for your next workout.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dayWorkout?.exercises && dayWorkout.exercises.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-4">
                      {dayWorkout.exercises.map((exercise) => (
                        <AccordionItem key={exercise.id} value={exercise.id} className="border rounded-lg px-4">
                          <AccordionTrigger className="py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-2">
                              <div className="text-left">
                                <h3 className="font-medium">{exercise.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {exercise.sets} sets × {exercise.repsRange} reps
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectExercise(exercise);
                                }}
                                className="text-primary hover:text-primary/80 p-1 rounded"
                                aria-label="Exercise details"
                              >
                                <Info size={18} />
                              </button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <img 
                                  src={exercise.imageUrl} 
                                  alt={exercise.name} 
                                  className="max-h-full max-w-full object-contain rounded-lg"
                                />
                              </div>
                              <div>
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="font-medium text-sm">Target Muscle Group</h4>
                                    <p className="capitalize text-gray-600 dark:text-gray-300">
                                      {exercise.muscleGroup}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm">Instructions</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                      {exercise.instructions}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Rest day. Focus on recovery with light stretching or cardio if desired.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
      
      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={closeExerciseDetails}>
        {selectedExercise && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
              <DialogDescription>
                {selectedExercise.sets} sets × {selectedExercise.repsRange} reps • Target: <span className="capitalize">{selectedExercise.muscleGroup}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <img 
                  src={selectedExercise.imageUrl} 
                  alt={selectedExercise.name} 
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Instructions</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {selectedExercise.instructions}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default WorkoutsPage;
