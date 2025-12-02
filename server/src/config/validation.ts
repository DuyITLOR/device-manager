import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5050),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  MQTT_HOST: Joi.string().required(),
  MQTT_USERNAME: Joi.string().required(),
  MQTT_PASSWORD: Joi.string().required(),
  MQTT_RFID_TOPIC: Joi.string().required(),
  MQTT_NAME_TOPIC: Joi.string().required(),
  MQTT_CHECK_REQUEST_AVAIABLE: Joi.string().required(),
  MQTT_CHECK_RESPONSE_AVAIABLE: Joi.string().required(),
});
