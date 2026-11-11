// Public privacy policy, served at /privacy so the App Store and Play Store
// listings have a URL to link to. Keep it in step with what the app does.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export function privacyPage(contactEmail: string, updated = '11 November 2026'): string {
  const contact = contactEmail
    ? `email <a href="mailto:${esc(contactEmail)}">${esc(contactEmail)}</a>`
    : 'use the contact details on the Rush store listing';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rush privacy policy</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #F8F5EC; color: #111; font: 17px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 680px; margin: 0 auto; padding: 40px 20px 64px; }
  h1 { font-size: 30px; line-height: 1.2; margin: 0 0 4px; }
  h2 { font-size: 20px; margin: 32px 0 8px; }
  .muted { color: #5E5B53; }
  .box { background: #FFFDF8; border: 1.5px solid #111; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
  a { color: #111; }
</style>
</head>
<body>
<main>
  <h1>Rush privacy policy</h1>
  <p class="muted">Last updated ${esc(updated)}</p>

  <div class="box">
    <strong>In short:</strong> Rush has no accounts. Your profile, medical ID, health log and medicines are saved only on your phone.
    The only thing that leaves your phone is a chat message you choose to send, and it is not stored on our server.
  </div>

  <h2>What Rush stores, and where</h2>
  <p>Everything you enter in Rush (your name, date of birth, blood group, sickle cell status, allergies, conditions, medicines,
  emergency contact, health log readings and chat history) is saved in the app's storage on your device. We do not have a copy.
  If you delete the app or use <em>Settings → Delete all my data</em>, it is gone.</p>

  <h2>The chat</h2>
  <p>When you send a message in Rush Chat, the conversation is sent over an encrypted connection to the Rush server, which passes it to
  Anthropic's Claude AI service to produce a reply. The Rush server does not store or log the content of your messages. It keeps a random
  install ID and your IP address in memory for up to 24 hours, only to stop misuse (rate limiting).</p>
  <p>Anthropic processes the messages to generate the reply and handles them under its own commercial terms and privacy policy
  (<a href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a>). Anthropic does not use this data to train its models.</p>
  <p>Your health information is only included if you turn on <em>Use my health info</em> in the chat. When it is on, Rush shares your age,
  sex, location, blood group, sickle cell status, allergies, conditions, medicines and recent health log readings. Your name, phone number
  and emergency contact are never sent.</p>
  <p>Before a message is sent, the app checks it on your phone for signs of an emergency. If it finds one, it shows emergency numbers and
  sends nothing unless you choose to continue.</p>

  <h2>Reminders</h2>
  <p>Medicine reminders are scheduled by your phone's own notification system. Nothing about them is sent to us.</p>

  <h2>What we do not do</h2>
  <p>No advertising, no analytics or tracking tools, no selling or sharing of data, and no accounts or passwords.</p>

  <h2>Your choices</h2>
  <p>You can export a summary of your information (<em>Settings → Export your medical data</em>) and delete everything at any time
  (<em>Settings → Delete all my data</em>). You can turn health-info sharing in the chat on or off at any time.</p>

  <h2>Not medical advice</h2>
  <p>Rush gives general health information. It does not diagnose, treat or prescribe. In an emergency in Ghana call 112, or the National
  Ambulance Service on 193.</p>

  <h2>Children</h2>
  <p>Rush is intended for people aged 16 and over. A parent or carer may use it to look after a child.</p>

  <h2>Changes and contact</h2>
  <p>If this policy changes, the date above will change and the app will ask you to confirm again when the change matters.
  For questions, ${contact}.</p>
</main>
</body>
</html>`;
}
