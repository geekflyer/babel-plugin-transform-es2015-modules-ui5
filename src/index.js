import template from "babel-template";

const buildDefine = template(`
  sap.ui.define(MODULE_NAME, [SOURCES], FACTORY);
`);

const buildFactory = template(`
  (function (PARAMS) {
    BODY;
  })
`);

export default function ({ types: t }) {
  function isValidRequireCall(path) {
    if (!path.isCallExpression()) return false;
    if (!path.get("callee").isIdentifier({ name: "require" })) return false;
    if (path.scope.getBinding("require")) return false;

    const args = path.get("arguments");
    if (args.length !== 1) return false;

    const arg = args[0];
    if (!arg.isStringLiteral()) return false;

    return true;
  }

  const amdVisitor = {
    MemberExpression(path) {
      // check whether module has default and/or named exports
      const node = path.node;
      if (node.object.name === 'exports' && node.property.name === 'default')
      {
        this.hasDefaultExport = true;
      }
      if (node.object.name === 'exports' && node.property.name !== 'default') {
        this.anyNamedExport = node.property.name;
      }
    },

    CallExpression(path) {
      if (!isValidRequireCall(path)) return;
      this.bareSources.push(path.node.arguments[0]);
      path.remove();
    },

    VariableDeclarator(path) {
      const id = path.get("id");
      if (!id.isIdentifier()) return;

      const init = path.get("init");
      if (!isValidRequireCall(init)) return;

      const source = init.node.arguments[0];
      this.sourceNames[source.value] = true;
      this.sources.push([id.node, source]);

      path.remove();
    }
  };

  return {
    inherits: require("babel-plugin-transform-es2015-modules-commonjs"),

    pre() {
      // source strings
      this.sources = [];
      this.sourceNames = Object.create(null);

      // bare sources
      this.bareSources = [];

      //
      this.hasDefaultExport = false;
      this.anyNamedExport = undefined;
    },

    visitor: {
      Program: {
        exit(path) {
          if (this.ran) return;
          this.ran = true;

          path.traverse(amdVisitor, this);

          if (this.hasDefaultExport && this.anyNamedExport) {
            throw path.buildCodeFrameError(`
          Your module specifies a default export and a named export: ${this.anyNamedExport}. 
          When targeting the UI5 module system you can only have a default export ('export default ...') OR multiple named exports ('export const foo = "bar"') per module, bot not both.`);
          }

          const params = this.sources.map((source) => source[0]);
          let sources = this.sources.map((source) => source[1]);

          sources = sources.concat(this.bareSources.filter((str) => {
              return !this.sourceNames[str.value];
        }));

          let moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          if (this.hasDefaultExport || this.anyNamedExport) {
            const exportsIdentifier = t.identifier('exports');

            const exportInitializer = t.variableDeclaration('var',
              [
                t.variableDeclarator(exportsIdentifier,
                  t.objectExpression([]))
              ]);
            path.unshiftContainer('body', exportInitializer);

            if (this.hasDefaultExport) {
              path.pushContainer('body', t.returnStatement(t.memberExpression(exportsIdentifier, t.identifier('default'))))
            } else {
              path.pushContainer('body', t.returnStatement(exportsIdentifier));
            }
          }

          const { node } = path;
          const factory = buildFactory({
            PARAMS: params,
            BODY: node.body
          });
          factory.expression.body.directives = node.directives;
          node.directives = [];

          node.body = [buildDefine({
            MODULE_NAME: moduleName,
            SOURCES: sources,
            FACTORY: factory
          })];
        }
      }
    }
  };
}