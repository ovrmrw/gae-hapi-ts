'use strict';

require('babel-polyfill');

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _hapi2.default.Server();
server.connection({
    host: '0.0.0.0',
    port: process.env.PORT || 3000
});
server.register([{
    register: require('./routes/books')
}], function (err) {
    if (err) {
        throw err;
    }
    server.start(function (err) {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});