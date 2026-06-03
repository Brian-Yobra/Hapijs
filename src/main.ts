import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { userRoutes } from './routes/users.js';

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 1234,
    host: '0.0.0.0',
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        status: 'Healthy ✅',
        message: 'Environment Complete'
      };
    },
  });

  server.route(userRoutes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
