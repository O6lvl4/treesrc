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

Made with ❤️ by [Your Name](https://github.com/O6lvl4).
