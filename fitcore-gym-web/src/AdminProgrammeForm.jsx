import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Table } from 'react-bootstrap'

export default function AdminProgrammeForm() {
  const [programmes, setProgrammes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [programmeName, setProgrammeName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadProgrammes() {
    const response = await fetch('/api/TrainingProgrammes', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Could not load programmes (${response.status}).`)
    }

    setProgrammes(await response.json())
  }

  useEffect(() => {
    loadProgrammes().catch((err) => setError(err.message))
  }, [])

  function clearForm() {
    setEditingId(null)
    setProgrammeName('')
    setDescription('')
    setDuration('')
    setFitnessGoal('')
  }

  function editProgramme(programme) {
    setEditingId(programme.programmeId)
    setProgrammeName(programme.programmeName ?? '')
    setDescription(programme.description ?? '')
    setDuration(programme.duration ?? '')
    setFitnessGoal(programme.fitnessGoal ?? '')
    setError('')
    setMessage('')
  }

  async function saveProgramme(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    const isEditing = editingId !== null

    try {
      const response = await fetch(
        isEditing
          ? `/api/TrainingProgrammes/${editingId}`
          : '/api/TrainingProgrammes',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            programmeName,
            description,
            duration,
            fitnessGoal,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Could not save programme (${response.status}).`)
      }

      await loadProgrammes()
      clearForm()
      setMessage(
        isEditing
          ? 'Training programme updated successfully.'
          : 'Training programme created successfully.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProgramme(programme) {
    if (!window.confirm(`Delete ${programme.programmeName}?`)) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `/api/TrainingProgrammes/${programme.programmeId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        const details = await response.text()
        throw new Error(
          response.status === 409
            ? details
            : `Could not delete programme (${response.status}).`
        )
      }

      if (editingId === programme.programmeId) clearForm()
      await loadProgrammes()
      setMessage('Training programme deleted successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Manage training programmes</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        {programmes.length > 0 && (
          <Table responsive striped>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Duration</th>
                <th>Fitness goal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmes.map((programme) => (
                <tr key={programme.programmeId}>
                  <td>{programme.programmeName}</td>
                  <td>{programme.duration}</td>
                  <td>{programme.fitnessGoal}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => editProgramme(programme)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="ms-2"
                      onClick={() => deleteProgramme(programme)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <h5>
          {editingId !== null ? 'Edit programme' : 'Create programme'}
        </h5>

        <Form onSubmit={saveProgramme}>
          <Form.Group className="mb-3">
            <Form.Label>Programme name</Form.Label>
            <Form.Control
              value={programmeName}
              onChange={(event) => setProgrammeName(event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Duration</Form.Label>
            <Form.Control
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fitness goal</Form.Label>
            <Form.Control
              value={fitnessGoal}
              onChange={(event) => setFitnessGoal(event.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving
              ? 'Saving...'
              : editingId !== null
                ? 'Save changes'
                : 'Create programme'}
          </Button>

          {editingId !== null && (
            <Button
              type="button"
              variant="secondary"
              className="ms-2"
              onClick={clearForm}
            >
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}