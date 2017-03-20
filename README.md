babel-plugin-transform-es2015-modules-ui5
=========================================

A babel plugin to transform ES6 / ES2015 modules to the UI5 module system (sap.ui.define).

## Install

```sh
$ npm install --save-dev babel-plugin-transform-es2015-modules-ui5
```

## Usage

Add to .babelrc:

```json
{
  "plugins": [
    "transform-es2015-modules-ui5"
  ]
}
```

## How does it work / what does it transform?

### ES6 default imports and exports:

source
```js
import foo from 'bar';
import mylib from 'mylib';

foo.blub();

export default 42;
```

compiled
```js
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
```

### ES6 named exports

source
```js
export const foo = '42';
export const bar = '1337';
```

compiled
```js
sap.ui.define([], function () {
  var exports = {};
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const foo = exports.foo = '42';
  const bar = exports.bar = '1337';
  return exports;
});
```

## Important limitations / design decisions

Your modules can only export a single default export or multiple named exports, but not both at the same time (which is normally valid in ES6 modules).
For example this is valid:
```js
export default function(foo){ return foo;}
```

```js
export const foo = 'bar';
export const bla = 'blub';
```

but NOT this:
```js
export const foo = 'bar';
export default function(foo) { return foo;}
```


This is a conscious design decision and not a bug. The motivation is to make the consumption of modules which expose a default export easier, when importing those modules from a non-ES6 module (this for example also applies if you write a custom control using ES6 syntax but want to load it via an XMLView).
If you by accident create a module with named and default exports the plugin will throw precise error message pointing you to the faulty code, so no don't worry if you or your team member forgets this rule.

## Credits

This plugin is basically inspired / a fork of https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-es2015-modules-amd , which is at the time of writing mostly maintained by https://github.com/kittens and https://github.com/hzoo and licensed under MIT license.

## License

MIT © [Christian Theilemann](https://github.com/geekflyer)


