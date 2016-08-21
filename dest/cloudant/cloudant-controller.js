'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CloudantController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cloudant = require('cloudant');
try {
    require('dotenv').load();
} catch (err) {}
var account = process.env.CLOUDANT_USERNAME || '';
var key = process.env.CLOUDANT_API_KEY || '';
var password = process.env.CLOUDANT_API_PASSWORD || '';

var CloudantController = exports.CloudantController = function () {
    function CloudantController() {
        _classCallCheck(this, CloudantController);

        this.cloudant = Cloudant({ account: account, key: key, password: password });
    }

    _createClass(CloudantController, [{
        key: 'createDatabase',
        value: function createDatabase(dbName) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.cloudant.db.create(dbName, function (err, body, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Create Database');
                    console.log(body);
                    resolve(body);
                });
            });
        }
    }, {
        key: 'dropDatabase',
        value: function dropDatabase(dbName) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.cloudant.db.destroy(dbName, function (err, body, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Destroy Database');
                    console.log(body);
                    resolve(body);
                });
            });
        }
    }, {
        key: 'use',
        value: function use(dbName) {
            return this.cloudant.db.use(dbName);
        }
    }, {
        key: 'insertDocument',
        value: function insertDocument(dbName, insertObj, _id) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                var db = _this3.use(dbName);
                var temp = _lodash2.default.defaultsDeep(insertObj, _id ? { _id: _id } : {});
                db.insert(temp, function (err, body, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Insert Document');
                    console.log(body);
                    resolve(body);
                });
            });
        }
    }, {
        key: 'getDocument',
        value: function getDocument(dbName, _id) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                var db = _this4.use(dbName);
                db.get(_id, function (err, data, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Get Document');
                    console.log(data);
                    resolve(data);
                });
            });
        }
    }, {
        key: 'deleteDocument',
        value: function deleteDocument(dbName, deleteObj) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var db = _this5.use(dbName);
                db.destroy(deleteObj._id, deleteObj._rev, function (err, body, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Delete Document');
                    console.log(body);
                    resolve(body);
                });
            });
        }
    }, {
        key: 'searchDocument',
        value: function searchDocument(dbName, designName, indexName, searchText) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                var db = _this6.use(dbName);
                db.search(designName, indexName, { q: searchText }, function (err, result, header) {
                    if (err) {
                        console.error(err);
                        reject(null);
                        return;
                    }
                    console.log('Search Document');
                    console.log(result);
                    resolve(result);
                });
            });
        }
    }]);

    return CloudantController;
}();