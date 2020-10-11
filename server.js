const env = require('dotenv');

env.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 8080;

// init the app on ${port}
app.listen(port, () => {
  console.log(`phaser server is running on port: ${port}`);
});
