"""Build the complete offline academy and embed the original practice package."""
import json
import re
import base64
import io
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
files = {p.name: p.read_text(encoding='utf-8') for p in sorted((ROOT / 'practice').iterdir()) if p.is_file() and p.suffix in ('.py', '.md', '.csv', '.json')}
buffer = io.BytesIO()
with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, content in files.items():
        info = zipfile.ZipInfo('practice/' + name, date_time=(2026, 9, 23, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, content)
(ROOT / 'dist').mkdir(exist_ok=True)
(ROOT / 'dist/bullcamp-practice.zip').write_bytes(buffer.getvalue())
bundle = 'window.BullPractice = ' + json.dumps({'version': 1, 'zip': base64.b64encode(buffer.getvalue()).decode()}, ensure_ascii=False) + ';\n'
(ROOT / 'js/practice-bundle.js').write_text(bundle, encoding='utf-8')
html = (ROOT / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>\n' + (ROOT / m[1]).read_text(encoding='utf-8') + '\n</style>', html)
html = re.sub(r'<script defer src="([^"]+)"></script>', lambda m: '<script defer>\n' + (ROOT / m[1]).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>', html)
# Inline classic scripts must execute after DOM construction; defer on inline scripts is ignored.
scripts = re.findall(r'<script defer>[\s\S]*?</script>', html)
html = re.sub(r'<script defer>[\s\S]*?</script>\n?', '', html)
html = html.replace('</body>', '\n' + '\n'.join(s.replace('<script defer>', '<script>') for s in scripts) + '\n</body>')
html = html.replace('href="practice/README.md"', 'href="#practice"')
(ROOT / 'dist').mkdir(exist_ok=True)
out = ROOT / 'dist/投资探索营.html'
out.write_text(html, encoding='utf-8')
print(f'Built {out.name}: {len(html.encode()):,} bytes; {len(files)} practice files')
