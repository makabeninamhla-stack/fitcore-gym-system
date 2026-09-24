using System.Security.Claims;
using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers;

[ApiController]
[Authorize(Roles = "GymMember")]
[Route("api/member/workout-tasks")]
public class MemberWorkoutTasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MemberWorkoutTasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyTasks([FromQuery] string? status)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var tasks = _context.WorkoutTasks
            .Where(t => t.WorkoutPlan.Member.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            tasks = tasks.Where(t => t.Status == status);
        }

        var result = await tasks
            .OrderBy(t => t.WorkoutDate)
            .Select(t => new
            {
                t.WorkoutTaskId,
                t.ExerciseName,
                t.Description,
                t.NumberOfSets,
                t.NumberOfRepetitions,
                t.WorkoutDate,
                t.Status,
                t.WorkoutPlanId,
                t.WorkoutPlan.PlanName
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id, UpdateWorkoutTaskStatusDto dto)
    {
        string[] allowedStatuses =
        {
            "Not Started",
            "In Progress",
            "Completed"
        };

        var requestedStatus = allowedStatuses.FirstOrDefault(s =>
            string.Equals(s, dto.Status.Trim(),
                StringComparison.OrdinalIgnoreCase));

        if (requestedStatus == null)
        {
            return BadRequest(
                "Status must be Not Started, In Progress, or Completed.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var task = await _context.WorkoutTasks
            .FirstOrDefaultAsync(t =>
                t.WorkoutTaskId == id &&
                t.WorkoutPlan.Member.UserId == userId);

        if (task == null)
            return NotFound("Workout task not found.");

        task.Status = requestedStatus;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            task.WorkoutTaskId,
            task.Status
        });
    }
}