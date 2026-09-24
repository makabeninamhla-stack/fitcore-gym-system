import { useEffect, useState } from 'react'
import { Alert, Card, Spinner } from 'react-bootstrap'

export default function AdminDashboard() {
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const responses = await Promise.all([
          fetch('/api/GymMembers', { credentials: 'include' }),
          fetch('/api/PersonalTrainers', { credentials: 'include' }),
          fetch('/api/TrainingProgrammes', { credentials: 'include' }),
        ])

        if (responses.some((response) => !response.ok)) {
          throw new Error('Could not load admin information.')
        }

        const [memberData, trainerData, programmeData] =
          await Promise.all(
            responses.map((response) => response.json())
          )

        setMembers(memberData)
        setTrainers(trainerData)
        setProgrammes(programmeData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <Spinner animation="border" className="mt-4" />

  return (
    <div className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Gym members ({members.length})</Card.Title>
          {members.map((member) => (
            <p key={member.memberId} className="mb-2">
              {member.name} {member.surname} — {member.memberNumber}
            </p>
          ))}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Personal trainers ({trainers.length})</Card.Title>
          {trainers.map((trainer) => (
            <p key={trainer.trainerId} className="mb-2">
              {trainer.name} {trainer.surname} — {trainer.staffNumber}
            </p>
          ))}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Training programmes ({programmes.length})</Card.Title>
          {programmes.map((programme) => (
            <p key={programme.programmeId} className="mb-2">
              {programme.programmeName} — {programme.duration}
            </p>
          ))}
        </Card.Body>
      </Card>
    </div>
  )
}