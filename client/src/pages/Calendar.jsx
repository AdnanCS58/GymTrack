import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Dumbbell,
  Clock3,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true)

        const response = await api.get('/workouts')
        setWorkouts(response.data.workouts || [])
      } catch (error) {
        console.error('Calendar fetch error:', error)
        toast.error('Failed to load workout calendar.')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = useMemo(() => {
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [firstDay, daysInMonth])

  const getDateKey = (date) => {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${y}-${m}-${day}`
  }

  const workoutsByDate = useMemo(() => {
    return workouts.reduce((acc, workout) => {
      const key = getDateKey(workout.date)

      if (!acc[key]) acc[key] = []

      acc[key].push(workout)

      return acc
    }, {})
  }, [workouts])

  const selectedWorkouts = selectedDate
    ? workoutsByDate[selectedDate] || []
    : []

  const todayKey = getDateKey(new Date())

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  const monthName = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="gt-page">
      <div className="gt-container">

        <div className="mb-8">
          <h1 className="gt-page-title">Workout Calendar</h1>
          <p className="gt-description mt-2">
            Track your training activity and review your workout history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          <section className="gt-card">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="gt-section-title">{monthName}</h2>
                <p className="gt-description mt-1">
                  {workouts.length} recorded workouts
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="rounded-lg border p-2"
                  style={{ borderColor: 'var(--gt-border)' }}
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  onClick={() => {
                    setCurrentDate(new Date())
                    setSelectedDate(null)
                  }}
                  className="rounded-lg border px-3 text-sm font-medium"
                  style={{
                    borderColor: 'var(--gt-border)',
                    color: 'var(--gt-text-secondary)',
                  }}
                >
                  Today
                </button>

                <button
                  onClick={nextMonth}
                  className="rounded-lg border p-2"
                  style={{ borderColor: 'var(--gt-border)' }}
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-xs font-semibold"
                    style={{ color: 'var(--gt-text-muted)' }}
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <Loader2
                  className="animate-spin"
                  style={{ color: 'var(--gt-primary)' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />
                  }

                  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

                  const hasWorkout = Boolean(workoutsByDate[dateKey]?.length)
                  const isToday = dateKey === todayKey
                  const isSelected = selectedDate === dateKey

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      className="relative flex min-h-16 flex-col items-center justify-center rounded-xl transition-colors sm:min-h-20"
                      style={{
                        background: isSelected
                          ? 'var(--gt-primary)'
                          : hasWorkout
                            ? 'var(--gt-primary-light)'
                            : 'transparent',
                        color: isSelected
                          ? '#ffffff'
                          : 'var(--gt-text-primary)',
                        border: isToday && !isSelected
                          ? '1px solid var(--gt-primary)'
                          : '1px solid transparent',
                      }}
                    >
                      <span className="text-sm font-semibold">
                        {day}
                      </span>

                      {hasWorkout && (
                        <span
                          className="mt-1 h-1.5 w-1.5 rounded-full"
                          style={{
                            background: isSelected
                              ? '#ffffff'
                              : 'var(--gt-primary)',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="gt-card">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays
                size={20}
                style={{ color: 'var(--gt-primary)' }}
              />
              <h2 className="gt-section-title">Workout details</h2>
            </div>

            {!selectedDate ? (
              <div className="py-10 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto mb-3"
                  style={{ color: 'var(--gt-text-muted)' }}
                />
                <p className="gt-description">
                  Select a date to view its workouts.
                </p>
              </div>
            ) : selectedWorkouts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium text-sm mb-2">
                  No workouts recorded
                </p>
                <p className="gt-description">
                  No training activity was recorded on this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="gt-description">
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                    'en-US',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </p>

                {selectedWorkouts.map((workout) => (
                  <div
                    key={workout._id}
                    className="rounded-xl border p-4"
                    style={{ borderColor: 'var(--gt-border)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell
                        size={17}
                        style={{ color: 'var(--gt-primary)' }}
                      />
                      <h3 className="font-semibold text-sm">
                        {workout.exercises?.length || 0} Exercises
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {workout.exercises?.map((exercise, index) => (
                        <div
                          key={exercise._id || index}
                          className="flex justify-between text-sm"
                        >
                          <span style={{ color: 'var(--gt-text-secondary)' }}>
                            {exercise.name}
                          </span>
                          <span className="font-medium">
                            {exercise.sets?.length || 0} sets
                          </span>
                        </div>
                      ))}
                    </div>

                    {workout.duration > 0 && (
                      <div
                        className="mt-4 flex items-center gap-2 border-t pt-3 text-xs"
                        style={{
                          borderColor: 'var(--gt-border)',
                          color: 'var(--gt-text-secondary)',
                        }}
                      >
                        <Clock3 size={14} />
                        {workout.duration} minutes
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Calendar