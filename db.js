const Database = require("better-sqlite3");

const db = new Database(process.env.DB_PATH || "./queue.db");

db.exec(`
CREATE TABLE IF NOT EXISTS incense_channels (
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  is_bought INTEGER NOT NULL DEFAULT 0,
  is_paused INTEGER NOT NULL DEFAULT 0,
  bought_at INTEGER,
  PRIMARY KEY (guild_id, channel_id)
);

CREATE TABLE IF NOT EXISTS guild_config (
  guild_id TEXT PRIMARY KEY,
  staff_role_id TEXT,
  watch_channel_id TEXT
);
`);

function getConfig(guildId) {
  return db.prepare("SELECT * FROM guild_config WHERE guild_id = ?").get(guildId);
}

function setStaffRole(guildId, roleId) {
  db.prepare(`
    INSERT INTO guild_config (guild_id, staff_role_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET staff_role_id = excluded.staff_role_id
  `).run(guildId, roleId);
}

function setWatchChannel(guildId, channelId) {
  db.prepare(`
    INSERT INTO guild_config (guild_id, watch_channel_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET watch_channel_id = excluded.watch_channel_id
  `).run(guildId, channelId);
}

module.exports = {
  db,
  getConfig,
  setStaffRole,
  setWatchChannel,
};