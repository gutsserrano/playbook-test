using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable

namespace Playbook.Infrastructure.Migrations
{
    public partial class AddClipVideoUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Clips",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Clips");
        }
    }
}
