using FitCoreGymAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FitCoreGymAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<GymMember> GymMembers => Set<GymMember>();
        public DbSet<PersonalTrainer> PersonalTrainers => Set<PersonalTrainer>();
        public DbSet<TrainingProgramme> TrainingProgrammes => Set<TrainingProgramme>();
        public DbSet<WorkoutPlan> WorkoutPlans => Set<WorkoutPlan>();
        public DbSet<WorkoutTask> WorkoutTasks => Set<WorkoutTask>();
        public DbSet<MemberProgramme> MemberProgrammes => Set<MemberProgramme>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<GymMember>().HasKey(member => member.MemberId);
            modelBuilder.Entity<PersonalTrainer>().HasKey(trainer => trainer.TrainerId);
            modelBuilder.Entity<TrainingProgramme>().HasKey(programme => programme.ProgrammeId);
            modelBuilder.Entity<MemberProgramme>().HasKey(assignment => assignment.MemberProgrammeId);
            modelBuilder.Entity<GymMember>()
           .HasOne(member => member.User)
           .WithOne()
           .HasForeignKey<GymMember>(member => member.UserId)
           .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PersonalTrainer>()
                .HasOne(trainer => trainer.User)
                .WithOne()
                .HasForeignKey<PersonalTrainer>(trainer => trainer.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<GymMember>()
                .HasIndex(member => member.MemberNumber)
                .IsUnique();

            modelBuilder.Entity<PersonalTrainer>()
                .HasIndex(trainer => trainer.StaffNumber)
                .IsUnique();

            modelBuilder.Entity<GymMember>()
                .HasOne(member => member.Trainer)
                .WithMany(trainer => trainer.GymMembers)
                .HasForeignKey(member => member.TrainerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(plan => plan.Member)
                .WithMany()
                .HasForeignKey(plan => plan.MemberId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(plan => plan.Programme)
                .WithMany()
                .HasForeignKey(plan => plan.ProgrammeId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<WorkoutTask>()
                .HasOne(task => task.WorkoutPlan)
                .WithMany(plan => plan.WorkoutTasks)
                .HasForeignKey(task => task.WorkoutPlanId);

            modelBuilder.Entity<MemberProgramme>()
                .HasOne(assignment => assignment.Member)
                .WithMany()
                .HasForeignKey(assignment => assignment.MemberId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<MemberProgramme>()
                .HasOne(assignment => assignment.Programme)
                .WithMany()
                .HasForeignKey(assignment => assignment.ProgrammeId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}