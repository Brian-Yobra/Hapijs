import Hapi from '@hapi/hapi';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as HapiSwagger from 'hapi-swagger';

import { userRoutes } from './routes/users.js';


const init = async () => {
  const server = Hapi.server({
    port: 1234,
    host: '0.0.0.0',
    debug: {
      request: ['error'],
      log: ['error', 'info'],
    },
  });
  const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: { title: 'My Hapi API Documentation', version: '1.0.0' },
  };
  // 1. Register the bare module plugins together
  await server.register([Inert, Vision]);

  await server.register({
    plugin: HapiSwagger as Hapi.Plugin<HapiSwagger.RegisterOptions>,
    options: swaggerOptions,
  });


  server.route({
    method: 'GET',
    path: '/',
    handler: (_, h) => {
      return {
        status: 'Healthy ✅',
        message: 'Environment Complete'
      };
    },
  });

  server.route(userRoutes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
  server.events.on('response', (request) => {
    const status = request.response instanceof Error
      ? (request.response as any).output.statusCode
      : (request.response as Hapi.ResponseObject).statusCode;
    console.log(`${request.method.toUpperCase()} ${request.path} → ${status}`);
  });
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
