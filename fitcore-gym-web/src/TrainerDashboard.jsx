import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import TrainerTaskForm from './TrainerTaskForm'
export default function TrainerDashboard() {
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [memberId, setMemberId] = useState('')
  const [programmeId, setProgrammeId] = useState('')
  const [planName, setPlanName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadDashboard() {
    try {
      const [membersResponse, plansResponse] = await Promise.all([
        fetch('/api/trainer/members', { credentials: 'include' }),
        fetch('/api/trainer/workout-plans', { credentials: 'include' }),
      ])

      if (!membersResponse.ok || !plansResponse.ok) {
        throw new Error('Could not load trainer information.')
      }

      setMembers(await membersResponse.json())
      setPlans(await plansResponse.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function selectMember(id) {
    setMemberId(id)
    setProgrammeId('')
    setProgrammes([])
    setError('')

    if (!id) return

    try {
      const response = await fetch(
        `/api/trainer/members/${id}/programmes`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        throw new Error('Could not load the member’s programmes.')
      }

      setProgrammes(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  async function createPlan(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch('/api/trainer/workout-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planName,
          memberId: Number(memberId),
          programmeId: Number(programmeId),
        }),
      })

      if (!response.ok) {
        throw new Error(`Could not create workout plan (${response.status}).`)
      }

      setMessage('Workout plan created successfully.')
      setPlanName('')

      const plansResponse = await fetch('/api/trainer/workout-plans', {
        credentials: 'include',
      })

      if (plansResponse.ok) {
        setPlans(await plansResponse.json())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner animation="border" className="mt-4" />

  return (
    <div className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>My members</Card.Title>
          {members.length === 0 ? (
            <p className="mb-0">No members assigned yet.</p>
          ) : (
            members.map((member) => (
              <p key={member.memberId} className="mb-2">
                <strong>{member.name} {member.surname}</strong>
                {' — '}{member.memberNumber}
              </p>
            ))
          )}
        </Card.Body>
      </Card>
      <TrainerTaskForm plans={plans} />

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Create workout plan</Card.Title>

          <Form onSubmit={createPlan}>
            <Form.Group className="mb-3">
              <Form.Label>Plan name</Form.Label>
              <Form.Control
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Member</Form.Label>
              <Form.Select
                value={memberId}
                onChange={(event) => selectMember(event.target.value)}
                required
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.memberId} value={member.memberId}>
                    {member.name} {member.surname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assigned programme</Form.Label>
              <Form.Select
                value={programmeId}
                onChange={(event) => setProgrammeId(event.target.value)}
                disabled={!memberId}
                required
              >
                <option value="">Select a programme</option>
                {programmes.map((item) => (
                  <option
                    key={item.programmeId}
                    value={item.programmeId}
                  >
                    {item.programmeName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create plan'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Workout plans</Card.Title>
          {plans.length === 0 ? (
            <p className="mb-0">No workout plans yet.</p>
          ) : (
            plans.map((plan) => (
              <p key={plan.workoutPlanId} className="mb-2">
                <strong>{plan.planName}</strong>
                {' — '}{plan.memberName}
                {' — '}{plan.programmeName}
              </p>
            ))
          )}
        </Card.Body>
      </Card>
    </div>
  )
}