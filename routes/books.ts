import Boom from 'boom';
import uuid from 'node-uuid';
import Joi from 'joi';
import Hapi from 'hapi';

export function register(server: Hapi.Server, options, next) {

  server.route({
    method: 'GET',
    path: '/books',
    handler: (request: Hapi.Request, reply: Hapi.IStrictReply<string>) => {

      // db.books.find((err, docs) => {

      //     if (err) {
      //         return reply(Boom.wrap(err, 404, 'Internal MongoDB error'));
      //     }

      //     reply(docs);
      // });
      reply('hello');
    }
  });

  server.route({
    method: 'GET',
    path: '/books/{id}',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {

      // db.books.findOne({
      //     _id: request.params.id
      // }, (err, doc) => {

      //     if (err) {
      //         return reply(Boom.wrap(err, 404, 'Internal MongoDB error'));
      //     }

      //     if (!doc) {
      //         return reply(Boom.notFound());
      //     }

      //     reply(doc);
      // });
      reply(request.params['id']);
    }
  });

  server.route({
    method: 'POST',
    path: '/books',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {

      const book = request.payload;

      //Create an id
      book._id = uuid.v1();

      // db.books.save(book, (err, result) => {

      //   if (err) {
      //     return reply(Boom.wrap(err, 404, 'Internal MongoDB error'));
      //   }

      //   reply(book);
      // });
      reply(book);
    },
    config: {
      validate: {
        payload: {
          title: Joi.string().min(10).max(50).required(),
          author: Joi.string().min(10).max(50).required(),
          isbn: Joi.number()
        }
      }
    }
  });

  // server.route({
  //     method: 'PATCH',
  //     path: '/books/{id}',
  //     handler: function (request, reply) {

  //         db.books.update({
  //             _id: request.params.id
  //         }, {
  //                 $set: request.payload
  //             }, function (err, result) {

  //                 if (err) {
  //                     return reply(Boom.wrap(err, 404, 'Internal MongoDB error'));
  //                 }

  //                 if (result.n === 0) {
  //                     return reply(Boom.notFound());
  //                 }

  //                 reply().code(204);
  //             });
  //     },
  //     config: {
  //         validate: {
  //             payload: Joi.object({
  //                 title: Joi.string().min(10).max(50).optional(),
  //                 author: Joi.string().min(10).max(50).optional(),
  //                 isbn: Joi.number().optional()
  //             }).required().min(1)
  //         }
  //     }
  // });

  // server.route({
  //     method: 'DELETE',
  //     path: '/books/{id}',
  //     handler: function (request, reply) {

  //         db.books.remove({
  //             _id: request.params.id
  //         }, function (err, result) {

  //             if (err) {
  //                 return reply(Boom.wrap(err, 404, 'Internal MongoDB error'));
  //             }

  //             if (result.n === 0) {
  //                 return reply(Boom.notFound());
  //             }

  //             reply().code(204);
  //         });
  //     }
  // });

  return next();
};

register['attributes'] = {
  name: 'routes-books'
};
