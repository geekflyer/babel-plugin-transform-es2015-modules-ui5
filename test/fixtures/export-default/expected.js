sap.ui.define(['foo', 'mylib'], function (foo, mylib) {
  var exports = {};

  foo.blub();

  exports.default = 42;

  return exports.default;

});