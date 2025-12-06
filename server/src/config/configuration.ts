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

      deviceRequest: process.env.MQTT_DEVICE_REQUEST,
      deviceResponse: process.env.MQTT_DEVICE_RESPONSE,
    },
  },
});
