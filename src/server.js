const express = require('express');
const config = require('./config');
const { procesarMensaje } = require('./bot');
const { enviarTexto, extraerMensajes } = require('./whatsapp');
const { consultarEnvio } = require('./envios');
const sesiones = require('./sesiones');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// Verificación del webhook (Meta lo llama al configurarlo).
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token && token === config.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepción de mensajes.
app.post('/webhook', async (req, res) => {
  // Respondemos rápido a Meta para que no reintente.
  res.sendStatus(200);

  for (const { de, texto } of extraerMensajes(req.body)) {
    try {
      const { respuesta, sesion, derivarAgente } = await procesarMensaje(sesiones.obtener(de), texto, {
        ahora: new Date(),
        horaInicio: config.horaInicio,
        horaFin: config.horaFin,
        consultarEnvio,
      });
      sesiones.guardar(de, sesion);
      if (derivarAgente) {
        console.log(`[ATC] Cliente ${de} solicita hablar con un agente`);
      }
      if (respuesta) await enviarTexto(de, respuesta);
    } catch (err) {
      console.error(`[ATC] Error procesando mensaje de ${de}:`, err.message);
    }
  }
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`WhatsApp ATC escuchando en el puerto ${config.port}`);
  });
}

module.exports = app;
