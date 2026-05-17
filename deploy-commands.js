require("dotenv").config();

const {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("setstaffrole")
    .setDescription("Set the staff role for staff-only commands.")
    .addRoleOption((opt) =>
      opt.setName("role").setDescription("Staff role").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("setwatchannel")
    .setDescription("Set the channel where overpause alerts are sent.")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Watch/log channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("addinc")
    .setDescription("Add current channel as an incense channel."),

  new SlashCommandBuilder()
    .setName("removeinc")
    .setDescription("Remove current channel as an incense channel."),

  new SlashCommandBuilder()
    .setName("addallinc")
    .setDescription("Add all text channels in the current category."),

  new SlashCommandBuilder()
    .setName("clearallinc")
    .setDescription("Remove all tracked incense channels."),

  new SlashCommandBuilder()
    .setName("incbought")
    .setDescription("Show incense bought status."),

  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause current incense channel."),

  new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume current incense channel."),

  new SlashCommandBuilder()
    .setName("botstatus")
    .setDescription("Check bot ping and role status."),

  new SlashCommandBuilder()
    .setName("pauseall")
    .setDescription("Pause all incense channels."),

  new SlashCommandBuilder()
    .setName("resumeall")
    .setDescription("Resume all incense channels."),

  new SlashCommandBuilder()
    .setName("testpauseall")
    .setDescription("Test pause all incense channels."),

  new SlashCommandBuilder()
    .setName("testresumeall")
    .setDescription(" Test resume all incense channels."),

].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Global slash commands deployed.");
  } catch (err) {
    console.error(err);
  }
})();
