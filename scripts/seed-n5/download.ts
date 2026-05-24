/**
 * Download raw datasets used to build the N5 seed.
 *
 * Datasets:
 *   - JMdict (common subset, English glosses)  — CC BY-SA 4.0, EDRDG
 *   - KANJIDIC2 (English)                       — CC BY-SA 4.0, EDRDG
 *   - Unihan_Readings.txt                       — Unicode License v3
 *
 * Outputs go under data/raw/ (gitignored). Each archive's SHA256 is verified
 * against scripts/seed-n5/sources.json so a tampered/replaced asset fails loudly.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileP = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW_DIR = path.join(ROOT, "data/raw");
const SOURCES = path.join(import.meta.dirname, "sources.json");

interface Source {
  url: string;
  archive: string;
  extracted: string;
  sha256: string;
  license: string;
  attribution: string;
}

interface Manifest {
  tag: string;
  files: Source[];
}

async function sha256Of(file: string): Promise<string> {
  const hash = createHash("sha256");
  await pipeline(createReadStream(file), hash);
  return hash.digest("hex");
}

async function fetchTo(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) {
    throw new Error(`fetch ${url} → ${res.status} ${res.statusText}`);
  }
  await writeFile(dest, Readable.fromWeb(res.body as never));
}

async function ensureExtracted(src: Source): Promise<void> {
  const archivePath = path.join(RAW_DIR, src.archive);
  const extractedPath = path.join(RAW_DIR, src.extracted);

  if (existsSync(extractedPath)) {
    return;
  }
  if (!existsSync(archivePath)) {
    console.log(`  download → ${src.archive}`);
    await fetchTo(src.url, archivePath);
  }

  const got = await sha256Of(archivePath);
  if (got !== src.sha256) {
    await rm(archivePath, { force: true });
    throw new Error(
      `checksum mismatch for ${src.archive}\n  expected ${src.sha256}\n  got      ${got}\n  archive removed; rerun to redownload`,
    );
  }
  console.log(`  sha256 ok ${src.archive}`);

  if (src.archive.endsWith(".tgz")) {
    await execFileP("tar", ["-xzf", archivePath, "-C", RAW_DIR]);
  } else if (src.archive.endsWith(".zip")) {
    await execFileP("unzip", ["-o", "-j", archivePath, src.extracted, "-d", RAW_DIR]);
  } else {
    throw new Error(`unsupported archive ${src.archive}`);
  }
  if (!existsSync(extractedPath)) {
    throw new Error(`extraction did not produce ${src.extracted}`);
  }
}

async function main(): Promise<void> {
  await mkdir(RAW_DIR, { recursive: true });
  const manifest = JSON.parse(await readFile(SOURCES, "utf8")) as Manifest;
  console.log(`seed-n5 sources tag=${manifest.tag}`);
  for (const src of manifest.files) {
    console.log(`▸ ${src.extracted}`);
    await ensureExtracted(src);
  }
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
