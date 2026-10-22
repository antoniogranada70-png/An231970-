const test = require('node:test');
const assert = require('node:assert');
const { procesarMensaje, enHorario, MENU } = require('../src/bot');
const { extraerMensajes } = require('../src/whatsapp');

const LUNES_10H = new Date(2026, 9, 19, 10, 0);
const DOMINGO_10H = new Date(2026, 9, 25, 10, 0);

const opts = (extra = {}) => ({
  ahora: LUNES_10H,
  horaInicio: 9,
  horaFin: 19,
  consultarEnvio: async (n) => (n === 'ENV12345678' ? { estado: 'En reparto' } : null),
  ...extra,
});

test('el primer mensaje muestra el menú', async () => {
  const r = await procesarMensaje({ paso: 'inicio' }, 'qué tal', opts());
  assert.strictEqual(r.respuesta, MENU);
  assert.deepStrictEqual(r.sesion, { paso: 'menu' });
});

test('"Menú" con tilde vuelve al menú desde cualquier paso', async () => {
  const r = await procesarMensaje({ paso: 'con_agente' }, 'Menú', opts());
  assert.strictEqual(r.respuesta, MENU);
});

test('consulta de envío encontrado', async () => {
  const r1 = await procesarMensaje({ paso: 'menu' }, '1', opts());
  assert.strictEqual(r1.sesion.paso, 'esperando_envio');
  const r2 = await procesarMensaje(r1.sesion, 'env 1234 5678', opts());
  assert.match(r2.respuesta, /En reparto/);
  assert.strictEqual(r2.sesion.paso, 'menu');
});

test('consulta de envío no encontrado e inválido', async () => {
  const noExiste = await procesarMensaje({ paso: 'esperando_envio' }, 'ABC99999999', opts());
  assert.match(noExiste.respuesta, /No hemos encontrado/);
  const invalido = await procesarMensaje({ paso: 'esperando_envio' }, '12', opts());
  assert.match(invalido.respuesta, /no parece válido/);
  assert.strictEqual(invalido.sesion.paso, 'esperando_envio');
});

test('derivar a agente dentro y fuera de horario', async () => {
  const dentro = await procesarMensaje({ paso: 'menu' }, '4', opts());
  assert.ok(dentro.derivarAgente);
  assert.match(dentro.respuesta, /agente/);
  const fuera = await procesarMensaje({ paso: 'menu' }, '4', opts({ ahora: DOMINGO_10H }));
  assert.match(fuera.respuesta, /fuera de horario/);
  // Mientras está con un agente, el bot no contesta.
  const silencio = await procesarMensaje(fuera.sesion, 'hola?', opts());
  assert.strictEqual(silencio.respuesta, '');
});

test('opción desconocida', async () => {
  const r = await procesarMensaje({ paso: 'menu' }, 'xyz', opts());
  assert.match(r.respuesta, /No he entendido/);
});

test('enHorario', () => {
  assert.ok(enHorario(LUNES_10H, { horaInicio: 9, horaFin: 19 }));
  assert.ok(!enHorario(DOMINGO_10H, { horaInicio: 9, horaFin: 19 }));
  assert.ok(!enHorario(new Date(2026, 9, 19, 19, 0), { horaInicio: 9, horaFin: 19 }));
});

test('extraerMensajes lee el payload del webhook', () => {
  const body = {
    entry: [{ changes: [{ value: { messages: [
      { from: '34600000000', id: 'a', type: 'text', text: { body: 'hola' } },
      { from: '34600000000', id: 'b', type: 'image', image: {} },
    ] } }] }],
  };
  assert.deepStrictEqual(extraerMensajes(body), [{ de: '34600000000', texto: 'hola', id: 'a' }]);
  assert.deepStrictEqual(extraerMensajes({}), []);
});
