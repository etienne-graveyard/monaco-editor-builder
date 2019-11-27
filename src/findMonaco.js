const fse = require("fs-extra");
const path = require("path");

function resolve(cwd) {
  if (fse.pathExistsSync(cwd) === false) {
    throw new Error(`Folder ${cwd} does not exist !`);
  }
  const nodeModules = path.resolve(cwd, "node_modules");
  if (fse.pathExistsSync(nodeModules)) {
    const monacoModule = path.resolve(nodeModules, "monaco-editor");
    if (fse.pathExistsSync(monacoModule)) {
      const monacoPackage = path.resolve(monacoModule, "package.json");
      if (fse.pathExistsSync(monacoPackage)) {
        const pkg = fse.readJsonSync(monacoPackage);
        if (pkg.name === "monaco-editor") {
          return monacoModule;
        }
      }
    }
  }
  if (cwd === "/") {
    throw new Error(`Cannot find monaco-editor`);
  }
  const parent = path.dirname(cwd);
  return resolve(parent);
}

module.exports = resolve;
