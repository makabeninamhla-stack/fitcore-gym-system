using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.Models
{
    public class GymMember
    {
        public int MemberId { get; set; }

        [Required]
        public string MemberNumber { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string HomeAddress { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string EmailAddress { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        [Required]
        public string MembershipType { get; set; } = string.Empty;

        public int? TrainerId { get; set; }
        public PersonalTrainer? Trainer { get; set; }
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}
