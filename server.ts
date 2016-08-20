import 'babel-polyfill';
import Hapi from 'hapi';


const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 3000,
  routes: {
    cors: true,
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
});


server.register([
  {
    register: require('./routes/books')
  }
], (err) => {
  if (err) { throw err; }

  server.start((err) => {
    if (err) { throw err; }
    console.log('Server running at:', server.info.uri);
  });

});
