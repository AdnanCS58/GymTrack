import { useEffect, useMemo, useState } from 'react'
import {
  Trophy,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  Award,
  Lock,
  Loader2,
  Medal,
  CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const achievementsList = [
  {
    id: 'first-workout',
    title: 'First Step',
    description: 'Complete your first workout.',
    requirement: '1 workout',
    icon: Dumbbell,
    check: (stats) => stats.totalWorkouts >= 1,
  },
  {
    id: 'five-workouts',
    title: 'Getting Started',
    description: 'Complete 5 workouts.',
    requirement: '5 workouts',
    icon: Target,
    check: (stats) => stats.totalWorkouts >= 5,
  },
  {
    id: 'ten-workouts',
    title: 'Consistency Builder',
    description: 'Complete 10 workouts.',
    requirement: '10 workouts',
    icon: Award,
    check: (stats) => stats.totalWorkouts >= 10,
  },
  {
    id: 'twenty-five-workouts',
    title: 'Dedicated Athlete',
    description: 'Complete 25 workouts.',
    requirement: '25 workouts',
    icon: Medal,
    check: (stats) => stats.totalWorkouts >= 25,
  },
  {
    id: 'fifty-workouts',
    title: 'Fitness Enthusiast',
    description: 'Complete 50 workouts.',
    requirement: '50 workouts',
    icon: Trophy,
    check: (stats) => stats.totalWorkouts >= 50,
  },
  {
    id: 'hundred-workouts',
    title: 'Century Club',
    description: 'Complete 100 workouts.',
    requirement: '100 workouts',
    icon: Trophy,
    check: (stats) => stats.totalWorkouts >= 100,
  },
  {
    id: 'ten-sets',
    title: 'Set by Set',
    description: 'Complete 10 training sets.',
    requirement: '10 sets',
    icon: Dumbbell,
    check: (stats) => stats.totalSets >= 10,
  },
  {
    id: 'hundred-sets',
    title: 'Volume Builder',
    description: 'Complete 100 training sets.',
    requirement: '100 sets',
    icon: TrendingUp,
    check: (stats) => stats.totalSets >= 100,
  },
  {
    id: 'ten-thousand-volume',
    title: 'Heavy Lifter',
    description: 'Reach 10,000 kg of total training volume.',
    requirement: '10,000 kg volume',
    icon: Flame,
    check: (stats) => stats.totalVolume >= 10000,
  },
  {
    id: 'five-day-streak',
    title: 'Building a Habit',
    description: 'Train on 5 consecutive days.',
    requirement: '5-day streak',
    icon: CalendarDays,
    check: (stats) => stats.longestStreak >= 5,
  },
  {
    id: 'seven-day-streak',
    title: 'Unstoppable',
    description: 'Train on 7 consecutive days.',
    requirement: '7-day streak',
    icon: Flame,
    check: (stats) => stats.longestStreak >= 7,
  },
]

const getLocalDateKey = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const calculateLongestStreak = (workouts) => {
  const dates = [
    ...new Set(
      workouts
        .map((workout) => getLocalDateKey(workout.date))
        .filter(Boolean)
    ),
  ].sort()

  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const previous = new Date(`${dates[i - 1]}T12:00:00`)
    const currentDate = new Date(`${dates[i]}T12:00:00`)

    const difference = Math.round(
      (currentDate - previous) / (1000 * 60 * 60 * 24)
    )

    if (difference === 1) {
      current++
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
  }

  return longest
}

const Achievements = () => {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await api.get('/workouts')
        setWorkouts(response.data.workouts || [])
      } catch (error) {
        console.error('Achievements fetch error:', error)
        toast.error('Failed to load achievements.')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  const stats = useMemo(() => {
    const totalSets = workouts.reduce(
      (total, workout) =>
        total +
        (workout.exercises || []).reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal + (exercise.sets || []).length,
          0
        ),
      0
    )

    const totalVolume = workouts.reduce(
      (total, workout) =>
        total +
        (workout.exercises || []).reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal +
            (exercise.sets || []).reduce(
              (setTotal, set) =>
                setTotal +
                (Number(set.reps) || 0) * (Number(set.weight) || 0),
              0
            ),
          0
        ),
      0
    )

    return {
      totalWorkouts: workouts.length,
      totalSets,
      totalVolume,
      longestStreak: calculateLongestStreak(workouts),
    }
  }, [workouts])

  const achievements = useMemo(
    () =>
      achievementsList.map((achievement) => ({
        ...achievement,
        unlocked: achievement.check(stats),
      })),
    [stats]
  )

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length

  const progress = Math.round(
    (unlockedCount / achievements.length) * 100
  )

  if (loading) {
    return (
      <div className="gt-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin"
            style={{ color: 'var(--gt-primary)' }}
          />
          <p className="gt-description">Loading achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gt-page">
      <div className="gt-container">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Trophy
              size={21}
              style={{ color: 'var(--gt-primary)' }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--gt-primary)' }}
            >
              YOUR MILESTONES
            </span>
          </div>

          <h1 className="gt-page-title">Achievements</h1>

          <p className="gt-description mt-2">
            Celebrate your progress and recognize every step of your fitness journey.
          </p>
        </div>

        {/* Overview */}
        <section className="gt-card mb-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_180px] md:items-center">

            <div>
              <p className="gt-description mb-2">
                Achievement progress
              </p>

              <h2 className="text-3xl font-bold">
                {unlockedCount}
                <span
                  className="ml-2 text-base font-medium"
                  style={{ color: 'var(--gt-text-muted)' }}
                >
                  / {achievements.length} unlocked
                </span>
              </h2>

              <div
                className="mt-5 h-2.5 overflow-hidden rounded-full"
                style={{ background: 'var(--gt-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'var(--gt-primary)',
                  }}
                />
              </div>

              <p className="gt-description mt-3">
                You've completed {progress}% of all available achievements.
              </p>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl p-5"
              style={{ background: 'var(--gt-primary-light)' }}
            >
              <Trophy
                size={34}
                style={{ color: 'var(--gt-primary)' }}
              />

              <span
                className="mt-2 text-3xl font-bold"
                style={{ color: 'var(--gt-primary)' }}
              >
                {unlockedCount}
              </span>

              <span
                className="text-xs font-medium"
                style={{ color: 'var(--gt-text-secondary)' }}
              >
                Achievements earned
              </span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Workouts',
              value: stats.totalWorkouts,
              icon: Dumbbell,
            },
            {
              label: 'Total Sets',
              value: stats.totalSets,
              icon: Target,
            },
            {
              label: 'Training Volume',
              value: `${stats.totalVolume.toLocaleString()} kg`,
              icon: TrendingUp,
            },
            {
              label: 'Longest Streak',
              value: `${stats.longestStreak} days`,
              icon: Flame,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div key={item.label} className="gt-card">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--gt-primary-light)' }}
                >
                  <Icon
                    size={19}
                    style={{ color: 'var(--gt-primary)' }}
                  />
                </div>

                <p className="gt-description">{item.label}</p>

                <h3 className="mt-2 text-2xl font-bold">
                  {item.value}
                </h3>
              </div>
            )
          })}
        </div>

        {/* Achievement grid */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="gt-section-title">
              All achievements
            </h2>
            <p className="gt-description mt-1">
              Unlock milestones by staying consistent with your training.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon

            return (
              <div
                key={achievement.id}
                className="gt-card"
                style={{
                  opacity: achievement.unlocked ? 1 : 0.75,
                  borderColor: achievement.unlocked
                    ? 'var(--gt-primary)'
                    : 'var(--gt-border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: achievement.unlocked
                        ? 'var(--gt-primary-light)'
                        : 'var(--gt-background)',
                    }}
                  >
                    <Icon
                      size={23}
                      style={{
                        color: achievement.unlocked
                          ? 'var(--gt-primary)'
                          : 'var(--gt-text-muted)',
                      }}
                    />
                  </div>

                  {achievement.unlocked ? (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: 'var(--gt-primary-light)',
                        color: 'var(--gt-primary)',
                      }}
                    >
                      Unlocked
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: 'var(--gt-background)',
                        color: 'var(--gt-text-muted)',
                      }}
                    >
                      <Lock size={12} />
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-semibold">
                  {achievement.title}
                </h3>

                <p className="gt-description mt-2 min-h-10">
                  {achievement.description}
                </p>

                <div
                  className="mt-4 border-t pt-4 text-xs font-medium"
                  style={{
                    borderColor: 'var(--gt-border)',
                    color: 'var(--gt-text-secondary)',
                  }}
                >
                  Requirement: {achievement.requirement}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Achievements