using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs;

public class UpdateWorkoutTaskStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}