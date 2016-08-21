'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cloudantController = require('./cloudant-controller');

Object.keys(_cloudantController).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _cloudantController[key];
    }
  });
});