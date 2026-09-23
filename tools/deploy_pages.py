"""Verify, build and publish the academy to the repository's gh-pages branch.

Requires Git, Python, Node.js and an authenticated GitHub CLI (gh auth login).
Uses a temporary checkout; does not change the working branch or local progress.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(*args, cwd=ROOT, capture=False):
    return subprocess.run(args, cwd=cwd, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None).stdout


for suite in ('tests/models.test.js', 'tests/course.test.js'):
    run('node', suite)
run(sys.executable, '-m', 'unittest', 'discover', '-s', 'practice', '-p', 'test_lab.py')
run(sys.executable, 'tools/build_pages.py')
remote = run('git', 'remote', 'get-url', 'origin', capture=True).strip()
name = run('git', 'var', 'GIT_AUTHOR_IDENT', capture=True).split(' <', 1)[0]
email = run('git', 'var', 'GIT_AUTHOR_IDENT', capture=True).split('<', 1)[1].split('>', 1)[0]
# Use existing gh credentials without writing tokens or changing global Git config.
git = ['git', '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential']
with tempfile.TemporaryDirectory(prefix='bullcamp-pages-') as folder:
    work = Path(folder)
    run('git', 'init', '-b', 'gh-pages', cwd=work)
    run('git', 'config', 'user.name', name, cwd=work)
    run('git', 'config', 'user.email', email, cwd=work)
    run('git', 'remote', 'add', 'origin', remote, cwd=work)
    existing = run(*git, 'ls-remote', '--heads', 'origin', 'gh-pages', cwd=work, capture=True)
    if existing.strip():
        run(*git, 'fetch', '--depth=1', 'origin', 'gh-pages', cwd=work)
        run('git', 'reset', '--hard', 'FETCH_HEAD', cwd=work)
    for entry in work.iterdir():
        if entry.name == '.git':
            continue
        if entry.is_dir() and not entry.is_symlink():
            shutil.rmtree(entry)
        else:
            entry.unlink()
    for source in (ROOT / '_site').iterdir():
        shutil.copy2(source, work / source.name)
    run('git', 'add', '--all', cwd=work)
    changed = run('git', 'status', '--porcelain', cwd=work, capture=True)
    if changed.strip():
        run('git', 'commit', '-m', 'Deploy BullCamp investment academy', cwd=work)
        run(*git, 'push', 'origin', 'HEAD:gh-pages', cwd=work)
    else:
        print('Release unchanged; nothing to publish.')
print('Published branch: gh-pages. GitHub Pages source must be gh-pages / (root).')
