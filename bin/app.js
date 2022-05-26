#!/usr/bin/env node
import app from '../src/main.js';

async function run() {
  await app.init();
  await app.run();
}

run();
