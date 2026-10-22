// Almacén en memoria del estado de cada conversación, por número de teléfono.
// Para producción con varias instancias conviene usar Redis o una base de datos.

const sesiones = new Map();

module.exports = {
  obtener: (telefono) => sesiones.get(telefono) || { paso: 'inicio' },
  guardar: (telefono, sesion) => sesiones.set(telefono, sesion),
  reiniciar: (telefono) => sesiones.delete(telefono),
};
