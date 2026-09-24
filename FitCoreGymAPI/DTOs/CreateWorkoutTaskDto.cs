using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs;

public class CreateWorkoutTaskDto
{
    [Required]
    public string ExerciseName { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int NumberOfSets { get; set; }

    [Range(1, int.MaxValue)]
    public int NumberOfRepetitions { get; set; }

    [Required]
    public DateTime WorkoutDate { get; set; }
}