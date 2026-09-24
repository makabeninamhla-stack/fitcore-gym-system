using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs
{
    public class SaveGymMemberDto
    {
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
    }
}