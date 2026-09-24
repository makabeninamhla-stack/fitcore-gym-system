using System.Security.Claims;
using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers;

[ApiController]
[Authorize(Roles = "PersonalTrainer")]
[Route("api/trainer/workout-plans/{workoutPlanId:int}/tasks")]
public class TrainerWorkoutTasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TrainerWorkoutTasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(int workoutPlanId)
    {
        var plan = await FindMyPlan(workoutPlanId);
        if (plan == null) return NotFound("Workout plan not found.");

        var tasks = await _context.WorkoutTasks
            .Where(t => t.WorkoutPlanId == workoutPlanId)
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
                t.WorkoutPlanId
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(
        int workoutPlanId, CreateWorkoutTaskDto dto)
    {
        var plan = await FindMyPlan(workoutPlanId);
        if (plan == null) return NotFound("Workout plan not found.");

        var task = new WorkoutTask
        {
            WorkoutPlanId = workoutPlanId,
            ExerciseName = dto.ExerciseName,
            Description = dto.Description,
            NumberOfSets = dto.NumberOfSets,
            NumberOfRepetitions = dto.NumberOfRepetitions,
            WorkoutDate = dto.WorkoutDate,
            Status = "Not Started"
        };

        _context.WorkoutTasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTasks),
            new { workoutPlanId },
            new
            {
                task.WorkoutTaskId,
                task.ExerciseName,
                task.Description,
                task.NumberOfSets,
                task.NumberOfRepetitions,
                task.WorkoutDate,
                task.Status,
                task.WorkoutPlanId
            });
    }

    [HttpPut("{taskId:int}")]
    public async Task<IActionResult> UpdateTask(
        int workoutPlanId, int taskId, CreateWorkoutTaskDto dto)
    {
        var plan = await FindMyPlan(workoutPlanId);
        if (plan == null) return NotFound("Workout plan not found.");

        var task = await _context.WorkoutTasks
            .FirstOrDefaultAsync(t =>
                t.WorkoutTaskId == taskId &&
                t.WorkoutPlanId == workoutPlanId);

        if (task == null) return NotFound("Workout task not found.");

        task.ExerciseName = dto.ExerciseName;
        task.Description = dto.Description;
        task.NumberOfSets = dto.NumberOfSets;
        task.NumberOfRepetitions = dto.NumberOfRepetitions;
        task.WorkoutDate = dto.WorkoutDate;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    [HttpDelete("{taskId:int}")]
    public async Task<IActionResult> DeleteTask(int workoutPlanId, int taskId)
    {
        var plan = await FindMyPlan(workoutPlanId);
        if (plan == null) return NotFound("Workout plan not found.");

        var task = await _context.WorkoutTasks
            .FirstOrDefaultAsync(t =>
                t.WorkoutTaskId == taskId &&
                t.WorkoutPlanId == workoutPlanId);

        if (task == null) return NotFound("Workout task not found.");

        _context.WorkoutTasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<WorkoutPlan?> FindMyPlan(int workoutPlanId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return await _context.WorkoutPlans
            .FirstOrDefaultAsync(p =>
                p.WorkoutPlanId == workoutPlanId &&
                p.Member.Trainer != null &&
                p.Member.Trainer.UserId == userId);
    }
}