import Boom from 'boom';
import uuid from 'node-uuid';
import Joi from 'joi';
import Hapi from 'hapi';
import path from 'path';
import { CloudantController, DocumentBase, SearchResult } from '../cloudant';

//////////////////////////////////////////////////////////////
// Google Cloud Datastore
const gcloud = require('google-cloud');
const ds = gcloud.datastore({
  projectId: 'hapi-from-azure',
  keyFilename: path.join(path.resolve(), 'keyfile.json')
});
const kind = 'Book';

console.log(path.join(path.resolve(), 'keyfile.json'))

//////////////////////////////////////////////////////////////
// IBM Cloudant
const cc = new CloudantController();


export function register(server: Hapi.Server, options, next) {

  server.route({
    method: 'GET',
    path: '/test',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {
      reply('test is ok.');
    }
  });

  server.route({
    method: 'GET',
    path: '/cloudant/{db}',
    handler: async (request: Hapi.Request, reply: Hapi.IReply) => {
      const db: string = request.params['db'];
      const result = await cc.searchDocument(db, 'mydbdoc', 'mydbsearch', 'テキスト');
      console.log(result);
      reply(result);
    }
  });

  server.route({
    method: 'GET',
    path: '/cloudant/{db}/{id}',
    handler: async (request: Hapi.Request, reply: Hapi.IReply) => {
      const db: string = request.params['db'];
      const id: string = request.params['id'];
      const result = await cc.getDocument(db, id);
      console.log(result);
      reply(result);
    }
  })

  server.route({
    method: 'POST',
    path: '/cloudant/{db}',
    handler: async (request: Hapi.Request, reply: Hapi.IReply) => {
      const db: string = request.params['db'];
      const data = request.payload;
      const result = await cc.insertDocument(db, data);
      console.log(result);
      reply(result);
    },
    config: {
      validate: {
        payload: {
          name: Joi.string().min(1).max(50).required(),
          crazy: Joi.bool().required()
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/books',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {
      const q = ds.createQuery([kind])
        .limit(10)
        .order('name')
        .start();

      ds.runQuery(q, function (err, entities, nextQuery) {
        if (err) {
          return reply(Boom.wrap(err, 500, 'Internal error'))
        }
        console.log(entities);
        reply(entities);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/books/{id}',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {
      const id: number = +request.params['id'];
      const key = ds.key([kind, id]);
      ds.get(key, function (err, entity) {
        if (err) {
          return reply(Boom.wrap(err, 500, 'Internal error'));
        }
        console.log(entity);
        reply(entity);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/books',
    handler: (request: Hapi.Request, reply: Hapi.IReply) => {
      const book = request.payload;
      console.log(book);
      ds.save({
        key: ds.key(kind),
        data: book
      }, (err, result) => {
        if (err) {
          return reply(Boom.wrap(err, 500, 'Internal error'));
        }
        result.mutationResults.forEach(a => console.log(a));
        reply(result);
      });
    },
    config: {
      validate: {
        payload: {
          name: Joi.string().min(1).max(50).required(),
          description: Joi.string().min(1).max(50).required()
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
