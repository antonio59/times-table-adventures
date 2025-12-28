#!/usr/bin/env node
/**
 * Install native dependencies for bun compatibility
 *
 * Bun doesn't properly handle optional dependencies that are platform-specific.
 * This script manually downloads and installs them.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModules = join(__dirname, "..", "node_modules");

// Detect platform
const platform = process.platform;
const arch = process.arch;

const getPlatformSuffix = () => {
  if (platform === "darwin" && arch === "arm64") return "darwin-arm64";
  if (platform === "darwin" && arch === "x64") return "darwin-x64";
  if (platform === "linux" && arch === "x64") return "linux-x64-gnu";
  return null;
};

const suffix = getPlatformSuffix();
if (!suffix) {
  console.log(
    `Platform ${platform}-${arch} not supported for native deps install`,
  );
  process.exit(0);
}

// Dependencies to install with their versions
const deps = [
  { scope: "@rollup", name: `rollup-${suffix}`, version: "4.54.0" },
  { scope: "@esbuild", name: suffix, version: "0.25.12" },
  { scope: "@tailwindcss", name: `oxide-${suffix}`, version: "4.1.18" },
  { scope: null, name: `lightningcss-${suffix}`, version: "1.30.2" },
];

const installDep = ({ scope, name, version }) => {
  const fullName = scope ? `${scope}/${name}` : name;
  const targetDir = scope
    ? join(nodeModules, scope, name)
    : join(nodeModules, name);

  if (existsSync(targetDir)) {
    console.log(`✓ ${fullName} already installed`);
    return;
  }

  console.log(`Installing ${fullName}@${version}...`);

  try {
    const parentDir = dirname(targetDir);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }

    const tarball = `https://registry.npmjs.org/${fullName}/-/${name}-${version}.tgz`;
    execSync(
      `curl -sL "${tarball}" | tar -xz -C "${parentDir}" && mv "${parentDir}/package" "${targetDir}"`,
      {
        stdio: "pipe",
      },
    );
    console.log(`✓ Installed ${fullName}`);
  } catch (err) {
    console.warn(`⚠ Failed to install ${fullName}: ${err.message}`);
  }
};

console.log(`Installing native dependencies for ${suffix}...`);
deps.forEach(installDep);
console.log("Done!");
