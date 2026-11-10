
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Workout from "./pages/Workout";
import WorkoutHistory from "./pages/WorkoutHistory";
import EditWorkout from "./pages/EditWorkout";
import BodyProgress from "./pages/BodyProgress";
import Calendar from "./pages/Calendar";
import Achievements from "./pages/Achievements";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutTemplates from "./pages/WorkoutTemplates";
import EditWorkoutTemplate from "./pages/EditWorkoutTemplate";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101713] flex items-center justify-center text-emerald-400">
        Loading GymTrack...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts/new" element={<Workout />} />
        <Route path="/workouts" element={<WorkoutHistory />} />
        <Route path="/workouts/edit/:id" element={<EditWorkout />} />
        <Route path="/body-progress" element={<BodyProgress />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/workout-templates" element={<WorkoutTemplates />} />

        <Route
          path="/workout-templates/:id/edit"
          element={<EditWorkoutTemplate />}
        />

        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
