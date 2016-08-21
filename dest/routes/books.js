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

var _cloudant = require('../cloudant');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};

var gcloud = require('google-cloud');
var ds = gcloud.datastore({
    projectId: 'node-hapi',
    keyFilename: _path2.default.join(_path2.default.resolve(), 'keyfile.json')
});
var kind = 'Book';

var cc = new _cloudant.CloudantController();
function register(server, options, next) {
    var _this = this;

    server.route({
        method: 'GET',
        path: '/test',
        handler: function handler(request, reply) {
            reply('test is ok.');
        }
    });
    server.route({
        method: 'GET',
        path: '/cloudant',
        handler: function handler(request, reply) {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                var result;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return cc.searchDocument('mydb', 'mydbdoc', 'mydbsearch', 'テキスト');

                            case 2:
                                result = _context.sent;

                                console.log(result);
                                reply(result);

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    });
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