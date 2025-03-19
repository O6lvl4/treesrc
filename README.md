# 🌳 treesrc

> A CLI tool written in TypeScript that displays directory structures and file contents, fully respecting `.gitignore` rules.

## 📦 Installation

Install globally via npm:

```bash
npm install -g treesrc
```

or use it temporarily without installing:

```bash
npx treesrc <directory>
```

## 🚀 Quick Usage

Simply run `treesrc` followed by the target directory:

```bash
treesrc ./my-project
```

You can also specify additional ignore patterns:

```bash
treesrc ./my-project -i '*.log' '*.tmp'
```

## 🎯 Features

- Display directory structures as a neatly formatted tree
- View the contents of each file in the directory
- Automatically respects `.gitignore` rules
- Supports custom ignore patterns via CLI arguments

## 🛠️ CLI Options

```bash
Usage: treesrc <directory> [options]

Arguments:
  directory                   Target directory

Options:
  -i, --ignore <patterns...>  Additional ignore patterns
  -V, --version               output the version number
  -h, --help                  display help for command
```

## ⚙️ Development

### Setup locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/treesrc.git
cd treesrc
npm install
npm run build
npm link
```

### Run Locally

```bash
npm start -- <directory> [options]
```

## 📝 Changelog

### v1.0.3

- **Improved binary file detection accuracy**
  - Integrated `isbinaryfile` library for reliable binary detection.
  - Added extra check to detect corrupted or binary-like text files based on control character frequency.
  - Files with unreadable UTF-8 encoding are now automatically skipped.

### v1.0.2

- **Added binary file detection**  
  Files are now checked for binary content by scanning the first bytes. If binary data is detected, the file content display is skipped with a message: "Binary file not displayed."

- **Updated documentation**  
  README updated to reflect changes regarding handling of binary files.

### v1.0.1
- Added `.git` to default ignore patterns
- Improved documentation

### v1.0.0
- First stable release
- Rewritten in TypeScript
- npm published

## 📄 License

[MIT License](LICENSE)

---

Made with ❤️ by [O6lvl4](https://github.com/O6lvl4).
