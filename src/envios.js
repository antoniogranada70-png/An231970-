// Consulta del estado de un envío.
// TODO: sustituir este ejemplo por la llamada real al sistema de seguimiento.

const EJEMPLO = {
  ENV12345678: { estado: 'En reparto', detalle: 'Se entregará hoy antes de las 19:00.' },
  ENV87654321: { estado: 'Entregado', detalle: 'Entregado el 21/10 a las 12:34.' },
};

async function consultarEnvio(numero) {
  return EJEMPLO[numero] || null;
}

module.exports = { consultarEnvio };
