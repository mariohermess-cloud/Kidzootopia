#!/bin/sh
# Test der Agenten-Hooks kein-git-schreiben.sh (coder) und helfer-nur-doku.sh (helfer).
# Aufruf: sh .claude/hooks/agenten-hooks.test.sh   (Exit 0 = alle Faelle richtig)
cd "$(dirname "$0")/../.." || exit 1
export CLAUDE_PROJECT_DIR="$(pwd)"
F=0; N=0
bash_fall() { # erwartet befehl
  N=$((N+1))
  j=$(python3 -c 'import json,sys; print(json.dumps({"tool_input":{"command":sys.argv[1]}}))' "$2")
  printf '%s' "$j" | sh .claude/hooks/kein-git-schreiben.sh >/dev/null 2>&1; e=$?
  [ "$e" = "$1" ] || { F=$((F+1)); echo "FEHLER coder: erwartet $1, bekam $e: $2"; }
}
datei_fall() { # erwartet pfad
  N=$((N+1))
  j=$(python3 -c 'import json,sys; print(json.dumps({"tool_input":{"file_path":sys.argv[1]}}))' "$2")
  printf '%s' "$j" | sh .claude/hooks/helfer-nur-doku.sh >/dev/null 2>&1; e=$?
  [ "$e" = "$1" ] || { F=$((F+1)); echo "FEHLER helfer: erwartet $1, bekam $e: $2"; }
}
bash_fall 0 'git status'
bash_fall 0 'git diff --stat && git log --oneline -5'
bash_fall 0 'npm test'
bash_fall 0 'npm run test:version'
bash_fall 0 'git branch --show-current'
bash_fall 2 'git commit -m x'
bash_fall 2 'git push'
bash_fall 2 '/usr/bin/git push'
bash_fall 2 '"git" push'
bash_fall 2 'env FOO=1 git push'
bash_fall 2 'timeout 5 git push'
bash_fall 2 'git -c alias.x=push x'
bash_fall 2 'git checkout -b neu'
bash_fall 2 'git branch neu'
bash_fall 2 'git diff --output=x'
bash_fall 2 'gh pr create'
bash_fall 2 'sh -c "git push"'
bash_fall 2 'bash -lc "git push"'
bash_fall 2 'eval "git push"'
bash_fall 2 'x=git; $x push'
datei_fall 0 'README.md'
datei_fall 0 'docs/notiz.md'
datei_fall 2 'CLAUDE.md'
datei_fall 2 '.claude/agents/coder.md'
datei_fall 2 '.github/workflows/x.md'
datei_fall 2 'js/ui.js'
datei_fall 2 'sw.js'
datei_fall 2 'tests/version.mjs'
datei_fall 2 '../ausserhalb.md'
echo "agenten-hooks: $((N-F)) von $N richtig"
[ "$F" = 0 ]
