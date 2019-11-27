# monaco-editor-builder

> A script to build monaco-editor workers using parcel

This package will

- 1. Find `monaco-editor` in your project
- 2. Build all files ending with `.worker.js` using [Parcel](https://parceljs.org/)
- 3. Save them in your `public` folder
- 4. Generate a `monacoWorkerManifest.json` file in your `src` folder

## Usage

1. Install `monaco-editor`

```bash
yarn add monaco-editor
# or
npm install monaco-editor
```

2. Install `monaco-editor-builder`

```bash
yarn add monaco-editor-builder
# or
npm install monaco-editor-builder
```

3. Add a script to build workers

```json
{
  "scripts": {
    "build:monaco": "monaco-editor-builder"
  }
}
```

4. Don't forget to run this scripts in production

```json
{
  "scripts": {
    "build": "npm run build:monaco && react-scripts build",
    "build:monaco": "monaco-editor-builder"
  }
}
```

5. Setup monaco-editor

```js
// src/index.js
import * as monaco from "monaco-editor";
import monacoWorkers from "./monacoWorkerManifest.json";

// Since packaging is done by you, you need
// to instruct the editor how you named the
// bundles that contain the web workers.
self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    if (label === "json") {
      return monacoWorkers["language/json/json.worker.js"];
    }
    if (label === "css") {
      return monacoWorkers["language/css/css.worker.js"];
    }
    if (label === "html") {
      return monacoWorkers["language/html/html.worker.js"];
    }
    if (label === "typescript" || label === "javascript") {
      return monacoWorkers["language/typescript/ts.worker.js"];
    }
    return monacoWorkers["editor/editor.worker.js"];
  }
};

monaco.editor.create(document.getElementById("container"), {
  value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  language: "javascript"
});
```
