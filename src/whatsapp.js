const config = require('./config');

// Envía un mensaje de texto a través de la WhatsApp Cloud API.
async function enviarTexto(destino, texto) {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: destino,
      type: 'text',
      text: { body: texto },
    }),
  });
  if (!res.ok) {
    throw new Error(`Error al enviar mensaje a WhatsApp (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// Extrae los mensajes de texto de un payload de webhook de WhatsApp.
function extraerMensajes(body) {
  const mensajes = [];
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type === 'text') {
          mensajes.push({ de: msg.from, texto: msg.text.body, id: msg.id });
        } else if (msg.type === 'interactive') {
          const r = msg.interactive.button_reply || msg.interactive.list_reply;
          if (r) mensajes.push({ de: msg.from, texto: r.id, id: msg.id });
        }
      }
    }
  }
  return mensajes;
}

module.exports = { enviarTexto, extraerMensajes };
