using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class GymMembersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public GymMembersController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET api/GymMembers?search=Namhla
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _db.GymMembers.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();

                query = query.Where(m =>
                    m.MemberNumber.Contains(term) ||
                    m.Name.Contains(term) ||
                    m.Surname.Contains(term));
            }

            var members = await query
                .OrderBy(m => m.Surname)
                .Select(m => new
                {
                    m.MemberId,
                    m.MemberNumber,
                    m.Name,
                    m.Surname,
                    m.Gender,
                    m.DateOfBirth,
                    m.HomeAddress,
                    m.EmailAddress,
                    m.PhoneNumber,
                    m.MembershipType,
                    m.TrainerId
                })
                .ToListAsync();

            return Ok(members);
        }

        // GET api/GymMembers/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _db.GymMembers
                .AsNoTracking()
                .Where(m => m.MemberId == id)
                .Select(m => new
                {
                    m.MemberId,
                    m.MemberNumber,
                    m.Name,
                    m.Surname,
                    m.Gender,
                    m.DateOfBirth,
                    m.HomeAddress,
                    m.EmailAddress,
                    m.PhoneNumber,
                    m.MembershipType,
                    m.TrainerId
                })
                .FirstOrDefaultAsync();

            return member == null ? NotFound() : Ok(member);
        }

        // POST api/GymMembers
        [HttpPost]
        public async Task<IActionResult> Create(SaveGymMemberDto request)
        {
            var error = await ValidateRequest(request);
            if (error != null) return BadRequest(error);

            var number = request.MemberNumber.Trim();

            if (await _db.GymMembers.AnyAsync(m => m.MemberNumber == number))
                return Conflict("Member number already exists.");

            var member = new GymMember();
            CopyFields(request, member);

            _db.GymMembers.Add(member);
            await _db.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = member.MemberId },
                new { member.MemberId, member.MemberNumber });
        }

        // PUT api/GymMembers/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, SaveGymMemberDto request)
        {
            var member = await _db.GymMembers.FindAsync(id);
            if (member == null) return NotFound();

            var error = await ValidateRequest(request);
            if (error != null) return BadRequest(error);

            var number = request.MemberNumber.Trim();

            if (await _db.GymMembers.AnyAsync(m =>
                    m.MemberId != id && m.MemberNumber == number))
                return Conflict("Member number already exists.");

            CopyFields(request, member);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/GymMembers/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var member = await _db.GymMembers.FindAsync(id);
            if (member == null) return NotFound();

            if (await _db.WorkoutPlans.AnyAsync(p => p.MemberId == id) ||
                await _db.MemberProgrammes.AnyAsync(p => p.MemberId == id))
            {
                return Conflict(
                    "Remove this member's workout plans and programme assignments first.");
            }

            _db.GymMembers.Remove(member);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        private async Task<string?> ValidateRequest(SaveGymMemberDto request)
        {
            if (request.DateOfBirth == default ||
                request.DateOfBirth.Date > DateTime.Today)
                return "Enter a valid date of birth.";

            string[] types = { "Monthly", "Quarterly", "Annual" };

            if (!types.Contains(request.MembershipType.Trim()))
                return "Membership type must be Monthly, Quarterly, or Annual.";

            if (request.TrainerId.HasValue &&
                !await _db.PersonalTrainers.AnyAsync(
                    t => t.TrainerId == request.TrainerId.Value))
                return "The selected trainer does not exist.";

            return null;
        }

        private static void CopyFields(
            SaveGymMemberDto source, GymMember target)
        {
            target.MemberNumber = source.MemberNumber.Trim();
            target.Name = source.Name.Trim();
            target.Surname = source.Surname.Trim();
            target.Gender = source.Gender.Trim();
            target.DateOfBirth = source.DateOfBirth;
            target.HomeAddress = source.HomeAddress.Trim();
            target.EmailAddress = source.EmailAddress.Trim();
            target.PhoneNumber = source.PhoneNumber?.Trim();
            target.MembershipType = source.MembershipType.Trim();
            target.TrainerId = source.TrainerId;
        }
    }
}