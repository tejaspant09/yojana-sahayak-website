// A new checkout must never send visitors to a previous operator's number.
export function restartUrl(number = process.env.YOJANA_WHATSAPP_NUMBER) {
  return typeof number === 'string' && /^[1-9]\d{9,14}$/.test(number)
    ? `https://wa.me/${number}?text=YOJANA%20START`
    : null;
}

export function withRestartLink(text, number) {
  const url = restartUrl(number);
  if (!url || typeof text !== 'string' || !/\bYOJANA START\b/u.test(text) || text.includes(url)) return text;
  // WhatsApp text has no Markdown anchor labels. Keep the command and expose
  // the real URL; click-to-chat prefills a draft and never sends it for the user.
  return `${text}\n\nफिर शुरू करें / Restart: ${url}\nलिंक खोलें, फिर भेजें दबाएँ। / Open the link, then tap Send.`;
}
