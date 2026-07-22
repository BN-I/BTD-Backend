const fs = require("fs");
const path = require("path");

// FIXED: go up one level from scripts to src, then to emailTemplates
const srcDir = path.join(__dirname, "..", "emailTemplates");
const destDir = path.join(__dirname, "..", "..", "build", "emailTemplates");

fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach((file) => {
  if (file.endsWith(".html")) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
});

console.log("✅ Email templates copied to build/");

// Static assets (e.g. logos embedded in generated PDFs)
const assetsSrcDir = path.join(__dirname, "..", "assets");
const assetsDestDir = path.join(__dirname, "..", "..", "build", "assets");

if (fs.existsSync(assetsSrcDir)) {
  fs.mkdirSync(assetsDestDir, { recursive: true });
  fs.readdirSync(assetsSrcDir).forEach((file) => {
    fs.copyFileSync(path.join(assetsSrcDir, file), path.join(assetsDestDir, file));
  });
  console.log("✅ Assets copied to build/");
}
