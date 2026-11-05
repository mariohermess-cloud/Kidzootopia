#!/bin/sh
# Agenten-Hook des helfer (PreToolUse, Matcher Edit|Write|MultiEdit, eingetragen
# im Frontmatter von .claude/agents/helfer.md). Erlaubt Schreiben nur auf
# Markdown-Dateien (*.md) im Projekt. Pfad wird normalisiert; .claude/, .github/,
# Pfade ausserhalb des Projekts und CLAUDE.md sind immer gesperrt.
# Alles andere (js/, sw.js, tests/, app.css ...): Exit 2 mit Begruendung.
INPUT=$(cat)
printf '%s' "$INPUT" | python3 -c '
import json, os, sys
try: pfad = (json.load(sys.stdin).get("tool_input") or {}).get("file_path", "")
except Exception: pfad = ""
basis = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
norm = os.path.normpath(os.path.join(basis, pfad))
rel = os.path.relpath(norm, basis).replace(os.sep, "/")
teile = rel.split("/")
ok = (pfad != "" and not rel.startswith("..") and ".claude" not in teile and ".github" not in teile
      and os.path.basename(rel) != "CLAUDE.md" and rel.endswith(".md"))
if ok: sys.exit(0)
sys.stderr.write("helfer darf nur Markdown-Doku (*.md, nicht CLAUDE.md, .claude/, .github/) schreiben, nicht: " + pfad + "\n")
sys.exit(2)
'
