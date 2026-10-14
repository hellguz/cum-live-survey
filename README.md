# 🗳️ Who's in the room — live survey

Six quick questions for the first session, with a live results page for the projector: a world map, bars and a word cloud. Static files only, so it runs on GitHub Pages.

- `index.html` is the form students open on their phones (the results page shows a QR code for it).
- `results.html` goes on the projector. It updates live, and students can open it on their phones too.
- Questions and answer options live in `common.js` (`QUESTIONS`).

## How answers travel

Each phone sends one anonymous message to the free relay [ntfy.sh](https://ntfy.sh), no account needed. Every open page subscribes to the same topic and recounts. Changing answers on the same phone replaces the earlier ones. ntfy.sh keeps messages for about 12 hours.

- **Fresh room:** open both pages with `?t=some-new-name`, or change `DEFAULT_TOPIC` in `common.js`.
- **Preview without sending anything:** `results.html?demo=1`.
- **Privacy:** answers are anonymous, but anyone who knows the topic name can read them. Don't add questions about names or other personal details.
- **Limits:** ntfy.sh limits requests per IP address. One class on shared Wi-Fi is fine: one message per student, and about 30 open live pages per IP address.

## Hosting

Push this folder to a public GitHub repo, then go to Settings → Pages → *Deploy from a branch* → `main` / root.
