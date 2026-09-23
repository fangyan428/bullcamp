"""Build a GitHub Pages artifact containing only the academy release."""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
subprocess.run([sys.executable, str(ROOT / 'tools/build_academy.py')], check=True)
OUT.mkdir(exist_ok=True)
# Rebuild our generated directory so removed release files cannot survive.
for item in OUT.iterdir():
    if item.is_dir() and not item.is_symlink():
        shutil.rmtree(item)
    else:
        item.unlink()
shutil.copy2(ROOT / 'dist/投资探索营.html', OUT / 'index.html')
shutil.copy2(ROOT / 'dist/bullcamp-practice.zip', OUT / 'bullcamp-practice.zip')
shutil.copy2(ROOT / 'LICENSE', OUT / 'LICENSE')
(OUT / '.nojekyll').touch()
print('Pages artifact: _site/ (academy, practice ZIP, MIT license)')
