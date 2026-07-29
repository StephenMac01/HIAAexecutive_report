import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  throw new Error("Standalone build not found. Run next build first.");
}

const publicSource = join(root, "public");
const publicTarget = join(standalone, "public");

if (existsSync(publicSource)) {
  cpSync(publicSource, publicTarget, {
    recursive: true,
    force: true,
  });
}

const staticSource = join(root, ".next", "static");
const staticTarget = join(standalone, ".next", "static");

mkdirSync(join(standalone, ".next"), {
  recursive: true,
});

if (existsSync(staticSource)) {
  cpSync(staticSource, staticTarget, {
    recursive: true,
    force: true,
  });
}

console.log("Standalone deployment files prepared.");
