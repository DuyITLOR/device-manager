export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '5050', 10),
    env: process.env.NODE_ENV,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  mqtt: {
    host: process.env.MQTT_HOST,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,

    topic: {
      rfidcode: process.env.MQTT_RFID_TOPIC,
      nameRespone: process.env.MQTT_NAME_TOPIC,

      deviceCheckLoan: process.env.MQTT_DEVICE_CHECK_LOAN,
      deviceCheckReturn: process.env.MQTT_DEVICE_CHECK_RETURN,
      deviceCheckResponse: process.env.MQTT_DEVICE_CHECK_RESPONSE,

      deviceSubmitLoan: process.env.MQTT_DEVICE_SUBMIT_LOAN,
      deviceSubmitReturn: process.env.MQTT_DEVICE_SUBMIT_RETURN,
      deviceSubmitResponse: process.env.MQTT_DEVICE_SUBMIT_RESPONSE,
    },
  },
});
