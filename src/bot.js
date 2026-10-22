// Lógica de conversación del bot de ATC. No depende de WhatsApp ni de la red,
// así se puede probar de forma aislada.

const MENU = [
  '👋 Hola, soy el asistente de Atención al Cliente.',
  'Responde con el número de la opción:',
  '',
  '1️⃣ Consultar el estado de un envío',
  '2️⃣ Horarios de atención',
  '3️⃣ Preguntas frecuentes',
  '4️⃣ Hablar con un agente',
  '',
  'Escribe *menu* en cualquier momento para volver aquí.',
].join('\n');

const FAQ = [
  '❓ *Preguntas frecuentes*',
  '',
  '• *¿Cuánto tarda un envío?* Normalmente 24-48 h laborables.',
  '• *¿Puedo cambiar la dirección de entrega?* Sí, contacta con un agente (opción 4) con tu número de envío.',
  '• *No estaba en casa, ¿qué pasa?* Se realizará un segundo intento o quedará en la delegación para recogida.',
  '',
  'Escribe *menu* para volver.',
].join('\n');

const PALABRAS_MENU = ['menu', 'hola', 'inicio', 'buenas', '0'];

// Número de envío: 8 a 22 caracteres alfanuméricos.
const PATRON_ENVIO = /^[A-Z0-9]{8,22}$/;

function normalizar(texto) {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function enHorario(fecha, { horaInicio, horaFin }) {
  const dia = fecha.getDay(); // 0 domingo, 6 sábado
  const hora = fecha.getHours();
  return dia >= 1 && dia <= 5 && hora >= horaInicio && hora < horaFin;
}

/**
 * Procesa un mensaje entrante.
 * @param {object} sesion  Estado de la conversación del usuario ({ paso }).
 * @param {string} texto   Texto recibido.
 * @param {object} opts    { ahora: Date, horaInicio, horaFin, consultarEnvio(num) }
 * @returns {Promise<{ respuesta: string, sesion: object, derivarAgente?: boolean }>}
 */
async function procesarMensaje(sesion, texto, opts) {
  const entrada = normalizar(texto);
  const paso = (sesion && sesion.paso) || 'inicio';

  if (paso === 'inicio' || PALABRAS_MENU.includes(entrada)) {
    return { respuesta: MENU, sesion: { paso: 'menu' } };
  }

  if (paso === 'esperando_envio') {
    const numero = String(texto).trim().toUpperCase().replace(/\s+/g, '');
    if (!PATRON_ENVIO.test(numero)) {
      return {
        respuesta: '⚠️ Ese número de envío no parece válido. Revísalo e inténtalo de nuevo, o escribe *menu* para volver.',
        sesion: { paso: 'esperando_envio' },
      };
    }
    const estado = await opts.consultarEnvio(numero);
    const respuesta = estado
      ? `📦 Envío *${numero}*\nEstado: *${estado.estado}*\n${estado.detalle || ''}`.trim()
      : `🔎 No hemos encontrado el envío *${numero}*. Comprueba el número o escribe *4* para hablar con un agente.`;
    return { respuesta: `${respuesta}\n\nEscribe *menu* para volver.`, sesion: { paso: 'menu' } };
  }

  if (paso === 'con_agente') {
    // La conversación la lleva un agente humano; el bot no responde.
    return { respuesta: '', sesion };
  }

  switch (entrada) {
    case '1':
      return {
        respuesta: '📦 Escribe tu número de envío (lo encontrarás en el email o SMS de confirmación).',
        sesion: { paso: 'esperando_envio' },
      };
    case '2':
      return {
        respuesta: `🕘 Nuestro horario de atención con agente es de lunes a viernes de ${opts.horaInicio}:00 a ${opts.horaFin}:00.\n\nEscribe *menu* para volver.`,
        sesion: { paso: 'menu' },
      };
    case '3':
      return { respuesta: FAQ, sesion: { paso: 'menu' } };
    case '4':
      if (!enHorario(opts.ahora, opts)) {
        return {
          respuesta: `🌙 Ahora mismo estamos fuera de horario (L-V ${opts.horaInicio}:00-${opts.horaFin}:00). Déjanos tu consulta por aquí y un agente te responderá en cuanto abramos.`,
          sesion: { paso: 'con_agente' },
          derivarAgente: true,
        };
      }
      return {
        respuesta: '🧑‍💼 Te pasamos con un agente. En breve te atenderá una persona.',
        sesion: { paso: 'con_agente' },
        derivarAgente: true,
      };
    default:
      return { respuesta: `No he entendido tu mensaje.\n\n${MENU}`, sesion: { paso: 'menu' } };
  }
}

module.exports = { procesarMensaje, enHorario, MENU };
