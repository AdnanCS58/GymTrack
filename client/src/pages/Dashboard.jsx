
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Target,
  Trophy,
  Weight,
  Clock3,
  Plus,
  RefreshCw,
  Ruler,
  ClipboardList,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";
import { getWorkoutAnalytics } from "../services/analyticsService";
import api from "../services/api";

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="gt-card">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[var(--gt-text-secondary)]">
          {title}
        </p>

        <h3 className="mt-4 text-3xl font-bold tracking-tight text-[var(--gt-text-primary)]">
          {value}
        </h3>

        <p className="mt-2 text-xs text-[var(--gt-text-muted)]">
          {subtitle}
        </p>
      </div>

      <div className="rounded-xl bg-[var(--gt-primary-light)] p-3 text-[var(--gt-primary)]">
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const calculateWorkoutVolume = (workout) =>
  (workout.exercises || []).reduce((total, exercise) => {
    return (
      total +
      (exercise.sets || []).reduce((sum, set) => {
        return sum + Number(set.reps) * Number(set.weight);
      }, 0)
    );
  }, 0);

const ChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs text-[var(--gt-text-muted)]">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-sm font-semibold text-[var(--gt-text-primary)]"
        >
          {item.name}: {item.value.toLocaleString()} {unit}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")[0] || "Member";

  // Profile picture URL
  const profileImageUrl = user?.profilePicture
    ? `http://localhost:5000${user.profilePicture}`
    : null;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsResponse, workoutsResponse] = await Promise.all([
        getWorkoutAnalytics(),
        api.get("/workouts"),
      ]);

      setAnalytics(analyticsResponse);

      setRecentWorkouts(
        workoutsResponse.data.workouts.slice(0, 5)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const overview = analytics?.overview;

  const weeklyData = (analytics?.weeklyActivity || []).map((item) => ({
    ...item,
    day: new Date(`${item.date}T00:00:00`).toLocaleDateString(
      "en-US",
      { weekday: "short" }
    ),
  }));

  const volumeData = (analytics?.volumeTrend || []).map((item) => ({
    ...item,
    day: new Date(`${item.date}T00:00:00`).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    ),
  }));

  const currentDate = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const muscleDistribution = analytics?.muscleDistribution || [];

  const maxVolume = Math.max(
    ...muscleDistribution.map((item) => item.volume),
    1
  );

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      name: "Workouts",
      path: "/workouts",
      icon: Dumbbell,
    },
    {
      name: "Body Progress",
      path: "/body-progress",
      icon: Ruler,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarDays,
    },
    {
      name: "Achievements",
      path: "/achievements",
      icon: Trophy,
    },
    {
      name: "Exercise Library",
      path: "/exercises",
      icon: ClipboardList,
    },
    {
      name: "Workout Templates",
      path: "/workout-templates",
      icon: ClipboardList,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  // Reusable profile avatar
  const ProfileAvatar = ({ size = "h-9 w-9" }) => (
    profileImageUrl ? (
      <img
        src={profileImageUrl}
        alt="Profile"
        className={`${size} rounded-full border border-[var(--gt-border)] object-cover`}
      />
    ) : (
      <div
        className={`flex ${size} items-center justify-center rounded-full bg-[var(--gt-primary-light)] font-semibold text-[var(--gt-primary)]`}
      >
        {firstName.charAt(0).toUpperCase()}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-[var(--gt-background)] text-[var(--gt-text-primary)]">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-[var(--gt-border)] bg-[var(--gt-surface)] px-5 py-6 md:flex">

        {/* Brand */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="rounded-xl bg-[var(--gt-primary)] p-2.5 text-white">
            <Dumbbell size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              GymTrack
            </h1>

            <p className="text-xs text-[var(--gt-text-muted)]">
              Fitness Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--gt-text-muted)]">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  item.active
                    ? "bg-[var(--gt-primary-light)] font-semibold text-[var(--gt-primary)]"
                    : "text-[var(--gt-text-secondary)] hover:bg-[var(--gt-background)] hover:text-[var(--gt-text-primary)]"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div className="mt-auto">

          <div className="mb-5 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-background)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--gt-primary)]">
              <Target size={18} />
              <span className="text-sm font-semibold">
                Stay Consistent
              </span>
            </div>

            <p className="text-xs leading-5 text-[var(--gt-text-secondary)]">
              Every workout brings you closer to your fitness goals.
            </p>
          </div>

          {/* Clickable Sidebar Profile */}
          <Link
            to="/profile"
            className="mb-3 flex items-center gap-3 rounded-xl border border-[var(--gt-border)] p-3 transition hover:bg-[var(--gt-background)]"
          >
            <ProfileAvatar />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name}
              </p>

              <p className="text-xs text-[var(--gt-text-muted)]">
                View profile settings
              </p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[var(--gt-danger)] transition hover:bg-red-500/5"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen md:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--gt-border)] bg-[var(--gt-surface)]/90 px-5 py-4 backdrop-blur-xl md:px-8">

          <div>
            <h2 className="text-lg font-semibold">
              Dashboard
            </h2>

            <p className="text-xs text-[var(--gt-text-muted)]">
              Your fitness overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Clickable Header Profile */}
            <Link
              to="/profile"
              className="hidden items-center gap-3 border-l border-[var(--gt-border)] pl-4 transition-opacity hover:opacity-75 sm:flex"
            >
              <ProfileAvatar />

              <div>
                <p className="text-sm font-semibold">
                  {user?.name}
                </p>

                <p className="text-xs text-[var(--gt-text-muted)]">
                  View profile settings
                </p>
              </div>
            </Link>
          </div>
        </header>

        <div className="gt-page">
          <div className="gt-container space-y-8">

            {/* Welcome Section */}
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h1 className="gt-page-title">
                  Welcome back, {firstName}
                </h1>

                <p className="gt-description mt-2">
                  Here's an overview of your fitness performance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] px-4 py-3 text-sm text-[var(--gt-text-secondary)]">
                  <CalendarDays
                    size={17}
                    className="text-[var(--gt-primary)]"
                  />
                  {currentDate}
                </div>

                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-surface)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--gt-background)] disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <Link
                  to="/workouts/new"
                  className="gt-button-primary"
                >
                  <Plus size={17} />
                  Log Workout
                </Link>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-[var(--gt-danger)] sm:flex-row sm:items-center sm:justify-between">
                <p>{error}</p>

                <button
                  onClick={fetchDashboardData}
                  className="font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Statistics */}
            <section>
              <div className="mb-4">
                <h2 className="gt-section-title">
                  Performance Overview
                </h2>

                <p className="gt-description mt-1">
                  Your overall training statistics.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Workouts"
                  value={loading ? "..." : (overview?.totalWorkouts ?? 0)}
                  subtitle="All-time workout sessions"
                  icon={Dumbbell}
                />

                <StatCard
                  title="This Week"
                  value={loading ? "..." : (overview?.workoutsThisWeek ?? 0)}
                  subtitle="Workout sessions"
                  icon={Activity}
                />

                <StatCard
                  title="Exercises Logged"
                  value={loading ? "..." : (overview?.totalExercises ?? 0)}
                  subtitle="All-time exercise entries"
                  icon={Target}
                />

                <StatCard
                  title="Total Volume"
                  value={
                    loading
                      ? "..."
                      : `${(overview?.totalVolume ?? 0).toLocaleString()} kg`
                  }
                  subtitle="All-time training volume"
                  icon={Weight}
                />
              </div>
            </section>

            {/* Additional Statistics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                title="Average Duration"
                value={
                  loading ? "..." : `${overview?.averageDuration ?? 0} min`
                }
                subtitle="Average time per workout"
                icon={Clock3}
              />

              <StatCard
                title="Weekly Workouts"
                value={loading ? "..." : (overview?.workoutsThisWeek ?? 0)}
                subtitle="Sessions since Monday"
                icon={CalendarDays}
              />
            </section>

            {/* Charts */}
            <section>
              <div className="mb-4">
                <h2 className="gt-section-title">
                  Training Analytics
                </h2>

                <p className="gt-description mt-1">
                  Understand your workout frequency and training volume.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                {/* Weekly Activity */}
                <div className="gt-card">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Weekly Activity
                      </h3>

                      <p className="gt-description mt-1">
                        Workout frequency over the last 7 days.
                      </p>
                    </div>

                    <div className="rounded-lg bg-[var(--gt-primary-light)] p-2 text-[var(--gt-primary)]">
                      <Activity size={19} />
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex h-64 items-center justify-center text-sm text-[var(--gt-text-muted)]">
                      Loading activity...
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient
                              id="workoutGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#176b52"
                                stopOpacity={0.22}
                              />
                              <stop
                                offset="95%"
                                stopColor="#176b52"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="var(--gt-border)"
                            strokeDasharray="4 4"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            tick={{
                              fill: "var(--gt-text-muted)",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fill: "var(--gt-text-muted)",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip content={<ChartTooltip />} />

                          <Area
                            type="monotone"
                            dataKey="workouts"
                            name="Workouts"
                            stroke="#176b52"
                            strokeWidth={2.5}
                            fill="url(#workoutGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Training Volume */}
                <div className="gt-card">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Training Volume
                      </h3>

                      <p className="gt-description mt-1">
                        Daily lifted weight over the last 30 days.
                      </p>
                    </div>

                    <div className="rounded-lg bg-[var(--gt-primary-light)] p-2 text-[var(--gt-primary)]">
                      <BarChart3 size={19} />
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex h-64 items-center justify-center text-sm text-[var(--gt-text-muted)]">
                      Loading volume...
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volumeData}>
                          <CartesianGrid
                            stroke="var(--gt-border)"
                            strokeDasharray="4 4"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            interval={4}
                            tick={{
                              fill: "var(--gt-text-muted)",
                              fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{
                              fill: "var(--gt-text-muted)",
                              fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip content={<ChartTooltip unit="kg" />} />

                          <Bar
                            dataKey="volume"
                            name="Volume"
                            fill="#176b52"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Muscle Distribution */}
            <section className="gt-card">
              <div className="mb-7">
                <h2 className="gt-section-title">
                  Muscle Group Distribution
                </h2>

                <p className="gt-description mt-1">
                  Compare training volume across muscle groups.
                </p>
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--gt-text-muted)]">
                  Loading muscle distribution...
                </p>
              ) : !muscleDistribution.length ? (
                <div className="py-8 text-center">
                  <Target
                    size={28}
                    className="mx-auto mb-3 text-[var(--gt-text-muted)]"
                  />

                  <p className="text-sm text-[var(--gt-text-secondary)]">
                    No exercise data available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {muscleDistribution.map((group) => {
                    const percentage = (group.volume / maxVolume) * 100;

                    return (
                      <div key={group.muscleGroup}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {group.muscleGroup}
                          </span>

                          <span className="text-xs text-[var(--gt-text-secondary)]">
                            {group.exercises} exercises
                            {" · "}
                            {group.volume.toLocaleString()} kg
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--gt-background)]">
                          <div
                            className="h-full rounded-full bg-[var(--gt-primary)] transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Workouts */}
            <section className="gt-card">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="gt-section-title">
                    Recent Workouts
                  </h2>

                  <p className="gt-description mt-1">
                    Your latest training sessions.
                  </p>
                </div>

                <Link
                  to="/workouts"
                  className="flex items-center gap-1 text-sm font-semibold text-[var(--gt-primary)] hover:underline"
                >
                  View all
                  <ChevronRight size={16} />
                </Link>
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--gt-text-muted)]">
                  Loading workouts...
                </p>
              ) : recentWorkouts.length === 0 ? (
                <div className="py-10 text-center">
                  <Dumbbell
                    size={30}
                    className="mx-auto mb-3 text-[var(--gt-text-muted)]"
                  />

                  <p className="font-semibold">
                    No workouts yet
                  </p>

                  <p className="gt-description mt-1">
                    Start tracking your first workout.
                  </p>

                  <Link
                    to="/workouts/new"
                    className="gt-button-primary mt-5"
                  >
                    <Plus size={16} />
                    Log Workout
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.map((workout) => {
                    const groups = [
                      ...new Set(
                        (workout.exercises || []).map(
                          (exercise) => exercise.muscleGroup
                        )
                      ),
                    ];

                    const volume = calculateWorkoutVolume(workout);

                    return (
                      <div
                        key={workout._id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--gt-border)] p-4 transition-colors hover:bg-[var(--gt-background)] sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl bg-[var(--gt-primary-light)] p-3 text-[var(--gt-primary)]">
                            <Dumbbell size={21} />
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold">
                              {groups.join(" & ") || "Workout"}
                            </h4>

                            <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                              {formatDate(workout.date)}
                              {" · "}
                              {workout.exercises.length} exercises
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 pl-14 sm:pl-0">
                          <div>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              Duration
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {workout.duration || 0} min
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              Volume
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {volume.toLocaleString()} kg
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Personal Records */}
            <section className="gt-card">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-[var(--gt-primary-light)] p-2.5 text-[var(--gt-primary)]">
                  <Trophy size={20} />
                </div>

                <div>
                  <h2 className="gt-section-title">
                    Personal Records
                  </h2>

                  <p className="gt-description mt-1">
                    Highest recorded weights by exercise.
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="py-5 text-sm text-[var(--gt-text-muted)]">
                  Loading records...
                </p>
              ) : !analytics?.personalRecords?.length ? (
                <p className="py-5 text-sm text-[var(--gt-text-secondary)]">
                  Your personal records will appear here after logging workouts.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {analytics.personalRecords.slice(0, 6).map((record) => (
                    <div
                      key={record.exercise}
                      className="rounded-xl border border-[var(--gt-border)] p-4 transition-colors hover:bg-[var(--gt-background)]"
                    >
                      <p className="text-sm font-semibold">
                        {record.exercise}
                      </p>

                      <p className="mt-3 text-2xl font-bold text-[var(--gt-primary)]">
                        {record.weight} kg
                      </p>

                      <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                        {record.reps} reps
                        {" · "}
                        {formatDate(record.date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="flex flex-col justify-between gap-2 border-t border-[var(--gt-border)] pt-5 text-xs text-[var(--gt-text-muted)] sm:flex-row">
              <p>
                © 2026 GymTrack. All rights reserved.
              </p>

              <p>
                Fitness Management Platform
              </p>
            </footer>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
