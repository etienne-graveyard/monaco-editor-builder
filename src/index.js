const arg = require("arg");
const findMonaco = require("./findMonaco");
const path = require("path");
const klawSync = require("klaw-sync");
const fse = require("fs-extra");
const Bundler = require("parcel-bundler");
const saveFile = require("./saveFile");

const spec = {
  "--outdir": String,
  "--manifest": String,
  "--public": String
};

module.exports = run;

async function run(argv) {
  const monacoPath = findMonaco(process.cwd());
  console.log(`Found monaco-editor in ${monacoPath}`);

  const args = {
    "--manifest": "src/monacoWorkerManifest.json",
    "--outdir": "public/monaco-workers",
    "--public": "public",
    ...arg(spec, {
      argv: argv.slice(1)
    })
  };

  const output = path.resolve(process.cwd(), args["--outdir"]);
  const public = path.resolve(process.cwd(), args["--public"]);
  const manifest = path.resolve(process.cwd(), args["--manifest"]);
  fse.emptyDirSync(output);

  const esm = path.resolve(monacoPath, "esm/vs");
  const workers = klawSync(esm)
    .filter(item => {
      return item.path.endsWith(".worker.js");
    })
    .map(item => {
      return {
        ...item,
        name: path.relative(esm, item.path)
      };
    });
  console.log(`Found ${workers.length} workers to build`);

  await buildWorkersFiles(workers, output);
  await generateWorkerManifest(workers, manifest, output, public);
}

async function buildWorkersFiles(workers, outputPath) {
  let queue = [...workers];

  async function dequeue() {
    const nextWorker = queue.shift();
    if (!nextWorker) {
      return;
    }
    console.log(`Building ${nextWorker.name}`);
    try {
      const config = getParceConfig(nextWorker.name, outputPath);
      const bundler = new Bundler(nextWorker.path, config);
      await bundler.bundle();
      if (queue.length === 0) {
        return;
      }
      await dequeue();
    } catch (error) {
      console.error(error);
    }
  }

  await dequeue();
}

function getParceConfig(name, outputPath) {
  const outDir = path.dirname(path.resolve(outputPath, name));
  return {
    outDir,
    outFile: path.basename(name),
    watch: false,
    sourceMaps: false,
    logLevel: 1
  };
}

async function generateWorkerManifest(
  workers,
  manifestPath,
  outputPath,
  publicPath
) {
  console.log("Generating worker-manifest.json");
  const content = workers.reduce((acc, worker) => {
    const outFile = path.resolve(outputPath, worker.name);
    acc[worker.name] = "/" + path.relative(publicPath, outFile);
    return acc;
  }, {});
  const contentStr = JSON.stringify(content);
  await saveFile(manifestPath, contentStr);
}
