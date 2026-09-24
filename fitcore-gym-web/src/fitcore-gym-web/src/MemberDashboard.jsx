import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Spinner } from 'react-bootstrap'

export default function MemberDashboard() {
  const [programmes, setProgrammes] = useState([])
  const [plans, setPlans] = useState([])
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const paths = [
        '/api/member/programmes',
        '/api/member/workout-plans',
        '/api/member/workout-tasks',
      ]

      const responses = await Promise.all(
        paths.map((path) => fetch(path, { credentials: 'include' }))
      )

      if (responses.some((response) => !response.ok)) {
        throw new Error('Could not load your gym information.')
      }

      const [programmeData, planData, taskData] = await Promise.all(
        responses.map((response) => response.json())
      )

      setProgrammes(programmeData)
      setPlans(planData)
      setTasks(taskData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function updateStatus(taskId, status) {
    setError('')

    try {
      const response = await fetch(
        `/api/member/workout-tasks/${taskId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error('Could not update the exercise status.')
      }

      setTasks((current) =>
        current.map((task) =>
          task.workoutTaskId === taskId ? { ...task, status } : task
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const visibleTasks = filter
    ? tasks.filter((task) => task.status === filter)
    : tasks

  if (loading) return <Spinner animation="border" />

  return (
    <div className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>My programmes</Card.Title>
          {programmes.length === 0 ? (
            <p className="mb-0">No programmes assigned yet.</p>
          ) : (
            programmes.map((programme) => (
              <p key={programme.programmeId} className="mb-2">
                <strong>{programme.programmeName}</strong>
                {' — '}{programme.duration}
              </p>
            ))
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>My workout plans</Card.Title>
          {plans.length === 0 ? (
            <p className="mb-0">No workout plans yet.</p>
          ) : (
            plans.map((plan) => (
              <p key={plan.workoutPlanId} className="mb-2">
                <strong>{plan.planName}</strong>
                {' — '}{plan.programmeName}
              </p>
            ))
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>My exercises</Card.Title>

          <Form.Select
            className="mb-3"
            aria-label="Filter exercises by status"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Form.Select>

          {visibleTasks.length === 0 ? (
            <p>No exercises match this filter.</p>
          ) : (
            visibleTasks.map((task) => (
              <Card key={task.workoutTaskId} className="mb-2">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <strong>{task.exerciseName}</strong>
                    <Badge bg="secondary">{task.status}</Badge>
                  </div>

                  <p className="mb-1">{task.description}</p>
                  <p className="mb-2">
                    {task.numberOfSets} sets ×{' '}
                    {task.numberOfRepetitions} repetitions
                  </p>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() =>
                      updateStatus(task.workoutTaskId, 'In Progress')
                    }
                  >
                    In Progress
                  </Button>{' '}

                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() =>
                      updateStatus(task.workoutTaskId, 'Completed')
                    }
                  >
                    Completed
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    </div>
  )
}