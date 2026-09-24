using System.Security.Claims;
using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers
{
    [ApiController]
    [Route("api/trainer")]
    [Authorize(Roles = "PersonalTrainer")]
    public class TrainerWorkoutPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public TrainerWorkoutPlansController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("members")]
        public async Task<IActionResult> MyMembers()
        {
            var trainer = await GetCurrentTrainer();
            if (trainer == null) return NotFound("Trainer profile not found.");

            var members = await _db.GymMembers
                .AsNoTracking()
                .Where(m => m.TrainerId == trainer.TrainerId)
                .Select(m => new
                {
                    m.MemberId,
                    m.MemberNumber,
                    m.Name,
                    m.Surname
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("members/{memberId:int}/programmes")]
        public async Task<IActionResult> MemberProgrammes(int memberId)
        {
            var trainer = await GetCurrentTrainer();
            if (trainer == null) return NotFound("Trainer profile not found.");

            var assigned = await _db.GymMembers.AnyAsync(m =>
                m.MemberId == memberId &&
                m.TrainerId == trainer.TrainerId);

            if (!assigned) return Forbid();

            var programmes = await _db.MemberProgrammes
                .AsNoTracking()
                .Where(a => a.MemberId == memberId)
                .Select(a => new
                {
                    a.ProgrammeId,
                    a.Programme.ProgrammeName,
                    a.AssignedDate
                })
                .ToListAsync();

            return Ok(programmes);
        }

        [HttpPost("workout-plans")]
        public async Task<IActionResult> CreatePlan(
            CreateWorkoutPlanDto request)
        {
            var trainer = await GetCurrentTrainer();
            if (trainer == null) return NotFound("Trainer profile not found.");

            var assigned = await _db.GymMembers.AnyAsync(m =>
                m.MemberId == request.MemberId &&
                m.TrainerId == trainer.TrainerId);

            if (!assigned)
                return Forbid();

            var enrolled = await _db.MemberProgrammes.AnyAsync(a =>
                a.MemberId == request.MemberId &&
                a.ProgrammeId == request.ProgrammeId);

            if (!enrolled)
                return BadRequest(
                    "The member is not assigned to this programme.");

            var plan = new WorkoutPlan
            {
                PlanName = request.PlanName.Trim(),
                MemberId = request.MemberId,
                ProgrammeId = request.ProgrammeId
            };

            _db.WorkoutPlans.Add(plan);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                plan.WorkoutPlanId,
                plan.PlanName,
                plan.MemberId,
                plan.ProgrammeId
            });
        }

        [HttpGet("workout-plans")]
        public async Task<IActionResult> MyPlans()
        {
            var trainer = await GetCurrentTrainer();
            if (trainer == null) return NotFound("Trainer profile not found.");

            var plans = await _db.WorkoutPlans
                .AsNoTracking()
                .Where(p => p.Member.TrainerId == trainer.TrainerId)
                .Select(p => new
                {
                    p.WorkoutPlanId,
                    p.PlanName,
                    p.MemberId,
                    MemberName = p.Member.Name + " " + p.Member.Surname,
                    p.ProgrammeId,
                    p.Programme.ProgrammeName
                })
                .ToListAsync();

            return Ok(plans);
        }

        private Task<PersonalTrainer?> GetCurrentTrainer()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return _db.PersonalTrainers.FirstOrDefaultAsync(
                t => t.UserId == userId);
        }
    }
}