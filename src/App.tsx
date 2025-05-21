
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./components/ThemeProvider";

// Layouts
import MainLayout from "./components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import WorkoutsPage from "./pages/Workouts";
import NutritionPage from "./pages/Nutrition";
import ProgressPage from "./pages/Progress";
import LoginPage from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="workouts" element={<WorkoutsPage />} />
                  <Route path="nutrition" element={<NutritionPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                </Route>
              </Routes>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
