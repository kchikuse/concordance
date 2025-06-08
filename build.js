const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { promisify } = require("util");

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);

const SRC_DIR = ".";
const DIST_DIR = "./dist";
const TEMP_DIR = "./.temp";

const LOCALHOST = "http://localhost/scripture/";
const DOMAIN = "https://scripture.pages.dev/";

async function ensurePackages() {
  console.log("Checking for required packages...");

  try {
    if (!fs.existsSync("package.json")) {
      console.log("No package.json found, creating one...");
      execSync("npm init -y", { stdio: "inherit" });
    }

    console.log("Installing build dependencies...");

    execSync(
      "npm install --save-dev rollup @rollup/plugin-terser html-minifier csso",
      {
        stdio: "inherit",
      }
    );
  } catch (error) {
    console.error("Failed to install packages:", error);
    process.exit(1);
  }
}

async function cleanDirectory(dir) {
  console.log(`Cleaning directory: ${dir}...`);

  const { rm } = require("fs/promises");

  if (fs.existsSync(dir)) {
    await rm(dir, { recursive: true, force: true });
  }

  await mkdir(dir, { recursive: true });
  console.log(`Created empty directory: ${dir}`);
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function safeCopyFile(src, dest) {
  try {
    await ensureDir(path.dirname(dest));
    await copyFile(src, dest);
  } catch (error) {
    console.warn(`Could not copy ${src} - ${error.message}`);
  }
}

async function processCss() {
  console.log("Processing CSS...");
  const csso = require("csso");
  const cssFilePath = path.join(SRC_DIR, "assets/styles.css");
  const cssContent = await readFile(cssFilePath, "utf8");
  const minifiedCss = csso.minify(cssContent).css;
  return minifiedCss;
}

async function processJavaScript() {
  console.log("Bundling and minifying JavaScript...");

  const terser = require("@rollup/plugin-terser");
  const rollup = require("rollup");

  const bundleFileName = "bundle.min.js";
  const scriptsToBundle = [
    "assets/scripts/services/SQLiteService.js",
    "assets/scripts/services/DatabaseService.js",
    "assets/scripts/Concordance.js",
  ];

  const concatenatedCode = (
    await Promise.all(
      scriptsToBundle.map((file) => readFile(path.join(SRC_DIR, file), "utf8"))
    )
  ).join("\n\n//---\n\n");

  const tempBundlePath = path.join(TEMP_DIR, "bundle.js");
  await writeFile(tempBundlePath, concatenatedCode);

  const bundle = await rollup.rollup({
    input: tempBundlePath,
    plugins: [
      terser({
        compress: true,
        mangle: true,
        format: { comments: false },
      }),
    ],
  });

  await bundle.write({
    file: path.join(DIST_DIR, "assets/scripts", bundleFileName),
    format: "iife",
  });

  console.log(`JavaScript bundled into ${bundleFileName}.`);
  return bundleFileName;
}

async function processHtml(minifiedCss, bundleFileName) {
  console.log("Processing HTML...");

  const minifier = require("html-minifier");
  const htmlPath = path.join(SRC_DIR, "index.html");
  let htmlContent = await readFile(htmlPath, "utf8");

  // Process LD+JSON specifically before general HTML minification
  htmlContent = htmlContent.replace(
    /<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g,
    (match, jsonContent) => {
      try {
        const parsedJson = JSON.parse(jsonContent);
        const minifiedLdJson = JSON.stringify(parsedJson);
        return `<script type="application/ld+json">${minifiedLdJson}</script>`;
      } catch (error) {
        console.warn("could not minify LD+JSON content", error);
        return match;
      }
    }
  );

  // Replace domain placeholders
  htmlContent = htmlContent.replaceAll(LOCALHOST, DOMAIN);

  // Replace external CSS with inlined CSS
  htmlContent = htmlContent.replace(
    /<link rel="stylesheet" href="assets\/styles.css" \/>/,
    `<style>${minifiedCss}</style>`
  );

  // Replace the block of individual script tags with the bundled versions
  const scriptBlockRegex =
    /<script src="assets\/scripts\/libs\/sql-wasm\.js"><\/script>[\s\S]*?<script src="assets\/scripts\/Concordance\.js"><\/script>/;
  const newScriptBlock = `<script src="assets/scripts/libs/sql-wasm.js"></script>\n    <script src="assets/scripts/${bundleFileName}"></script>`;
  htmlContent = htmlContent.replace(scriptBlockRegex, newScriptBlock);

  const minifiedHtml = minifier.minify(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });

  await writeFile(path.join(DIST_DIR, "index.html"), minifiedHtml);
  console.log("HTML processed and minified.");
}

async function processServiceWorker(bundleFileName) {
  console.log("Processing service worker...");

  const terser = require("@rollup/plugin-terser");
  const rollup = require("rollup");
  const swPath = path.join(SRC_DIR, "service-worker.js");
  let swContent = await readFile(swPath, "utf8");

  const newStaticResources = `const STATIC_RESOURCES = [
  "/",
  "index.html",
  "favicon.ico",
  "manifest.json",
  "robots.txt",
  ".htaccess",
  "assets/kjv.sqlite",
  "assets/db-version.json",
  "assets/scripts/${bundleFileName}",
  "assets/scripts/libs/sql-wasm.js",
  "assets/scripts/libs/sql-wasm.wasm",
  "assets/fonts/Poppins-Regular.woff2",
  "assets/icons/icon-192x192.webp",
  "assets/icons/icon-512x512.webp",
  "assets/icons/maskable_icon.webp",
  "assets/icons/mobile.webp",
  "assets/icons/desktop.webp",
];`;

  swContent = swContent.replace(
    /const CACHE_NAME[\s\S]*?STATIC_RESOURCES = \[[\s\S]*?\];/,
    `const CACHE_NAME = "concordance-cache-v1";\n\n${newStaticResources}`
  );

  const tempSwPath = path.join(TEMP_DIR, "service-worker.js");
  await writeFile(tempSwPath, swContent);

  const bundle = await rollup.rollup({
    input: tempSwPath,
    plugins: [terser()],
  });
  await bundle.write({
    file: path.join(DIST_DIR, "service-worker.js"),
    format: "iife",
  });

  console.log("Service worker processed.");
}

async function processManifest() {
  console.log("Processing manifest.json...");
  const manifestPath = path.join(SRC_DIR, "manifest.json");
  const manifestContent = await readFile(manifestPath, "utf8");
  const manifestData = JSON.parse(manifestContent);
  const minifiedManifest = JSON.stringify(manifestData);
  await writeFile(path.join(DIST_DIR, "manifest.json"), minifiedManifest);
}

async function copyAssets() {
  console.log("Copying assets...");

  const assetsToCopy = {
    "assets/fonts": "assets/fonts",
    "assets/icons": "assets/icons",
    "assets/scripts/libs": "assets/scripts/libs",
    "assets/kjv.sqlite": "assets/kjv.sqlite",
    "assets/db-version.json": "assets/db-version.json",
    "favicon.ico": "favicon.ico",
    "robots.txt": "robots.txt",
    ".htaccess": ".htaccess",
  };

  for (const [src, dest] of Object.entries(assetsToCopy)) {
    const srcPath = path.join(SRC_DIR, src);
    const destPath = path.join(DIST_DIR, dest);

    if (fs.existsSync(srcPath)) {
      if (fs.lstatSync(srcPath).isDirectory()) {
        const files = await readdir(srcPath);
        for (const file of files) {
          await safeCopyFile(
            path.join(srcPath, file),
            path.join(destPath, file)
          );
        }
      } else {
        await safeCopyFile(srcPath, destPath);
      }
    } else {
      console.warn(`Asset not found, skipping: ${srcPath}`);
    }
  }
}

async function build() {
  console.log("🚀 Starting build process...");
  const { rm } = require("fs/promises");
  const startTime = Date.now();

  try {
    await cleanDirectory(DIST_DIR);
    await cleanDirectory(TEMP_DIR);
    await ensurePackages();

    const minifiedCss = await processCss();
    const bundleFileName = await processJavaScript();
    await processHtml(minifiedCss, bundleFileName);
    await processServiceWorker(bundleFileName);
    await processManifest();
    await copyAssets();

    const endTime = Date.now();
    console.log(
      `Build completed successfully in ${(endTime - startTime) / 1000}s!`
    );
  } catch (error) {
    console.error("\n❌ Build failed:", error);
    process.exit(1);
  } finally {
    await rm(TEMP_DIR, {
      recursive: true,
      force: true,
    }).catch(() => {});
  }
}

build();
