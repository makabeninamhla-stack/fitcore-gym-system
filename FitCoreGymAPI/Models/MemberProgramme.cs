using FitCoreGymAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Models
{
    public class MemberProgramme
    {
        public int MemberProgrammeId { get; set; }

        public int MemberId { get; set; }
        public GymMember Member { get; set; } = null!;

        public int ProgrammeId { get; set; }
        public TrainingProgramme Programme { get; set; } = null!;

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    }

}