const { createApp } = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`BFF listening on http://localhost:${config.port}`);
  console.log(`Proxying to Quarkus at ${config.quarkusUrl}`);
});
