import { useState } from 'react'
import AdminDashboard from './AdminDashboard'
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap'
import MemberDashboard from './MemberDashboard'
import TrainerDashboard from './TrainerDashboard'
import AdminProgrammeForm from './AdminProgrammeForm'
import AdminAssignProgramme from './AdminAssignProgramme'
import AdminMembers from './AdminMembers'
import AdminTrainers from './AdminTrainers'


function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Incorrect email or password.'
            : `Login failed (${response.status}).`
           
        )
      }

      const account = await response.json()
      setUser(account)
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/Auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      setEmail('')
      setPassword('')
      setError('')
    } catch {
      setError('Could not log out. Please try again.')
    }
  }

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <h1 className="text-center mb-2">FitCore Gym</h1>
      <p className="text-center text-muted mb-4">
        Gym management system
      </p>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {user ? (
            <>
              <h2 className="h4">Welcome</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p>
                <strong>Role:</strong> {user.roles?.join(', ') || 'None'}
              </p>
              <Button variant="outline-danger" onClick={handleLogout}>
                Log out
              </Button>
              {user.roles?.includes('GymMember') && <MemberDashboard />}
            {user.roles?.includes('PersonalTrainer') && <TrainerDashboard />}
            {user.roles?.includes('Admin') && <AdminDashboard />}
            </>
          ) : (
            <>
              <h2 className="h4 mb-3">Log in</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" disabled={loading} className="w-100">
                  {loading ? <Spinner size="sm" /> : 'Log in'}
                </Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
      <AdminProgrammeForm />
      <AdminAssignProgramme />
      <AdminMembers />
      <AdminTrainers />
    </Container>
  )
}

export default App
