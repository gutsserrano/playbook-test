using System;
using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable

namespace Playbook.Infrastructure.Migrations
{
    public partial class AddRosters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Rosters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rosters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rosters_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RosterPlayers",
                columns: table => new
                {
                    RosterId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RosterPlayers", x => new { x.RosterId, x.PlayerId });
                    table.ForeignKey(
                        name: "FK_RosterPlayers_Rosters_RosterId",
                        column: x => x.RosterId,
                        principalTable: "Rosters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RosterPlayers_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "RosterId",
                table: "Games",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rosters_TeamId",
                table: "Rosters",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_RosterPlayers_PlayerId",
                table: "RosterPlayers",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_RosterId",
                table: "Games",
                column: "RosterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Rosters_RosterId",
                table: "Games",
                column: "RosterId",
                principalTable: "Rosters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Games_Rosters_RosterId",
                table: "Games");

            migrationBuilder.DropTable(name: "RosterPlayers");
            migrationBuilder.DropTable(name: "Rosters");

            migrationBuilder.DropIndex(
                name: "IX_Games_RosterId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "RosterId",
                table: "Games");
        }
    }
}
