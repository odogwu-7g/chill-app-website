import { cpSync, mkdirSync, rmSync } from 'node:fs';

const outputDirectory = new URL('./dist/', import.meta.url);
const staticFiles = [
  'index.html',
  'styles.css',
  'hero.css',
  'how-it-works.css',
  'how-it-works.js',
  'script.js',
  'terms.html',
  'privacy.html',
  'favicon.svg',
];

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

for (const file of staticFiles) {
  cpSync(new URL(`./${file}`, import.meta.url), new URL(`./dist/${file}`, import.meta.url));
}

cpSync(new URL('./assets/', import.meta.url), new URL('./dist/assets/', import.meta.url), { recursive: true });

console.log(`Built ${staticFiles.length} static files and app imagery into dist/`);
