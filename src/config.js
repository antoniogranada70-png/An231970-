require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  horaInicio: Number(process.env.ATC_HORA_INICIO) || 9,
  horaFin: Number(process.env.ATC_HORA_FIN) || 19,
};
