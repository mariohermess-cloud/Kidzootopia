#!/bin/sh
# Agenten-Hook des coder (PreToolUse, Matcher Bash; im Frontmatter eingetragen).
# Committen, pushen, mergen und jede andere Aenderung am Git-Zustand macht nur der
# Chef (CLAUDE.md, Abschnitt Rollen). Erlaubt: git mit einem LESENDEN Unterbefehl (Positivliste)
# ohne -c/--exec-path/Aliase. Gesperrt (Exit 2): jeder andere git-Aufruf, auch
# ueber Pfad (/usr/bin/git), Quotes ("git"), Backslash (\git), Variablen ($x) oder
# command/exec/env-Umwege, eval oder sh/bash -c (auch -lc), sowie gh (GitHub-CLI) und hub.
# Grenze: Schutz vor Versehen, kein Sandkasten.
command -v python3 >/dev/null 2>&1 || { echo 'kein-git-schreiben: python3 fehlt, Bash gesperrt' >&2; exit 2; }
INPUT=$(cat)
case "$INPUT" in *git*|*gh*|*hub*) ;; *) exit 0 ;; esac
printf '%s' "$INPUT" | python3 -c '
import json, re, shlex, sys
try: cmd = (json.load(sys.stdin).get("tool_input") or {}).get("command", "")
except Exception: sys.exit(0)

def fehler(g):
    sys.stderr.write("Git-/GitHub-Schreibbefehle macht nur der Chef (CLAUDE.md, Abschnitt Rollen; " + g + "): " + cmd[:160] + "\n"); sys.exit(2)

LESEND = {"status","diff","log","show","ls-files","ls-tree","blame","rev-parse","grep","cat-file",
          "describe","shortlog","rev-list","merge-base","branch","help","version","--version"}
try:
    lex = shlex.shlex(cmd, posix=True, punctuation_chars="|&;()")
    lex.whitespace_split = True
    tokens = list(lex)
except ValueError:
    if re.search(r"\bgit\b|\bgh\b", cmd): fehler("nicht lesbar")
    sys.exit(0)
segs, akt = [], []
for t in tokens:
    if t and set(t) <= set("|&;()"):
        if akt: segs.append(akt); akt = []
    else: akt.append(t)
if akt: segs.append(akt)

UMWEG = {"command", "exec", "env", "nohup", "time", "timeout", "xargs", "sudo", "nice", "builtin"}
for w in segs:
    if w and w[0].rsplit("/", 1)[-1] in ("sudo", "npx", "doas") and re.search(r"\b(git|gh|hub)\b", " ".join(w[1:])):
        fehler(w[0] + " mit git/gh")
    vorher = None
    while w and (re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", w[0]) or w[0] in UMWEG
                 or (vorher in UMWEG and (w[0].startswith("-") or re.fullmatch(r"[0-9.]+[smhd]?", w[0])))):
        vorher = w[0] if w[0] in UMWEG else vorher
        w = w[1:]
    if not w: continue
    name = w[0].rsplit("/", 1)[-1].lstrip("\\`")
    if w[0].startswith("$"): fehler("Befehl aus Variable")
    if name in ("gh", "hub"): fehler(name)
    if name == "eval" and re.search(r"\bgit\b|\bgh\b|\bhub\b", " ".join(w)): fehler("git in eval")
    if name in ("bash", "sh", "zsh", "dash", "ksh") and any(re.fullmatch(r"-[A-Za-z]*c[A-Za-z]*", x) for x in w[1:]) \
       and re.search(r"\bgit\b|\bgh\b|\bhub\b", " ".join(w)): fehler("git in Unter-Shell")
    if name != "git": continue
    a = w[1:]
    while a and a[0].startswith("-"):
        if a[0] in ("-c", "--exec-path", "--config-env") or a[0].startswith("--exec-path=") or a[0].startswith("--config-env="): fehler("git " + a[0])
        a = a[2:] if a[0] in ("-C", "--git-dir", "--work-tree", "--namespace") else a[1:]
    if not a: continue
    sub = a[0]
    if sub not in LESEND: fehler("git " + sub)
    rest = a[1:]
    if sub == "branch" and any(not x.startswith("-") or x in ("-d","-D","-m","-M","-c","-C","-f","--delete","--move","--copy","--force","-u","--set-upstream-to","--unset-upstream","--edit-description") for x in rest):
        fehler("git branch schreibend")
    if sub in ("diff","show","log") and any(x.startswith("--output") for x in rest): fehler("git " + sub + " --output")
    if sub == "grep" and any(x in ("-O",) or x.startswith("--open-files-in-pager") for x in rest): fehler("git grep -O")
sys.exit(0)
'
