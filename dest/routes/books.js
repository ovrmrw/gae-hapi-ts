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
        path: '/cloudant/{db}',
        handler: function handler(request, reply) {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                var db, result;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                db = request.params['db'];
                                _context.next = 3;
                                return cc.searchDocument(db, 'mydbdoc', 'mydbsearch', 'テキスト');

                            case 3:
                                result = _context.sent;

                                console.log(result);
                                reply(result);

                            case 6:
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
        path: '/cloudant/{db}/{id}',
        handler: function handler(request, reply) {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var db, id, result;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                db = request.params['db'];
                                id = request.params['id'];
                                _context2.next = 4;
                                return cc.getDocument(db, id);

                            case 4:
                                result = _context2.sent;

                                console.log(result);
                                reply(result);

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    });
    server.route({
        method: 'POST',
        path: '/cloudant/{db}',
        handler: function handler(request, reply) {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var db, data, result;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                db = request.params['db'];
                                data = request.payload;
                                _context3.next = 4;
                                return cc.insertDocument(db, data);

                            case 4:
                                result = _context3.sent;

                                console.log(result);
                                reply(result);

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        },
        config: {
            validate: {
                payload: {
                    name: _joi2.default.string().min(1).max(50).required(),
                    crazy: _joi2.default.bool().required()
                }
            }
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