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
  });