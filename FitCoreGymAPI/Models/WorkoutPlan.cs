using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.Models
{
    public class WorkoutPlan
    {
        public int WorkoutPlanId { get; set; }

        [Required]
        public string PlanName { get; set; } = string.Empty;

        public int MemberId { get; set; }
        public GymMember Member { get; set; } = null!;

        public int ProgrammeId { get; set; }
        public TrainingProgramme Programme { get; set; } = null!;

        public List<WorkoutTask> WorkoutTasks { get; set; } = new();
    }
}
