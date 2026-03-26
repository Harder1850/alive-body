/**
 * Notifier — ALIVE's alert broadcast tool.
 *
 * Writes a CRITICAL_ALERT.txt to the Desktop so the user sees it even when
 * the browser is closed. Extend with Twilio/Mailgun by setting env vars:
 *   ALIVE_TWILIO_SID, ALIVE_TWILIO_TOKEN, ALIVE_TWILIO_FROM, ALIVE_TWILIO_TO
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const DESKTOP = join('C:', 'Users', process.env['USERNAME'] ?? 'mikeh', 'Desktop');

export function sendNotification(message: string): void {
  const ts = new Date().toISOString();
  const content = `[ALIVE ALERT — ${ts}]\n\n${message}\n`;

  try {
    const alertPath = join(DESKTOP, 'CRITICAL_ALERT.txt');
    writeFileSync(alertPath, content, 'utf-8');
    console.log(`[notifier] ✓ Alert written to Desktop: ${alertPath}`);
  } catch (err) {
    console.warn('[notifier] Could not write to Desktop:', err instanceof Error ? err.message : err);
  }

  // Twilio SMS (optional — only fires if env vars are set)
  const sid   = process.env['ALIVE_TWILIO_SID'];
  const token = process.env['ALIVE_TWILIO_TOKEN'];
  const from  = process.env['ALIVE_TWILIO_FROM'];
  const to    = process.env['ALIVE_TWILIO_TO'];

  if (sid && token && from && to) {
    import('axios').then(({ default: axios }) => {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const params = new URLSearchParams({ From: from, To: to, Body: `ALIVE: ${message}` });
      axios.post(url, params.toString(), {
        auth: { username: sid, password: token },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then(() => {
        console.log('[notifier] ✓ Twilio SMS sent');
      }).catch((e: unknown) => {
        console.warn('[notifier] Twilio SMS failed:', e instanceof Error ? e.message : e);
      });
    }).catch(() => {/* axios not available */});
  }
}
