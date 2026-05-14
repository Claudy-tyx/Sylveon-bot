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
    .setDescription("Set the watch channel.")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Watch channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("addinc")
    .setDescription("Add an incense channel.")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("removeinc")
    .setDescription("Remove an incense channel.")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("addallinc")
    .setDescription("Add all channels in category.")
    .addChannelOption((opt) =>
      opt
        .setName("category")
        .setDescription("Category")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clearallinc")
    .setDescription("Clear all incense channels."),

  new SlashCommandBuilder()
    .setName("incbought")
    .setDescription("View incense bought status."),

  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause channel."),

  new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume channel."),

  new SlashCommandBuilder()
    .setName("pauseall")
    .setDescription("Pause all channels."),

  new SlashCommandBuilder()
    .setName("resumeall")
    .setDescription("Resume all channels."),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN
);

(async () => {
  try {
    console.log("Deploying guild commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Guild slash commands deployed.");
  } catch (err) {
    console.error(err);
  }
})();