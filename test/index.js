const babel = require("babel-core");
const chai = require('chai');
const fs = require('fs');
chai.use(require('chai-string'));

const expect = chai.expect;

// generic runner

const dirs = fs.readdirSync(__dirname + '/fixtures').map(dir => __dirname + '/fixtures/' + dir);

const transpile = source => babel.transform(source, {
  "plugins": [
    [
      "./src/index.js",
      {
        "strict": false
      }
    ]
  ]
}).code;

describe('all', function () {

  dirs.forEach(dir => {
    const source = fs.readFileSync(dir + '/actual.js', {encoding: 'utf8'});
    const expected = fs.readFileSync(dir + '/expected.js', {encoding: 'utf8'});

    it(`fixture: ${dir}`, function () {
      expect(transpile(source)).to.equalIgnoreSpaces(expected);
    });
  });

});


