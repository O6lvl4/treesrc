#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';
import { program } from 'commander';

program
  .version('1.0.0')
  .argument('<directory>', 'Target directory')
  .option('-i, --ignore <patterns...>', 'Extra ignore patterns')
  .parse(process.argv);

const options = program.opts();
const targetDir = program.args[0];

// 無視設定を取得（.gitignore + 任意の追加無視ファイル）
function getIgnoreRules(ignoreFilePath: string, extraIgnores: string[] = []): Ignore {
  let ig = ignore();

  if (fs.existsSync(ignoreFilePath)) {
    const gitignoreContent = fs.readFileSync(ignoreFilePath, 'utf8');
    ig = ig.add(gitignoreContent);
  }

  if (extraIgnores.length > 0) {
    ig = ig.add(extraIgnores);
  }

  return ig;
}

// 全ファイル取得（無視ルール適用済み）
function getAllFiles(dirPath: string, ig: Ignore, arrayOfFiles: string[] = [], baseDir: string = dirPath): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(baseDir, fullPath);

    if (ig.ignores(relativePath)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, ig, arrayOfFiles, baseDir);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// ディレクトリ構造を表示
function showStructure(dir: string, ig: Ignore) {
  function buildTree(currentDir: string, prefix = '') {
    const items = fs.readdirSync(currentDir);

    items.forEach((item, index) => {
      const fullPath = path.join(currentDir, item);
      const relativePath = path.relative(dir, fullPath);
      const isDir = fs.statSync(fullPath).isDirectory();

      if (ig.ignores(relativePath)) return;

      const connector = index === items.length - 1 ? '└── ' : '├── ';
      console.log(`${prefix}${connector}${item}`);

      if (isDir) {
        const nextPrefix = prefix + (index === items.length - 1 ? '    ' : '│   ');
        buildTree(fullPath, nextPrefix);
      }
    });
  }

  console.log(dir);
  buildTree(dir);
}

// ファイル内容表示
function showFilesContent(files: string[], baseDir: string) {
  files.forEach((filePath) => {
    const relativePath = path.relative(baseDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const contentLines = content
      .split('\n')
      .map((line, idx) => `${idx + 1} | ${line}`)
      .join('\n');

    console.log(`\n/${relativePath}:\n${'-'.repeat(80)}\n${contentLines}\n`);
  });
}

// メイン関数
function main(targetDir: string, extraIgnores: string[] = []) {
  const baseDir = path.resolve(targetDir);
  const ig = getIgnoreRules(path.join(baseDir, '.gitignore'), extraIgnores);

  const files = getAllFiles(baseDir, ig);

  showStructure(baseDir, ig);
  showFilesContent(files, baseDir);
}

main(targetDir, options.ignore || []);
