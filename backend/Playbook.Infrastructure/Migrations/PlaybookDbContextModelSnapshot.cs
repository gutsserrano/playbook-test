using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Playbook.Infrastructure.Data;

#nullable disable

namespace Playbook.Infrastructure.Migrations
{
    [DbContext(typeof(PlaybookDbContext))]
    partial class PlaybookDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("Playbook.Domain.Entities.Clip", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<Guid>("GameId")
                    .HasColumnType("uuid");

                b.Property<int>("EndTimestamp")
                    .HasColumnType("integer");

                b.Property<Guid?>("PlayerId")
                    .HasColumnType("uuid");

                b.Property<int>("StartTimestamp")
                    .HasColumnType("integer");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasColumnType("character varying(500)");

                b.Property<string>("VideoUrl")
                    .HasColumnType("text");

                b.HasKey("Id");

                b.HasIndex("GameId");

                b.HasIndex("PlayerId");

                b.ToTable("Clips");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Event", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<Guid>("GameId")
                    .HasColumnType("uuid");

                b.Property<string>("Notes")
                    .HasColumnType("text");

                b.Property<Guid?>("PlayerId")
                    .HasColumnType("uuid");

                b.Property<int>("Timestamp")
                    .HasColumnType("integer");

                b.Property<string>("Type")
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnType("character varying(100)");

                b.HasKey("Id");

                b.HasIndex("GameId");

                b.HasIndex("PlayerId");

                b.ToTable("Events");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Game", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<DateTime>("Date")
                    .HasColumnType("timestamp with time zone");

                b.Property<string>("Opponent")
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnType("character varying(200)");

                b.Property<Guid>("TeamId")
                    .HasColumnType("uuid");

                b.HasKey("Id");

                b.HasIndex("TeamId");

                b.ToTable("Games");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Player", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<string>("Name")
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnType("character varying(200)");

                b.Property<int>("Number")
                    .HasColumnType("integer");

                b.Property<string>("Position")
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnType("character varying(50)");

                b.Property<Guid>("TeamId")
                    .HasColumnType("uuid");

                b.HasKey("Id");

                b.HasIndex("TeamId");

                b.ToTable("Players");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Team", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<DateTime>("CreatedAt")
                    .HasColumnType("timestamp with time zone");

                b.Property<string>("Name")
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnType("character varying(200)");

                b.HasKey("Id");

                b.ToTable("Teams");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Video", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uuid");

                b.Property<int>("Duration")
                    .HasColumnType("integer");

                b.Property<Guid>("GameId")
                    .HasColumnType("uuid");

                b.Property<string>("VideoUrl")
                    .IsRequired()
                    .HasColumnType("text");

                b.HasKey("Id");

                b.HasIndex("GameId");

                b.ToTable("Videos");
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Clip", b =>
            {
                b.HasOne("Playbook.Domain.Entities.Game", "Game")
                    .WithMany("Clips")
                    .HasForeignKey("GameId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Playbook.Domain.Entities.Player", "Player")
                    .WithMany("Clips")
                    .HasForeignKey("PlayerId")
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Event", b =>
            {
                b.HasOne("Playbook.Domain.Entities.Game", "Game")
                    .WithMany("Events")
                    .HasForeignKey("GameId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Playbook.Domain.Entities.Player", "Player")
                    .WithMany("Events")
                    .HasForeignKey("PlayerId")
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Game", b =>
            {
                b.HasOne("Playbook.Domain.Entities.Team", "Team")
                    .WithMany("Games")
                    .HasForeignKey("TeamId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Player", b =>
            {
                b.HasOne("Playbook.Domain.Entities.Team", "Team")
                    .WithMany("Players")
                    .HasForeignKey("TeamId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Playbook.Domain.Entities.Video", b =>
            {
                b.HasOne("Playbook.Domain.Entities.Game", "Game")
                    .WithMany("Videos")
                    .HasForeignKey("GameId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });
        }
    }
}
