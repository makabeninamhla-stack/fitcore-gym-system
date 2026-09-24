using FitCoreGymAPI.Data;
using FitCoreGymAPI.DTOs;
using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ProfileAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileAccountsController(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // POST api/ProfileAccounts/trainers/1
        [HttpPost("trainers/{id:int}")]
        public async Task<IActionResult> CreateTrainerAccount(
            int id, CreateProfileAccountDto request)
        {
            var trainer = await _db.PersonalTrainers.FindAsync(id);
            if (trainer == null) return NotFound("Trainer not found.");

            if (trainer.UserId != null)
                return Conflict("This trainer already has a login account.");

            return await CreateAndLinkAccount(
                trainer.EmailAddress,
                request.Password,
                "PersonalTrainer",
                user => trainer.UserId = user.Id);
        }

        // POST api/ProfileAccounts/members/1
        [HttpPost("members/{id:int}")]
        public async Task<IActionResult> CreateMemberAccount(
            int id, CreateProfileAccountDto request)
        {
            var member = await _db.GymMembers.FindAsync(id);
            if (member == null) return NotFound("Member not found.");

            if (member.UserId != null)
                return Conflict("This member already has a login account.");

            return await CreateAndLinkAccount(
                member.EmailAddress,
                request.Password,
                "GymMember",
                user => member.UserId = user.Id);
        }

        private async Task<IActionResult> CreateAndLinkAccount(
            string email,
            string password,
            string role,
            Action<ApplicationUser> linkProfile)
        {
            email = email.Trim();

            if (await _userManager.FindByEmailAsync(email) != null)
                return Conflict("An account already uses this email.");

            await using var transaction =
                await _db.Database.BeginTransactionAsync();

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email
            };

            var createResult =
                await _userManager.CreateAsync(user, password);

            if (!createResult.Succeeded)
                return BadRequest(
                    createResult.Errors.Select(e => e.Description));

            var roleResult =
                await _userManager.AddToRoleAsync(user, role);

            if (!roleResult.Succeeded)
                return BadRequest(
                    roleResult.Errors.Select(e => e.Description));

            linkProfile(user);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { user.Id, user.Email, Role = role });
        }
    }
}