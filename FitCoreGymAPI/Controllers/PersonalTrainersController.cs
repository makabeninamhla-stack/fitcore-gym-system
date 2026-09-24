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
    public class PersonalTrainersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PersonalTrainersController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET api/PersonalTrainers?search=Bandile
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _db.PersonalTrainers.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();

                query = query.Where(t =>
                    t.StaffNumber.Contains(term) ||
                    t.Name.Contains(term) ||
                    t.Surname.Contains(term));
            }

            var trainers = await query
                .OrderBy(t => t.Surname)
                .Select(t => new
                {
                    t.TrainerId,
                    t.StaffNumber,
                    t.Name,
                    t.Surname,
                    t.Gender,
                    t.EmailAddress,
                    t.PhoneNumber,
                    t.Specialization
                })
                .ToListAsync();

            return Ok(trainers);
        }

        // GET api/PersonalTrainers/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trainer = await _db.PersonalTrainers
                .AsNoTracking()
                .Where(t => t.TrainerId == id)
                .Select(t => new
                {
                    t.TrainerId,
                    t.StaffNumber,
                    t.Name,
                    t.Surname,
                    t.Gender,
                    t.EmailAddress,
                    t.PhoneNumber,
                    t.Specialization
                })
                .FirstOrDefaultAsync();

            return trainer == null ? NotFound() : Ok(trainer);
        }

        // POST api/PersonalTrainers
        [HttpPost]
        public async Task<IActionResult> Create(
            SavePersonalTrainerDto request)
        {
            var number = request.StaffNumber.Trim();

            if (await _db.PersonalTrainers.AnyAsync(
                    t => t.StaffNumber == number))
                return Conflict("Staff number already exists.");

            var trainer = new PersonalTrainer();
            CopyFields(request, trainer);

            _db.PersonalTrainers.Add(trainer);
            await _db.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = trainer.TrainerId },
                new { trainer.TrainerId, trainer.StaffNumber });
        }

        // PUT api/PersonalTrainers/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, SavePersonalTrainerDto request)
        {
            var trainer = await _db.PersonalTrainers.FindAsync(id);
            if (trainer == null) return NotFound();

            var number = request.StaffNumber.Trim();

            if (await _db.PersonalTrainers.AnyAsync(
                    t => t.TrainerId != id && t.StaffNumber == number))
                return Conflict("Staff number already exists.");

            CopyFields(request, trainer);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/PersonalTrainers/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var trainer = await _db.PersonalTrainers.FindAsync(id);
            if (trainer == null) return NotFound();

            if (await _db.GymMembers.AnyAsync(
                    m => m.TrainerId == id))
                return Conflict(
                    "Reassign this trainer's gym members before deletion.");

            _db.PersonalTrainers.Remove(trainer);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        private static void CopyFields(
            SavePersonalTrainerDto source,
            PersonalTrainer target)
        {
            target.StaffNumber = source.StaffNumber.Trim();
            target.Name = source.Name.Trim();
            target.Surname = source.Surname.Trim();
            target.Gender = source.Gender.Trim();
            target.EmailAddress = source.EmailAddress.Trim();
            target.PhoneNumber = source.PhoneNumber.Trim();
            target.Specialization = source.Specialization.Trim();
        }
    }
}