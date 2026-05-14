require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");

const {
  db,
  getConfig,
  setStaffRole,
  setWatchChannel,
} = require("./db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const OVERPAUSE_TIME = 3 * 60 * 1000;

const overpauseTimers = new Map();

function hasStaffRole(member, guildId) {
  const config = getConfig(guildId);

  if (!config?.staff_role_id) return false;

  return member.roles.cache.has(config.staff_role_id);
}

function addIncenseChannel(guildId, channelId) {
  db.prepare(`
    INSERT OR IGNORE INTO incense_channels
    (guild_id, channel_id)
    VALUES (?, ?)
  `).run(guildId, channelId);
}

function removeIncenseChannel(guildId, channelId) {
  db.prepare(`
    DELETE FROM incense_channels
    WHERE guild_id = ?
    AND channel_id = ?
  `).run(guildId, channelId);
}

function resetAllBought(guildId) {
  db.prepare(`
    UPDATE incense_channels
    SET is_bought = 0,
        bought_at = NULL
    WHERE guild_id = ?
  `).run(guildId);
}

function getIncenseChannels(guildId) {
  return db.prepare(`
    SELECT * FROM incense_channels
    WHERE guild_id = ?
  `).all(guildId);
}

function clearAllIncenseChannels(guildId) {
  db.prepare(`
    DELETE FROM incense_channels
    WHERE guild_id = ?
  `).run(guildId);
}

function setBought(channelId, value) {
  db.prepare(`
    UPDATE incense_channels
    SET is_bought = ?,
        bought_at = ?
    WHERE channel_id = ?
  `).run(value ? 1 : 0, value ? Date.now() : null, channelId);
}

function setPaused(channelId, value) {
  db.prepare(`
    UPDATE incense_channels
    SET is_paused = ?
    WHERE channel_id = ?
  `).run(value ? 1 : 0, channelId);
}

async function pauseChannel(channel) {
  const poketwoId = process.env.INCENSE_BOT_ID;

  if (!poketwoId) {
    console.log("Missing INCENSE_BOT_ID in .env");
    return;
  }

  await channel.permissionOverwrites.edit(poketwoId, {
    ViewChannel: false,
    SendMessages: false,
  });

  setPaused(channel.id, true);
  startOverpauseTimer(channel);

  console.log(`Paused Pokétwo in ${channel.name}`);
}

async function resumeChannel(channel) {
  const poketwoId = process.env.INCENSE_BOT_ID;

  if (!poketwoId) {
    console.log("Missing INCENSE_BOT_ID in .env");
    return;
  }

  await channel.permissionOverwrites.edit(poketwoId, {
    ViewChannel: null,
    SendMessages: null,
  });

  setPaused(channel.id, false);
  clearOverpauseTimer(channel.id);

  console.log(`Resumed Pokétwo in ${channel.name}`);
}

function clearOverpauseTimer(channelId) {
  const existing = overpauseTimers.get(channelId);

  if (existing) {
    clearTimeout(existing);
    overpauseTimers.delete(channelId);
  }
}

function startOverpauseTimer(channel) {
  clearOverpauseTimer(channel.id);

  const timeout = setTimeout(async () => {
    try {
      const config = getConfig(channel.guild.id);

      if (!config?.watch_channel_id) return;

      const watchChannel = channel.guild.channels.cache.get(
        config.watch_channel_id
      );

      if (!watchChannel) return;

      await watchChannel.send(
        `Help! ${channel} has been paused for over 3 minutes. \n <a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569><a:3_:1504337336375312569>`
      );
    } catch (err) {
      console.error(err);
    }
  }, OVERPAUSE_TIME);

  overpauseTimers.set(channel.id, timeout);
}

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "setstaffrole") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          content: "Admin only.",
          ephemeral: true,
        });
      }

      const role = interaction.options.getRole("role");

      setStaffRole(interaction.guild.id, role.id);

      return interaction.reply(
        `<a:1_:1504337333028126812> Staff role set to ${role}`
      );
    }

    if (
      ["setwatchannel", "pauseall", "resumeall", "clearallinc"].includes(commandName)
    ) {
      if (!hasStaffRole(interaction.member, interaction.guild.id)) {
        return interaction.reply({
          content: "You do not have the staff role.",
          ephemeral: true,
        });
      }
    }

    if (commandName === "setwatchannel") {
      const channel =
        interaction.options.getChannel("channel");

      setWatchChannel(interaction.guild.id, channel.id);

      return interaction.reply(
        `<a:1_:1504337333028126812> Watch channel set to ${channel}`
      );
    }

    if (commandName === "addinc") {
			addIncenseChannel(
				interaction.guild.id,
				interaction.channel.id
			);

			return interaction.reply(
				`<a:1_:1504337333028126812> Added ${interaction.channel}`
			);
		}

    if (commandName === "removeinc") {
			removeIncenseChannel(
				interaction.guild.id,
				interaction.channel.id
			);

			return interaction.reply(
				`<a:1_:1504337333028126812> Removed ${interaction.channel}`
			);
		}

    if (commandName === "addallinc") {
      const category =
        interaction.options.getChannel("category");

      const channels =
        interaction.guild.channels.cache.filter(
          (c) =>
            c.parentId === category.id &&
            c.type === ChannelType.GuildText
        );

      let added = 0;

      for (const [, channel] of channels) {
        addIncenseChannel(
          interaction.guild.id,
          channel.id
        );

        added++;
      }

      return interaction.reply(
        `<a:1_:1504337333028126812> Added ${added} channels`
      );
    }

		if (commandName === "botstatus") {
			const botMember = interaction.guild.members.me;

			const poketwoRole = interaction.guild.roles.cache.get(
				process.env.POKETWO_ROLE_ID
			);

			const botHighestRole =
				botMember.roles.highest.position;

			const poketwoHighestRole =
				poketwoRole?.position || 0;

			const roleStatus =
				botHighestRole > poketwoHighestRole
					? "✅ Bot role is above Pokétwo"
					: "❌ Bot role is BELOW Pokétwo";

			const embed = new EmbedBuilder()
				.setTitle("🤖 Bot Status")
				.setColor(
					botHighestRole > poketwoHighestRole
						? 0x57f287
						: 0xed4245
				)
				.addFields(
					{
						name: "<:4_:1504337338208227329> Ping",
						value: `${client.ws.ping}ms`,
						inline: true,
					},
					{
						name: "<:4_:1504337338208227329> Status",
						value: "Online ✅",
						inline: true,
					},
					{
						name: "<:4_:1504337338208227329> Role Check",
						value: roleStatus,
					}
				)
				.setTimestamp();

			return interaction.reply({
				embeds: [embed],
			});
		}

    if (commandName === "clearallinc") {
    clearAllIncenseChannels(interaction.guild.id);

    return interaction.reply(
        "<a:1_:1504337333028126812> Cleared all incense channels."
    );
    }

    if (commandName === "incbought") {
			const channels = getIncenseChannels(
				interaction.guild.id
			);

			if (!channels.length) {
				return interaction.reply({
					content: "No incense channels.",
					ephemeral: true,
				});
			}

			const bought = channels.filter((c) => c.is_bought);
			const notBought = channels.filter((c) => !c.is_bought);

			const embed = new EmbedBuilder()
				.setTitle("<:2_:1504337334966026353> Incense Status")
				.setColor(notBought.length ? 0xff9900 : 0x57f287)
				.setDescription(
					`**${bought.length}/${channels.length}** channels bought`
				)
				.addFields({
					name: `<:4_:1504337338208227329> Not Bought (${notBought.length})`,
					value:
						notBought.length > 0
							? notBought
									.map((c) => `<#${c.channel_id}>`)
									.join("\n")
							: "All channels bought <a:3_:1504337336375312569>",
				})
				.setTimestamp();

			return interaction.reply({
				embeds: [embed],
			});
		}

    if (commandName === "pause") {
      const channel =
        interaction.options.getChannel("channel") ||
        interaction.channel;

      await pauseChannel(channel);

      return interaction.reply(
        `<a:1_:1504337333028126812> Paused ${channel}`
      );
    }

    if (commandName === "resume") {
      const channel =
        interaction.options.getChannel("channel") ||
        interaction.channel;

      await resumeChannel(channel);

      return interaction.reply(
        `<a:1_:1504337333028126812> Resumed ${channel}`
      );
    }

    if (commandName === "pauseall") {
      const channels = getIncenseChannels(
        interaction.guild.id
      );

      for (const row of channels) {
        const channel =
          interaction.guild.channels.cache.get(
            row.channel_id
          );

        if (!channel) continue;

        await pauseChannel(channel);
      }

      return interaction.reply(
        "<a:1_:1504337333028126812> Paused all incense channels."
      );
    }

    if (commandName === "resumeall") {
			const channels = getIncenseChannels(interaction.guild.id);

			for (const row of channels) {
				const channel = interaction.guild.channels.cache.get(row.channel_id);

				if (!channel) continue;

				await resumeChannel(channel);
			}

			resetAllBought(interaction.guild.id);

			return interaction.reply(
				"<a:1_:1504337333028126812> Resumed all incense channels."
			);
		}
  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      interaction.reply({
        content: "An error occurred.",
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", async (message) => {
  try {
    if (!message.author.bot) return;

    if (
      process.env.INCENSE_BOT_ID &&
      message.author.id !== process.env.INCENSE_BOT_ID
    ) {
      return;
    }

    const incChannel = db.prepare(`
      SELECT * FROM incense_channels
      WHERE channel_id = ?
    `).get(message.channel.id);

    if (!incChannel) return;

    if (message.content.includes(process.env.INCENSE_BOUGHT_TEXT)) {
			setBought(message.channel.id, true);

			console.log(`Incense bought in ${message.channel.name}`);

			await pauseChannel(message.channel);

			await message.channel.send(
				"<a:1_:1504337333028126812> Channel paused."
			);

			console.log(`Auto-paused ${message.channel.name}`);
		}
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);