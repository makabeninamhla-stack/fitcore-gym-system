import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'

export default function AdminAssignProgramme() {
  const [members, setMembers] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [memberId, setMemberId] = useState('')
  const [programmeId, setProgrammeId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadOptions() {
      try {
        const [membersResponse, programmesResponse] = await Promise.all([
          fetch('/api/GymMembers', { credentials: 'include' }),
          fetch('/api/TrainingProgrammes', { credentials: 'include' }),
        ])

        if (!membersResponse.ok || !programmesResponse.ok) {
          throw new Error('Could not load members or programmes.')
        }

        setMembers(await membersResponse.json())
        setProgrammes(await programmesResponse.json())
      } catch (err) {
        setError(err.message)
      }
    }

    loadOptions()
  }, [])

  async function assignProgramme(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch(
        `/api/TrainingProgrammes/${programmeId}/members/${memberId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`Could not assign programme (${response.status}).`)
      }

      setMessage('Programme assigned successfully.')
      setMemberId('')
      setProgrammeId('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Assign programme to member</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Form onSubmit={assignProgramme}>
          <Form.Group className="mb-3">
            <Form.Label>Member</Form.Label>
            <Form.Select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
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
            <Form.Label>Programme</Form.Label>
            <Form.Select
              value={programmeId}
              onChange={(event) => setProgrammeId(event.target.value)}
              required
            >
              <option value="">Select a programme</option>
              {programmes.map((programme) => (
                <option
                  key={programme.programmeId}
                  value={programme.programmeId}
                >
                  {programme.programmeName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving ? 'Assigning...' : 'Assign programme'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}