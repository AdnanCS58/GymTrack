import { useEffect, useState } from 'react'
import {
  Activity,
  Dumbbell,
  TrendingUp,
  Clock,
  CalendarDays,
  Target,
  BarChart3,
  Award,
} from 'lucide-react'

import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'

import { getWorkoutAnalytics } from '../services/analyticsService'
import { Link } from 'react-router-dom'

const formatNumber = (value) =>
  new Intl.NumberFormat().format(Math.round(value || 0))

const formatVolume = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return formatNumber(value)
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getWorkoutAnalytics()

        if (!data.success) {
          throw new Error('Unable to load workout analytics.')
        }

        setAnalytics(data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Something went wrong while loading analytics.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="gt-page">
        <div className="gt-container">
          <div className="gt-card flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--gt-border)] border-t-[var(--gt-primary)]" />
              <p className="text-sm text-[var(--gt-text-secondary)]">
                Loading your analytics...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gt-page">
        <div className="gt-container">
          <div className="gt-card py-12 text-center">
            <Activity
              size={36}
              className="mx-auto mb-4 text-[var(--gt-danger)]"
            />
            <h2 className="text-lg font-semibold text-[var(--gt-text-primary)]">
              Unable to load analytics
            </h2>
            <p className="mt-2 text-sm text-[var(--gt-text-secondary)]">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="gt-button-primary mt-5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    overview = {},
    weeklyActivity = [],
    volumeTrend = [],
    muscleDistribution = [],
    personalRecords = [],
  } = analytics || {}

  const statCards = [
    {
      title: 'Total Workouts',
      value: formatNumber(overview.totalWorkouts),
      description: 'All-time completed sessions',
      icon: Dumbbell,
    },
    {
      title: 'This Week',
      value: formatNumber(overview.workoutsThisWeek),
      description: 'Workouts in the last 7 days',
      icon: CalendarDays,
    },
    {
      title: 'Total Exercises',
      value: formatNumber(overview.totalExercises),
      description: 'Exercises logged',
      icon: Activity,
    },
    {
      title: 'Total Volume',
      value: formatVolume(overview.totalVolume),
      description: 'Total weight lifted (kg)',
      icon: TrendingUp,
    },
    {
      title: 'Average Duration',
      value: `${Math.round(overview.averageDuration || 0)} min`,
      description: 'Average workout length',
      icon: Clock,
    },
  ]

  const hasWorkoutData = overview.totalWorkouts > 0

  return (
    <div className="gt-page">
      <div className="gt-container space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[var(--gt-text-secondary)]">
              <Link to="/dashboard" className="transition hover:text-[var(--gt-primary)]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[var(--gt-text-primary)]">Analytics</span>
            </div>

            <h1 className="gt-page-title">Workout Analytics</h1>
            <p className="gt-description mt-1">
              Track your training performance and understand your progress.
            </p>
          </div>

          <Link to="/workouts/new" className="gt-button-primary">
            <Dumbbell size={17} />
            Log Workout
          </Link>
        </div>

        {!hasWorkoutData ? (
          <div className="gt-card py-16 text-center">
            <BarChart3
              size={42}
              className="mx-auto mb-4 text-[var(--gt-text-muted)]"
            />
            <h2 className="text-xl font-semibold text-[var(--gt-text-primary)]">
              No workout data yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--gt-text-secondary)]">
              Complete your first workout to start seeing your training
              statistics and performance trends here.
            </p>
            <Link to="/workouts/new" className="gt-button-primary mt-6 inline-flex">
              Start Your First Workout
            </Link>
          </div>
        ) : (
          <>
            {/* Overview statistics */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Activity size={19} className="text-[var(--gt-primary)]" />
                <h2 className="gt-section-title">Performance Overview</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((stat) => {
                  const Icon = stat.icon

                  return (
                    <div key={stat.title} className="gt-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-[var(--gt-text-secondary)]">
                            {stat.title}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-[var(--gt-text-primary)]">
                            {stat.value}
                          </h3>
                        </div>

                        <div className="rounded-xl bg-[var(--gt-primary-light)] p-3">
                          <Icon size={20} className="text-[var(--gt-primary)]" />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-[var(--gt-text-muted)]">
                        {stat.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Weekly activity */}
            <section className="gt-card">
              <div className="mb-6">
                <h2 className="gt-section-title">Weekly Workout Activity</h2>
                <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
                  Your workout frequency over the last 7 days.
                </p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyActivity}>
                    <defs>
                      <linearGradient id="weeklyActivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#39865B"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#39865B"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="var(--gt-border)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="var(--gt-text-muted)"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="var(--gt-text-muted)"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      labelFormatter={formatDate}
                      contentStyle={{
                        background: 'var(--gt-surface)',
                        border: '1px solid var(--gt-border)',
                        borderRadius: '10px',
                        color: 'var(--gt-text-primary)',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Workouts"
                      stroke="#39865B"
                      strokeWidth={3}
                      fill="url(#weeklyActivityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Volume trend */}
            <section className="gt-card">
              <div className="mb-6">
                <h2 className="gt-section-title">Training Volume Trend</h2>
                <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
                  Daily training volume over the last 30 days.
                </p>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeTrend}>
                    <CartesianGrid
                      stroke="var(--gt-border)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="var(--gt-text-muted)"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={20}
                    />

                    <YAxis
                      stroke="var(--gt-text-muted)"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value) => [`${formatNumber(value)} kg`, 'Volume']}
                      contentStyle={{
                        background: 'var(--gt-surface)',
                        border: '1px solid var(--gt-border)',
                        borderRadius: '10px',
                        color: 'var(--gt-text-primary)',
                      }}
                    />

                    <Bar
                      dataKey="volume"
                      name="Volume"
                      fill="#39865B"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Muscle distribution */}
            <section className="gt-card">
              <div className="mb-6">
                <h2 className="gt-section-title">Muscle Group Distribution</h2>
                <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
                  Understand how your training volume is distributed.
                </p>
              </div>

              {muscleDistribution.length === 0 ? (
                <p className="text-sm text-[var(--gt-text-secondary)]">
                  No muscle group data available yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {muscleDistribution.map((muscle) => {
                    const maxVolume = Math.max(
                      ...muscleDistribution.map((item) => item.volume || 0),
                      1
                    )

                    const percentage = Math.min(
                      ((muscle.volume || 0) / maxVolume) * 100,
                      100
                    )

                    return (
                      <div key={muscle.muscleGroup}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-[var(--gt-text-primary)]">
                              {muscle.muscleGroup}
                            </p>
                            <p className="text-xs text-[var(--gt-text-muted)]">
                              {formatNumber(muscle.exercises)} exercises
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-[var(--gt-text-primary)]">
                            {formatVolume(muscle.volume)} kg
                          </p>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--gt-border)]">
                          <div
                            className="h-full rounded-full bg-[var(--gt-primary)] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Personal records */}
            <section className="gt-card">
              <div className="mb-6 flex items-center gap-2">
                <Award size={21} className="text-[var(--gt-primary)]" />
                <div>
                  <h2 className="gt-section-title">Personal Records</h2>
                  <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
                    Your highest recorded weight for each exercise.
                  </p>
                </div>
              </div>

              {personalRecords.length === 0 ? (
                <p className="text-sm text-[var(--gt-text-secondary)]">
                  No personal records available yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {personalRecords.map((record) => (
                    <div
                      key={record.exercise}
                      className="rounded-xl border border-[var(--gt-border)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[var(--gt-text-primary)]">
                            {record.exercise}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                            {record.date ? formatDate(record.date) : 'Date unavailable'}
                          </p>
                        </div>

                        <Target
                          size={19}
                          className="shrink-0 text-[var(--gt-primary)]"
                        />
                      </div>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[var(--gt-text-primary)]">
                          {formatNumber(record.weight)}
                        </span>
                        <span className="text-sm text-[var(--gt-text-secondary)]">
                          kg
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[var(--gt-text-muted)]">
                        {formatNumber(record.reps)} reps
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics