# An231970-
Antonio Cerezo

## Proyecto WhatsApp ATC

Bot de **Atención al Cliente (ATC) por WhatsApp**, construido con Node.js y la
[WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) de Meta.

### Qué hace

Al escribir al número de WhatsApp, el cliente recibe un menú:

1. **Consultar el estado de un envío**: pide el número de envío y devuelve su estado.
2. **Horarios de atención**.
3. **Preguntas frecuentes**.
4. **Hablar con un agente**: deriva la conversación a una persona (y avisa si es fuera de horario).

Escribiendo `menu` en cualquier momento se vuelve al inicio.

### Estructura

```
src/
  server.js    Servidor Express con el webhook (GET verificación, POST mensajes)
  bot.js       Lógica de la conversación (menú, pasos, respuestas)
  whatsapp.js  Envío de mensajes y lectura del payload de Meta
  envios.js    Consulta del estado de envíos (ahora con datos de ejemplo)
  sesiones.js  Estado de cada conversación (en memoria)
  config.js    Configuración desde variables de entorno
test/          Pruebas (node --test)
```

### Puesta en marcha

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y rellena:
   - `WHATSAPP_ACCESS_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` (desde la app de Meta for Developers, producto WhatsApp).
   - `WHATSAPP_VERIFY_TOKEN`: una cadena que tú elijas.
3. Arranca el servidor:
   ```bash
   npm start
   ```
4. Expón el servidor con una URL pública HTTPS (por ejemplo con `ngrok http 3000`) y en Meta configura el webhook:
   - URL de devolución: `https://<tu-dominio>/webhook`
   - Token de verificación: el mismo que `WHATSAPP_VERIFY_TOKEN`
   - Suscríbete al campo **messages**.

### Pruebas

```bash
npm test
```

### Próximos pasos

- Conectar `src/envios.js` con el sistema real de seguimiento de envíos.
- Guardar las sesiones en Redis o una base de datos.
- Integrar la derivación a agente con la herramienta de ATC (bandeja compartida, CRM, etc.).
