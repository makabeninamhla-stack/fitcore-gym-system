using System.Security.Claims;
using FitCoreGymAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers;

[ApiController]
[Authorize(Roles = "GymMember")]
[Route("api/member")]
public class MemberDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MemberDashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("programmes")]
    public async Task<IActionResult> GetMyProgrammes()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var programmes = await _context.MemberProgrammes
            .Where(mp => mp.Member.UserId == userId)
            .Select(mp => new
            {
                mp.ProgrammeId,
                mp.Programme.ProgrammeName,
                mp.Programme.Description,
                mp.Programme.Duration,
                mp.Programme.FitnessGoal,
                mp.AssignedDate
            })
            .ToListAsync();

        return Ok(programmes);
    }

    [HttpGet("workout-plans")]
    public async Task<IActionResult> GetMyWorkoutPlans()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var plans = await _context.WorkoutPlans
            .Where(p => p.Member.UserId == userId)
            .Select(p => new
            {
                p.WorkoutPlanId,
                p.PlanName,
                p.ProgrammeId,
                p.Programme.ProgrammeName
            })
            .ToListAsync();

        return Ok(plans);
    }
}