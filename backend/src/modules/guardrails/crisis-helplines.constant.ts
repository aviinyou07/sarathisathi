export const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill (myself|me)\b/i,
  /\bwant to die\b/i,
  /\bend my life\b/i,
  /\bself[ -]?harm\b/i,
  /\bcut myself\b/i,
  /\bcan'?t go on living\b/i,
  /\bno reason to live\b/i,
  /\bhanging myself\b/i,
  /\boverdose\b/i,
];

export const CRISIS_PAYLOAD = {
  crisis: true,
  text: `Partha, your life carries sacred purpose and divine light. In times of supreme darkness and unbearable storm, reach for steady, caring hands immediately:\n\n` +
        `• Tele-MANAS (India): 14416 or 1800-891-4416 (Toll-Free, 24/7)\n` +
        `• AASRA (India): +91-9820466726\n` +
        `• Vandrevala Foundation: +91 9999 666 555\n` +
        `• Suicide & Crisis Lifeline (US & Canada): Dial 988\n` +
        `• Samaritans (UK): 116 123\n\n` +
        `Speak with a support counselor right now. You do not stand alone on this battlefield.`,
};
