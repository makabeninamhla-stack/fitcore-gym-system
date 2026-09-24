using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.Models
{
    public class PersonalTrainer
    {
        public int TrainerId { get; set; }

        [Required]
        public string StaffNumber { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string EmailAddress { get; set; } = string.Empty;

        [Required, Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string Specialization { get; set; } = string.Empty;

        public List<GymMember> GymMembers { get; set; } = new();
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}
    

