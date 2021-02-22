"use strict";

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _lib = _interopRequireDefault(require("../../Core/lib"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  console.log('启动服务中...');
  const core = new _lib.default();
  core.run();
};