# SylveonBot

A lightweight Discord incense queue management bot built with Discord.js.

Designed for Pokétwo mass incense servers.

---

# Features

## Queue Management

* `/addinc` → Add current channel as an incense channel
* `/removeinc` → Remove current channel
* `/addallinc` → Add all channels inside a category
* `/clearallinc` → Clear all tracked incense channels

## Channel Controls

* `/pause` → Pause Pokétwo in current channel
* `/resume` → Resume Pokétwo in current channel
* `/pauseall` → Pause all tracked channels
* `/resumeall` → Resume all tracked channels and reset bought status
* `/testpauseall` → Pause all tracked channels while showing any failed channels
* `/testresumeall` → Resume all tracked channels while showing any failed channels

## Tracking

* Automatically detects successful incense purchases
* Automatically pauses channels after incense buy
* Overpause timer alerts
* `/incbought` → Shows bought progress and missing channels
* `/botstatus` → Shows bot ping and role hierarchy status

## Staff Configuration

* `/setstaffrole`
* `/setwatchannel`

---

# Tech Stack

* Node.js
* Discord.js v14
* better-sqlite3
* dotenv

---

# Installation

## 1. Clone Repository

```bash
git clone YOUR_REPO_URL
cd SylveonBot
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create `.env`

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
GUILD_ID=YOUR_TEST_SERVER_ID
DB_PATH=./queue.db
INCENSE_BOT_ID=716390085896962058
POKETWO_ROLE_ID=YOUR_POKETWO_ROLE_ID
INCENSE_BOUGHT_TEXT=You purchased an Incense for 50 shards!
```

---

# Running The Bot

## Development

```bash
npm run dev
```

## Railway / Production Startup

```bash
npm start
```

The production startup automatically:

```txt
→ Deploys global slash commands
→ Starts the bot
```

This is handled by:

```txt
start.js
```

---

# Deploying Slash Commands

## Fast Testing (Guild Commands)

```bash
node deploy-guild.js
```

Commands update instantly in your test server.

## Global Deploy

```bash
node deploy-commands.js
```

Global commands may take a few minutes to appear.

When hosted on Railway, slash commands are automatically redeployed every restart through:

```txt
npm start
→ start.js
→ deploy-commands.js
→ index.js
```

---

# Required Bot Permissions

Invite scopes:

* `bot`
* `applications.commands`

Required permissions:

* View Channels
* Send Messages
* Read Message History
* Manage Channels

---

# Important Setup Notes

## Role Hierarchy

Your bot role MUST be above Pokétwo's role.

Otherwise the bot cannot pause/resume Pokétwo access.

## Pokétwo Pause Logic

Pausing a channel removes Pokétwo's:

* View Channel
* Send Messages

Resuming restores permissions.

---

# Example Workflow

```txt
/setstaffrole
/setwatchannel
/addallinc
```

When incense is purchased:

```txt
→ Bot detects purchase
→ Channel auto pauses
```

When incense is paused:

```txt
→ Bot detects pause
→ Starts overpause timer
→ Sends warning to watch channel if not resumed
```

---

# Commands

| Command          | Description                 |
| ---------------- | --------------------------- |
| `/addinc`        | Add current channel         |
| `/removeinc`     | Remove current channel      |
| `/addallinc`     | Add category channels       |
| `/clearallinc`   | Clear all tracked channels  |
| `/pause`         | Pause current channel       |
| `/resume`        | Resume current channel      |
| `/pauseall`      | Pause all channels          |
| `/resumeall`     | Resume all channels         |
| `/testpauseall`  | Pauses with log of failed   |
| `/testresumeall` | Resumes with log of failed  |
| `/incbought`     | View incense progress       |
| `/setstaffrole`  | Set staff role              |
| `/setwatchannel` | Set overpause alert channel |
| `/botstatus`     | Check bot diagnostics       |

---

# Railway Hosting

Recommended Railway setup:

## Start Command

```bash
npm start
```

## Persistent Volume

Attach a Railway volume for:

```txt
queue.db

- Queue rotation system
- Incense timers
- Auto resume scheduling
- Dashboard web panel
- Statistics tracking
- Multi-server management
- Button UI
- Redis support

---

# License

Made by a flooflover 

```
