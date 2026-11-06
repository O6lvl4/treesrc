"""Run the built binary on a small tree and compare the whole output."""
from pathlib import Path
import subprocess
import tempfile

BIN = Path(__file__).resolve().parents[1] / "treesrc"
RULE = "-" * 80


def run(*args, code=0):
    p = subprocess.run([str(BIN), *map(str, args)], capture_output=True, text=True, timeout=30)
    assert p.returncode == code, (args, p.returncode, p.stdout, p.stderr)
    return p.stdout


with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp).resolve()
    (root / ".git").mkdir()
    (root / ".git" / "config").write_text("[core]\n")
    (root / ".gitignore").write_text("*.log\nbuild/\n")
    (root / "a.txt").write_text("hello\nworld")
    (root / "debug.log").write_text("noise\n")
    (root / "build").mkdir()
    (root / "build" / "out.txt").write_text("built\n")
    (root / "bin.dat").write_bytes(b"\x89PNG\x00\x01\x02")
    (root / "latin1.txt").write_bytes(b"caf\xe9\n")
    sub = root / "sub"
    sub.mkdir()
    (sub / ".gitignore").write_text("!keep.log\n")
    (sub / "keep.log").write_text("kept\n")
    (sub / "x.tmp").write_text("temp\n")
    (sub / "deep").mkdir()
    (sub / "deep" / "drop.log").write_text("dropped\n")

    out = run(root, "-i", "*.tmp")
    tree = "\n".join([
        str(root),
        "├── .gitignore",
        "├── a.txt",
        "├── bin.dat",
        "├── latin1.txt",
        "└── sub",
        "    ├── .gitignore",
        "    ├── deep",
        "    └── keep.log",
    ]) + "\n"
    sections = [
        (".gitignore", "1 | *.log\n2 | build/\n3 | "),
        ("a.txt", "1 | hello\n2 | world"),
        ("bin.dat", "Binary file not displayed."),
        ("latin1.txt", "File encoding unreadable. Skipped."),
        ("sub/.gitignore", "1 | !keep.log\n2 | "),
        ("sub/keep.log", "1 | kept\n2 | "),
    ]
    # each section is printed as "\n/<rel>:\n<rule>\n<body>\n" plus the newline println adds
    expected = tree + "".join(f"\n/{rel}:\n{RULE}\n{body}\n\n" for rel, body in sections)
    assert out == expected, f"--- got ---\n{out}\n--- expected ---\n{expected}"

    assert run("-V").strip() == "2.0.0"
    assert "Usage: treesrc" in run("--help")
    run(code=1)
    run(root / "missing", code=1)

print("CLI smoke passed")
