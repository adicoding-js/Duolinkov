# Duolinkov 

### Duolinkov is a Soviet/KGB themed Russian language learning app, basically if Duolingo was made to spread russian propaganda.
---
## How to Run/Learn:
- Clone the repo:
```bash
git clone https://github.com/adicoding-js/duolinkov.git
```
- Install Packages
```bash
npm install
```
- Run the Node.js Server
```bash
node server.js
```
- NOTE: The app runs on port 3000 by default. Go to `http://localhost:3000` in your browser.

---
### OR Just play it directly on -> [Duolinkov](duolinkov.up.railway.app) (updates every commit)

## How to Play!
- Enter your username and log in (either guest or with mail)
- Then Do Your Lessons are learn from it (The Owl will make you!)
- Then you will be added to the db and according to your performance, you will climb the leaderboard and your every lesson will be more personlized from the previous one.
---
## What's in it so far!
- 5 lessons covering greetings, loyalty vocab, food, state propaganda, and numbers, all locked until you pass through the previous lesson.
- 4 question types: translate, match pairs, type with on screen Cyrillic(russian) keyboard, and listen + identify with real Russian TTS
- Every lesson generates new vocab via an ai model, difficulty actually scales, and you get a teach phase before any quizzing
- Shop with 8 items, and 18% chance that mid lesson the owl interrupts you with an absurd KGB accusation that actually affects your lessons (hearts and XP), hearts/XP/streak system with daily decay.
---
# What Makes it Tier-4?
- Full SM-2 spaced repetition engine under the hood, which includes memory decay over time, ghost words that come back after 30 days, overdue words get pulled into your next lesson automatically. Also there is log/sign-up with either guest mode or full email login via Supabase, in which SRS syncs to cloud, and the live leaderboard updates in realtime where real users compete against hardcoded Soviet characters (with joseph stalin at 9999999 XP)
---

## Known Issues
- UI Not Too Usable on Mobile
- Maybe sometimes ai dosen't respond(ai servicce's problem, not mine)
- Maybe You Will Feel clanky-ness (will be fixed!!)

## Future Plans
- Dossier Type Ui for the data 
- Dynamic Loading Screen 
- Audio/Sfx adds
- Mobile Ui Support
- And a ton of shi
---
- Disclaimer: Ai was used in this project, however no code is written by ai. AI helped in debugging and understanding and things that are mentioned in the Ai disclaimer.
---
## Made with 💖 by [adicoding-js](https://github.com/adicoding-js/)
### Made for [Macondo](https://macondo.hackclub.com/) with love and hard-work!!💖
