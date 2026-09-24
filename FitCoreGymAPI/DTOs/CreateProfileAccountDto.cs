using System.ComponentModel.DataAnnotations;

namespace FitCoreGymAPI.DTOs
{
    public class CreateProfileAccountDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}