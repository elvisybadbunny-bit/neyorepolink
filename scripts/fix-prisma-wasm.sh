#!/usr/bin/env bash
set -e
cat << 'LOADER' > node_modules/.prisma/client/wasm-worker-loader.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(__dirname, 'query_engine_bg.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);
const mod = await WebAssembly.compile(wasmBuffer);
export default { default: mod };
LOADER

cat << 'ENTRY' > node_modules/.prisma/client/auto-adapter-entry.js
const { PrismaClient: WasmPrismaClient, Prisma, ...rest } = require('./wasm.js');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
let pool = null, adapter = null;
function getAdapter() {
  if (!adapter) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/neyo" });
    adapter = new PrismaPg(pool);
  }
  return adapter;
}
class AutoPrismaClient extends WasmPrismaClient {
  constructor(options = {}) {
    if (!options.adapter) options = { ...options, adapter: getAdapter() };
    super(options);
  }
}
module.exports = { ...rest, Prisma, PrismaClient: AutoPrismaClient, default: { ...rest, Prisma, PrismaClient: AutoPrismaClient } };
ENTRY

cp node_modules/.prisma/client/auto-adapter-entry.js node_modules/.prisma/client/default.js
cp node_modules/.prisma/client/auto-adapter-entry.js node_modules/@prisma/client/default.js
echo "✓ Prisma WASM shims applied."
