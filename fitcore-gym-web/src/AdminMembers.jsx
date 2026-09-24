import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Table } from 'react-bootstrap'

const emptyForm = {
  memberNumber: '',
  name: '',
  surname: '',
  gender: '',
  dateOfBirth: '',
  homeAddress: '',
  emailAddress: '',
  phoneNumber: '',
  membershipType: '',
  trainerId: '',
}

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadData() {
    try {
      const [membersResponse, trainersResponse] = await Promise.all([
        fetch('/api/GymMembers', { credentials: 'include' }),
        fetch('/api/PersonalTrainers', { credentials: 'include' }),
      ])

      if (!membersResponse.ok || !trainersResponse.ok) {
        throw new Error('Could not load members or trainers.')
      }

      setMembers(await membersResponse.json())
      setTrainers(await trainersResponse.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function editMember(member) {
    setEditingId(member.memberId)
    setForm({
      memberNumber: member.memberNumber ?? '',
      name: member.name ?? '',
      surname: member.surname ?? '',
      gender: member.gender ?? '',
      dateOfBirth: member.dateOfBirth?.slice(0, 10) ?? '',
      homeAddress: member.homeAddress ?? '',
      emailAddress: member.emailAddress ?? '',
      phoneNumber: member.phoneNumber ?? '',
      membershipType: member.membershipType ?? '',
      trainerId: member.trainerId?.toString() ?? '',
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

    const payload = {
      ...form,
      trainerId: form.trainerId ? Number(form.trainerId) : null,
    }

    const url = editingId
      ? `/api/GymMembers/${editingId}`
      : '/api/GymMembers'

    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Could not save member (${response.status}).`)
      }

      setMessage(editingId ? 'Member updated successfully.' : 'Member created successfully.')
      cancelEdit()
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }
   const visibleMembers = members.filter((member) => {
  const query = search.trim().toLowerCase()

  return (
    member.memberNumber?.toLowerCase().includes(query) ||
    member.name?.toLowerCase().includes(query) ||
    member.surname?.toLowerCase().includes(query)
  )
})

async function deleteMember(member) {
  if (!window.confirm(`Delete ${member.name} ${member.surname}?`)) return
  setMessage('')
  setError('')

  try {
    const response = await fetch(`/api/GymMembers/${member.memberId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Could not delete member (${response.status}).`)
    }

    setMessage('Member deleted successfully.')
    await loadData()
  } catch (err) {
    setError(err.message)
  }
}
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Manage gym members</Card.Title>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3">
  <Form.Label>Search members</Form.Label>
  <Form.Control
    type="search"
    placeholder="Member number, name, or surname"
    value={search}
    onChange={(event) => setSearch(event.target.value)}
  />
</Form.Group>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Member number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Trainer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleMembers.map((member) => {
              const trainer = trainers.find(
                (item) => item.trainerId === member.trainerId
              )

              return (
                <tr key={member.memberId}>
                  <td>{member.memberNumber}</td>
                  <td>{member.name} {member.surname}</td>
                  <td>{member.emailAddress}</td>
                  <td>{trainer ? `${trainer.name} ${trainer.surname}` : 'Unassigned'}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => editMember(member)}>
                      Edit
                    </Button>
                    <Button
                     size="sm"
                     variant="outline-danger"
                      className="ms-2"
                        onClick={() => deleteMember(member)}
>
                      Delete                                                                                                                                                                                                                                                                                                                                          
                   </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>

        <h5>{editingId ? 'Edit member' : 'Add member'}</h5>

        <Form onSubmit={handleSubmit}>
          {[
            ['memberNumber', 'Member number'],
            ['name', 'Name'],
            ['surname', 'Surname'],
            ['homeAddress', 'Home address'],
            ['emailAddress', 'Email address'],
            ['phoneNumber', 'Phone number'],
            ['membershipType', 'Membership type'],
          ].map(([field, label]) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                name={field}
                type={field === 'emailAddress' ? 'email' : 'text'}
                value={form[field]}
                onChange={updateField}
                required={field !== 'phoneNumber'}
              />
            </Form.Group>
          ))}

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select name="gender" value={form.gender} onChange={updateField} required>
              <option value="">Select gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date of birth</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={updateField}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trainer</Form.Label>
            <Form.Select name="trainerId" value={form.trainerId} onChange={updateField}>
              <option value="">No trainer assigned</option>
              {trainers.map((trainer) => (
                <option key={trainer.trainerId} value={trainer.trainerId}>
                  {trainer.name} {trainer.surname}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit">{editingId ? 'Save changes' : 'Add member'}</Button>
          {editingId && (
            <Button variant="secondary" className="ms-2" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}