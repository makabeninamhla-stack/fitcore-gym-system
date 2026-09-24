import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Table } from 'react-bootstrap'

const emptyForm = {
  staffNumber: '',
  name: '',
  surname: '',
  gender: '',
  emailAddress: '',
  phoneNumber: '',
  specialization: '',
}

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadTrainers() {
    try {
      const response = await fetch('/api/PersonalTrainers', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Could not load trainers (${response.status}).`)
      }

      setTrainers(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function editTrainer(trainer) {
    setEditingId(trainer.trainerId)
    setForm({
      staffNumber: trainer.staffNumber ?? '',
      name: trainer.name ?? '',
      surname: trainer.surname ?? '',
      gender: trainer.gender ?? '',
      emailAddress: trainer.emailAddress ?? '',
      phoneNumber: trainer.phoneNumber ?? '',
      specialization: trainer.specialization ?? '',
    })
    setMessage('')
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    const wasEditing = editingId !== null
    const url = wasEditing
      ? `/api/PersonalTrainers/${editingId}`
      : '/api/PersonalTrainers'

    try {
      const response = await fetch(url, {
        method: wasEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error(`Could not save trainer (${response.status}).`)
      }

      cancelEdit()
      setMessage(
        wasEditing
          ? 'Trainer updated successfully.'
          : 'Trainer created successfully.'
      )
      await loadTrainers()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteTrainer(trainer) {
    if (!window.confirm(`Delete ${trainer.name} ${trainer.surname}?`)) {
      return
    }

    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `/api/PersonalTrainers/${trainer.trainerId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`Could not delete trainer (${response.status}).`)
      }

      if (editingId === trainer.trainerId) {
        cancelEdit()
      }

      setMessage('Trainer deleted successfully.')
      await loadTrainers()
    } catch (err) {
      setError(err.message)
    }
  }

  const visibleTrainers = trainers.filter((trainer) => {
    const query = search.trim().toLowerCase()

    return (
      trainer.staffNumber?.toLowerCase().includes(query) ||
      trainer.name?.toLowerCase().includes(query) ||
      trainer.surname?.toLowerCase().includes(query)
    )
  })

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Manage personal trainers</Card.Title>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Search trainers</Form.Label>
          <Form.Control
            type="search"
            placeholder="Staff number, name, or surname"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Form.Group>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Staff number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTrainers.map((trainer) => (
              <tr key={trainer.trainerId}>
                <td>{trainer.staffNumber}</td>
                <td>{trainer.name} {trainer.surname}</td>
                <td>{trainer.emailAddress}</td>
                <td>{trainer.specialization}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => editTrainer(trainer)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="ms-2"
                    onClick={() => deleteTrainer(trainer)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h5>{editingId ? 'Edit trainer' : 'Add trainer'}</h5>

        <Form onSubmit={handleSubmit}>
          {[
            ['staffNumber', 'Staff number'],
            ['name', 'Name'],
            ['surname', 'Surname'],
            ['emailAddress', 'Email address'],
            ['phoneNumber', 'Phone number'],
            ['specialization', 'Specialization'],
          ].map(([field, label]) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                name={field}
                type={field === 'emailAddress' ? 'email' : 'text'}
                value={form[field]}
                onChange={updateField}
                required
              />
            </Form.Group>
          ))}

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={form.gender}
              onChange={updateField}
              required
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit">
            {editingId ? 'Save changes' : 'Add trainer'}
          </Button>

          {editingId && (
            <Button
              variant="secondary"
              className="ms-2"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}