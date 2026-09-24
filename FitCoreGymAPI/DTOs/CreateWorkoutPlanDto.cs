using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs;

public class CreateWorkoutPlanDto
{
    [Required]
    public string PlanName { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int MemberId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProgrammeId { get; set; }
}