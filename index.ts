#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';
import { program } from 'commander';

program
  .version('1.0.2')
  .argument('<directory>', 'Target directory')
  .option('-i, --ignore <patterns...>', 'Extra ignore patterns')
  .parse(process.argv);

const options = program.opts();
const targetDir = program.args[0];

/**
 * バイナリファイル判定関数
 *  - ファイルの先頭数バイトを読み出し、NULL バイトが含まれているか確認する簡易的な方法。
 *  - より正確な判定を行いたい場合は「isbinaryfile」などのライブラリ利用を検討してください。
 */
function isBinaryFile(filePath: string, checkBytes = 1000): boolean {
  // 存在しないファイルの場合は false として扱う
  if (!fs.existsSync(filePath)) return false;

  const stats = fs.statSync(filePath);
  // ディレクトリはバイナリ扱いしない
  if (stats.isDirectory()) return false;

  // チェックバイト数がファイルサイズを超える場合はファイルサイズまで
  const lengthToCheck = Math.min(stats.size, checkBytes);

  const buffer = Buffer.alloc(lengthToCheck);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, lengthToCheck, 0);
  } finally {
    fs.closeSync(fd);
  }

  // NULL バイトが含まれているかでバイナリ判定（簡易版）
  for (let i = 0; i < lengthToCheck; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

/**
 * .gitignore および追加の無視パターンを取得
 */
function getIgnoreRules(ignoreFilePath: string, extraIgnores: string[] = []): Ignore {
  let ig = ignore();

  // デフォルトで .git フォルダは無視
  ig.add('.git');

  // .gitignore があればルールに追加
  if (fs.existsSync(ignoreFilePath)) {
    const gitignoreContent = fs.readFileSync(ignoreFilePath, 'utf8');
    ig = ig.add(gitignoreContent);
  }

  // 追加の無視パターン
  if (extraIgnores.length > 0) {
    ig = ig.add(extraIgnores);
  }

  return ig;
}

/**
 * ディレクトリ内のすべてのファイルを取得（無視ルール適用済み）
 */
function getAllFiles(
  dirPath: string,
  ig: Ignore,
  arrayOfFiles: string[] = [],
  baseDir: string = dirPath
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(baseDir, fullPath);

    // .gitignore やオプションの無視パターンに一致したらスキップ
    if (ig.ignores(relativePath)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, ig, arrayOfFiles, baseDir);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * ディレクトリ構造をツリー表示
 */
function showStructure(dir: string, ig: Ignore) {
  function buildTree(currentDir: string, prefix = '') {
    const items = fs.readdirSync(currentDir);

    items.forEach((item, index) => {
      const fullPath = path.join(currentDir, item);
      const relativePath = path.relative(dir, fullPath);
      const isDir = fs.statSync(fullPath).isDirectory();

      // .gitignore やオプションの無視パターンに一致したらスキップ
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

/**
 * ファイル内容を表示
 */
function showFilesContent(files: string[], baseDir: string) {
  files.forEach((filePath) => {
    const relativePath = path.relative(baseDir, filePath);

    // バイナリファイルの場合はスキップ
    if (isBinaryFile(filePath)) {
      console.log(`\n/${relativePath}:\n${'-'.repeat(80)}`);
      console.log('Binary file not displayed.\n');
      return;
    }

    // テキストファイルの場合は従来通り表示
    const content = fs.readFileSync(filePath, 'utf8');
    const contentLines = content
      .split('\n')
      .map((line, idx) => `${idx + 1} | ${line}`)
      .join('\n');

    console.log(`\n/${relativePath}:\n${'-'.repeat(80)}\n${contentLines}\n`);
  });
}

/**
 * メイン処理
 */
function main(targetDir: string, extraIgnores: string[] = []) {
  const baseDir = path.resolve(targetDir);
  const ig = getIgnoreRules(path.join(baseDir, '.gitignore'), extraIgnores);

  // 対象ディレクトリ配下のすべてのファイルを取得
  const files = getAllFiles(baseDir, ig);

  // ディレクトリ構造をツリー表示
  showStructure(baseDir, ig);

  // ファイル内容を表示（バイナリはスキップ）
  showFilesContent(files, baseDir);
}

main(targetDir, options.ignore || []);
