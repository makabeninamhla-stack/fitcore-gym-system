import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Table } from 'react-bootstrap'

export default function TrainerTaskForm({ plans }) {
  const [workoutPlanId, setWorkoutPlanId] = useState('')
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [exerciseName, setExerciseName] = useState('')
  const [description, setDescription] = useState('')
  const [numberOfSets, setNumberOfSets] = useState(3)
  const [numberOfRepetitions, setNumberOfRepetitions] = useState(10)
  const [workoutDate, setWorkoutDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!workoutPlanId) return

    let cancelled = false

    async function loadTasks() {
      try {
        const response = await fetch(
          `/api/trainer/workout-plans/${workoutPlanId}/tasks`,
          { credentials: 'include' }
        )

        if (!response.ok) {
          throw new Error(`Could not load exercises (${response.status}).`)
        }

        const data = await response.json()
        if (!cancelled) setTasks(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [workoutPlanId])

  function clearForm() {
    setEditingTaskId(null)
    setExerciseName('')
    setDescription('')
    setNumberOfSets(3)
    setNumberOfRepetitions(10)
    setWorkoutDate('')
  }

  function selectPlan(event) {
    setWorkoutPlanId(event.target.value)
    setTasks([])
    clearForm()
    setMessage('')
    setError('')
  }

  function editTask(task) {
    setEditingTaskId(task.workoutTaskId)
    setExerciseName(task.exerciseName ?? '')
    setDescription(task.description ?? '')
    setNumberOfSets(task.numberOfSets ?? 3)
    setNumberOfRepetitions(task.numberOfRepetitions ?? 10)
    setWorkoutDate(task.workoutDate?.slice(0, 16) ?? '')
    setMessage('')
    setError('')
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete ${task.exerciseName}?`)) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `/api/trainer/workout-plans/${workoutPlanId}/tasks/${task.workoutTaskId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`Could not delete exercise (${response.status}).`)
      }

      setTasks((current) =>
        current.filter(
          (item) => item.workoutTaskId !== task.workoutTaskId
        )
      )

      if (editingTaskId === task.workoutTaskId) clearForm()
      setMessage('Exercise deleted successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveExercise(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const baseUrl =
        `/api/trainer/workout-plans/${workoutPlanId}/tasks`
      const isEditing = editingTaskId !== null

      const response = await fetch(
        isEditing ? `${baseUrl}/${editingTaskId}` : baseUrl,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            exerciseName,
            description,
            numberOfSets: Number(numberOfSets),
            numberOfRepetitions: Number(numberOfRepetitions),
            workoutDate,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Could not ${isEditing ? 'update' : 'add'} exercise (${response.status}).`
        )
      }

      const tasksResponse = await fetch(baseUrl, {
        credentials: 'include',
      })

      if (!tasksResponse.ok) {
        throw new Error(
          `Exercise saved, but could not refresh the list (${tasksResponse.status}).`
        )
      }

      setTasks(await tasksResponse.json())
      clearForm()
      setMessage(
        isEditing
          ? 'Exercise updated successfully.'
          : 'Exercise added successfully.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Manage exercises</Card.Title>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Workout plan</Form.Label>
          <Form.Select
            value={workoutPlanId}
            onChange={selectPlan}
            required
          >
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option
                key={plan.workoutPlanId}
                value={plan.workoutPlanId}
              >
                {plan.planName} — {plan.memberName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {workoutPlanId && (
          <>
            <h5>Exercises in this plan</h5>

            {tasks.length === 0 ? (
              <p>No exercises found for this plan.</p>
            ) : (
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Repetitions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.workoutTaskId}>
                      <td>{task.exerciseName}</td>
                      <td>{task.numberOfSets}</td>
                      <td>{task.numberOfRepetitions}</td>
                      <td>{task.status}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => editTask(task)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() => deleteTask(task)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}

        <h5>
          {editingTaskId !== null
            ? 'Edit exercise'
            : 'Add an exercise'}
        </h5>

        <Form onSubmit={saveExercise}>
          <Form.Group className="mb-3">
            <Form.Label>Exercise name</Form.Label>
            <Form.Control
              value={exerciseName}
              onChange={(event) =>
                setExerciseName(event.target.value)
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Number of sets</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={numberOfSets}
              onChange={(event) =>
                setNumberOfSets(event.target.value)
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Number of repetitions</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={numberOfRepetitions}
              onChange={(event) =>
                setNumberOfRepetitions(event.target.value)
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Workout date and time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={workoutDate}
              onChange={(event) =>
                setWorkoutDate(event.target.value)
              }
              required
            />
          </Form.Group>

          <Button
            type="submit"
            disabled={saving || !workoutPlanId}
          >
            {saving
              ? 'Saving...'
              : editingTaskId !== null
                ? 'Save changes'
                : 'Add exercise'}
          </Button>

          {editingTaskId !== null && (
            <Button
              type="button"
              variant="secondary"
              className="ms-2"
              onClick={clearForm}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}