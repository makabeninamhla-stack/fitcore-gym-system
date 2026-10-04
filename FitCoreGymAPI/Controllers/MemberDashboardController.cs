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

    [HttpGet("profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var member = await _context.GymMembers
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .Select(m => new
            {
                m.MemberId,
                m.MemberNumber,
                m.Name,
                m.Surname,
                m.Gender,
                m.DateOfBirth,
                m.HomeAddress,
                m.EmailAddress,
                m.PhoneNumber,
                m.MembershipType
            })
            .FirstOrDefaultAsync();

        if (member == null)
            return NotFound(
                "No member profile is linked to your account.");

        return Ok(member);
    }

    [HttpGet("programmes")]
    public async Task<IActionResult> GetMyProgrammes()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var programmes = await _context.MemberProgrammes
            .AsNoTracking()
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

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var plans = await _context.WorkoutPlans
            .AsNoTracking()
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