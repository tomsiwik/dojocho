---
"@dojocho/cli": patch
---

Add `dojo status` command and move orchestration to command files

- `dojo status` outputs structured state (`no-dojo`, `intro`, `no-kata`, `kata-intro`, `practicing`, `complete`) with dojo, kata, progress, and a `run:` directive for the next command
- `kata.md` command file reads `dojo status` and follows the `run:` line — replaces verbose routing table with a 3-line file
- Remove prompt injection logic (`!`dojo intro``, `!`dojo kata intro``) from `kata.ts` smart mode — CLI is now pure data
- Remove `!`dojo intro`` from `dojos/effect-ts/DOJO.md` — content files are pure content
