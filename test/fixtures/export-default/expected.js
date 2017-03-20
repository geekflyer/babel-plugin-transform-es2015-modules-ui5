sap.ui.define(['bar', 'mylib'], function (_bar, _mylib) {
  var exports = {};
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _bar2 = _interopRequireDefault(_bar);
  var _mylib2 = _interopRequireDefault(_mylib);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
      };
  }

  _bar2.default.blub();

  exports.default = 42;

  return exports.default;

});