using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitCoreGymAPI.Migrations
{
    /// <inheritdoc />
    public partial class LinkUsersToProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "PersonalTrainers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "GymMembers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalTrainers_UserId",
                table: "PersonalTrainers",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_GymMembers_UserId",
                table: "GymMembers",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_GymMembers_AspNetUsers_UserId",
                table: "GymMembers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalTrainers_AspNetUsers_UserId",
                table: "PersonalTrainers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GymMembers_AspNetUsers_UserId",
                table: "GymMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonalTrainers_AspNetUsers_UserId",
                table: "PersonalTrainers");

            migrationBuilder.DropIndex(
                name: "IX_PersonalTrainers_UserId",
                table: "PersonalTrainers");

            migrationBuilder.DropIndex(
                name: "IX_GymMembers_UserId",
                table: "GymMembers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PersonalTrainers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "GymMembers");
        }
    }
}
