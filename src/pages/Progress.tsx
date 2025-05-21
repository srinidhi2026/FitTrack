
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { Calendar, Weight, Clock, Utensils, Ruler } from 'lucide-react';
import { format } from 'date-fns';

const ProgressPage = () => {
  const { user } = useAuth();
  const { progressEntries, addProgressEntry } = useData();
  
  // Form state
  const [weight, setWeight] = useState('');
  const [sleep, setSleep] = useState('');
  const [protein, setProtein] = useState('');
  const [arms, setArms] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [legs, setLegs] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = {
      weight: parseFloat(weight),
      sleepHours: parseFloat(sleep),
      proteinConsumed: parseFloat(protein),
      measurements: {
        arms: arms ? parseFloat(arms) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        legs: legs ? parseFloat(legs) : undefined,
      },
      workoutCompleted: true
    };
    
    addProgressEntry(entry);
    
    // Reset form
    setWeight('');
    setSleep('');
    setProtein('');
    setArms('');
    setChest('');
    setWaist('');
    setLegs('');
  };
  
  // Prepare chart data with proper date formatting
  const weightChartData = progressEntries.map(entry => ({
    date: format(new Date(entry.date), 'dd/MM/yy'),
    weight: entry.weight
  }));
  
  const measurementsData = progressEntries
    .filter(entry => entry.measurements)
    .map(entry => ({
      date: format(new Date(entry.date), 'dd/MM/yy'),
      arms: entry.measurements?.arms,
      chest: entry.measurements?.chest,
      waist: entry.measurements?.waist,
      legs: entry.measurements?.legs,
    }));
  
  const workoutCompletionData = progressEntries
    .slice(-7) // Last 7 entries
    .map(entry => ({
      date: format(new Date(entry.date), 'dd/MM/yy'),
      completed: entry.workoutCompleted ? 1 : 0
    }));
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Progress Tracking
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your fitness journey and visualize your progress
        </p>
      </div>
      
      {/* Data Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Today's Progress</CardTitle>
          <CardDescription>
            Record your daily stats to track your progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center">
                  <Weight className="h-4 w-4 mr-1" /> Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g. 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sleep" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Sleep Hours
                </Label>
                <Input
                  id="sleep"
                  type="number"
                  placeholder="e.g. 8"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protein" className="flex items-center">
                  <Utensils className="h-4 w-4 mr-1" /> Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="e.g. 150"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Ruler className="h-4 w-4 mr-1" /> Body Measurements (cm) - Optional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="arms">Arms</Label>
                  <Input
                    id="arms"
                    type="number"
                    placeholder="e.g. 35"
                    value={arms}
                    onChange={(e) => setArms(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="chest">Chest</Label>
                  <Input
                    id="chest"
                    type="number"
                    placeholder="e.g. 100"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="waist">Waist</Label>
                  <Input
                    id="waist"
                    type="number"
                    placeholder="e.g. 80"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="legs">Legs</Label>
                  <Input
                    id="legs"
                    type="number"
                    placeholder="e.g. 60"
                    value={legs}
                    onChange={(e) => setLegs(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Log Today's Progress</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Tracking */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Weight Tracking</CardTitle>
            <CardDescription>
              Track changes in your weight over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name="Weight (kg)"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Log your weight to see the chart here</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Measurements */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Body Measurements</CardTitle>
            <CardDescription>
              Track changes in your body measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {measurementsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurementsData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="arms" 
                    name="Arms (cm)"
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="chest" 
                    name="Chest (cm)"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="waist" 
                    name="Waist (cm)"
                    stroke="#F43F5E" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="legs" 
                    name="Legs (cm)"
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Log your measurements to see the chart here</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Workout Completion */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Workout Completion</CardTitle>
            <CardDescription>
              Track your weekly workout consistency
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {workoutCompletionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutCompletionData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis ticks={[0, 1]} domain={[0, 1]} />
                  <Tooltip formatter={(value) => value === 1 ? 'Completed' : 'Missed'} />
                  <Legend />
                  <Bar 
                    dataKey="completed" 
                    name="Workout Status" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Log your workouts to see the chart here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
