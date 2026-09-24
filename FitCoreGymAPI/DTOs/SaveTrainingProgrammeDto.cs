using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs
{
    public class SaveTrainingProgrammeDto
    {
        [Required]
        public string ProgrammeName { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Duration { get; set; } = string.Empty;

        [Required]
        public string FitnessGoal { get; set; } = string.Empty;
    }
}