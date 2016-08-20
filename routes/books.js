'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.register = register;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').load();
var DATASTORE_API_KEY = process.env.DATASTORE_API_KEY || '';
var gcloud = require('google-cloud');
var ds = gcloud.datastore({
    projectId: 'node-hapi',
    keyFilename: _path2.default.join(_path2.default.resolve(), 'keyfile.json')
});
var kind = 'Book';
function register(server, options, next) {
    server.route({
        method: 'GET',
        path: '/books',
        handler: function handler(request, reply) {
            var q = ds.createQuery([kind]).limit(10).order('name').start();
            ds.runQuery(q, function (err, entities, nextQuery) {
                if (err) {
                    return reply(_boom2.default.wrap(err, 500, 'Internal error'));
                }
                console.log(entities);
                reply(entities);
            });
        }
    });
    server.route({
        method: 'GET',
        path: '/books/{id}',
        handler: function handler(request, reply) {
            var id = +request.params['id'];
            var key = ds.key([kind, id]);
            ds.get(key, function (err, entity) {
                if (err) {
                    return reply(_boom2.default.wrap(err, 500, 'Internal error'));
                }
                console.log(entity);
                reply(entity);
            });
        }
    });
    server.route({
        method: 'POST',
        path: '/books',
        handler: function handler(request, reply) {
            var book = request.payload;
            console.log(book);
            ds.save({
                key: ds.key(kind),
                data: book
            }, function (err, result) {
                if (err) {
                    return reply(_boom2.default.wrap(err, 500, 'Internal error'));
                }
                result.mutationResults.forEach(function (a) {
                    return console.log(a);
                });
                reply(result);
            });
        },
        config: {
            validate: {
                payload: {
                    name: _joi2.default.string().min(1).max(50).required(),
                    description: _joi2.default.string().min(1).max(50).required()
                }
            }
        }
    });

    return next();
}
;
register['attributes'] = {
    name: 'routes-books'
};