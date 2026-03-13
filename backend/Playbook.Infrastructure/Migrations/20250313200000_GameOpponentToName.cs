using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable

namespace Playbook.Infrastructure.Migrations
{
    public partial class GameOpponentToName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Opponent",
                table: "Games",
                newName: "Name");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Games",
                newName: "Opponent");
        }
    }
}
