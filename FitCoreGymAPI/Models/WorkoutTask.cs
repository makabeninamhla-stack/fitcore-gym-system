using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.Models
{
    public class WorkoutTask
    {
        public int WorkoutTaskId { get; set; }

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

        [Required]
        public string Status { get; set; } = "Not Started";

        public int WorkoutPlanId { get; set; }
        public WorkoutPlan WorkoutPlan { get; set; } = null!;
    }
}
