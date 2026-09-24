using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class TrainingProgrammesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public TrainingProgrammesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var programmes = await _db.TrainingProgrammes
                .AsNoTracking()
                .OrderBy(p => p.ProgrammeName)
                .ToListAsync();

            return Ok(programmes);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var programme = await _db.TrainingProgrammes
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProgrammeId == id);

            return programme == null ? NotFound() : Ok(programme);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            SaveTrainingProgrammeDto request)
        {
            var programme = new TrainingProgramme
            {
                ProgrammeName = request.ProgrammeName.Trim(),
                Description = request.Description.Trim(),
                Duration = request.Duration.Trim(),
                FitnessGoal = request.FitnessGoal.Trim()
            };

            _db.TrainingProgrammes.Add(programme);
            await _db.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = programme.ProgrammeId },
                programme);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, SaveTrainingProgrammeDto request)
        {
            var programme =
                await _db.TrainingProgrammes.FindAsync(id);

            if (programme == null) return NotFound();

            programme.ProgrammeName = request.ProgrammeName.Trim();
            programme.Description = request.Description.Trim();
            programme.Duration = request.Duration.Trim();
            programme.FitnessGoal = request.FitnessGoal.Trim();

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var programme =
                await _db.TrainingProgrammes.FindAsync(id);

            if (programme == null) return NotFound();

            if (await _db.WorkoutPlans.AnyAsync(
                    p => p.ProgrammeId == id) ||
                await _db.MemberProgrammes.AnyAsync(
                    p => p.ProgrammeId == id))
            {
                return Conflict(
                    "Remove this programme's plans and member assignments first.");
            }

            _db.TrainingProgrammes.Remove(programme);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // POST api/TrainingProgrammes/1/members/1
        [HttpPost("{id:int}/members/{memberId:int}")]
        public async Task<IActionResult> AssignMember(
            int id, int memberId)
        {
            if (!await _db.TrainingProgrammes.AnyAsync(
                    p => p.ProgrammeId == id))
                return NotFound("Programme not found.");

            if (!await _db.GymMembers.AnyAsync(
                    m => m.MemberId == memberId))
                return NotFound("Gym member not found.");

            if (await _db.MemberProgrammes.AnyAsync(
                    a => a.ProgrammeId == id &&
                         a.MemberId == memberId))
                return Conflict(
                    "This member is already assigned to the programme.");

            var assignment = new MemberProgramme
            {
                ProgrammeId = id,
                MemberId = memberId,
                AssignedDate = DateTime.UtcNow
            };

            _db.MemberProgrammes.Add(assignment);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                assignment.MemberProgrammeId,
                assignment.ProgrammeId,
                assignment.MemberId,
                assignment.AssignedDate
            });
        }
    }
}