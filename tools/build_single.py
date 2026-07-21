#!/usr/bin/env python3
"""把游戏打包成单文件 HTML：
- dist/美股新手村.html   完整独立文档，可直接双击打开 / 发给别人
- dist/artifact.html     无文档骨架版本，用于发布为 Claude Artifact
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()

css = read("css/style.css")
data = read("js/data.js")
labs = read("js/labs.js")
app = read("js/app.js")

body = f"""<div id="app" class="app"></div>
<nav id="nav" class="bottom-nav">
  <button class="nav-btn active" data-view="home"><span class="nav-ico">🗺️</span><span class="nav-label">学习</span></button>
  <button class="nav-btn" data-view="daily"><span class="nav-ico">⚡</span><span class="nav-label">每日挑战</span></button>
  <button class="nav-btn" data-view="review"><span class="nav-ico">📕</span><span class="nav-label">错题本</span></button>
  <button class="nav-btn" data-view="profile"><span class="nav-ico">🦄</span><span class="nav-label">我的</span></button>
</nav>
<script>
{data}
</script>
<script>
{labs}
</script>
<script>
{app}
</script>"""

standalone = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#6F00FF">
<title>美股新手村 · Bobby</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦄</text></svg>">
<style>
{css}
</style>
</head>
<body>
{body}
</body>
</html>
"""

artifact = f"""<title>美股新手村 · Bobby</title>
<style>
{css}
</style>
{body}
"""

os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
p1 = os.path.join(ROOT, "dist", "美股新手村.html")
p2 = os.path.join(ROOT, "dist", "artifact.html")
with open(p1, "w", encoding="utf-8") as f: f.write(standalone)
with open(p2, "w", encoding="utf-8") as f: f.write(artifact)
print(f"✅ {p1} ({os.path.getsize(p1)//1024} KB)")
print(f"✅ {p2} ({os.path.getsize(p2)//1024} KB)")
