const prettier = require("prettier");
const fse = require("fs-extra");
const p = require("path");

async function saveFile(path, content) {
  await fse.ensureDir(p.dirname(path));
  const prettierConf = await prettier.resolveConfig(path);
  const formatted = prettier.format(content, {
    ...prettierConf,
    filepath: path
  });
  await fse.writeFile(path, formatted);
}

module.exports = saveFile;
