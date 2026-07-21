#!/usr/bin/env python3
"""合并 data/u*.json 为 js/data.js，并做结构校验。"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 认知顺序：是什么→为什么值钱→在哪买→怎么买→怎么看→怎么估→高级武器→防身→港股→3倍ETF
UNIT_IDS = ["u1", "u9", "u2", "u3", "u4", "u10", "u5", "u6", "u7", "u8"]
TYPES = {"choice", "tf", "match", "order", "blank"}

problems = []
units = []

def warn(msg):
    problems.append(msg)

for uid in UNIT_IDS:
    path = os.path.join(ROOT, "data", f"{uid}.json")
    if not os.path.exists(path):
        warn(f"[缺失] {uid}.json 不存在")
        continue
    with open(path, encoding="utf-8") as f:
        u = json.load(f)
    if u.get("id") != uid:
        warn(f"[{uid}] id 字段为 {u.get('id')!r}，已强制改为 {uid}")
        u["id"] = uid
    for key in ("title", "subtitle", "emoji"):
        if not u.get(key):
            warn(f"[{uid}] 缺少 {key}")
    lessons = u.get("lessons", [])
    if not lessons:
        warn(f"[{uid}] 没有关卡")
    for li, l in enumerate(lessons):
        lid = l.get("id", f"{uid}l{li+1}")
        if not l.get("title"):
            warn(f"[{lid}] 缺少标题")
        is_boss = bool(l.get("boss"))
        if not is_boss and not l.get("intro"):
            warn(f"[{lid}] 普通关缺少 intro 知识卡片")
        if l.get("intro"):
            body = l["intro"].get("body", "")
            if len(body) > 220:
                warn(f"[{lid}] intro.body 过长 ({len(body)}字)")
        qs = l.get("questions", [])
        keep = []
        for qi, q in enumerate(qs):
            tag = f"{lid}#q{qi+1}"
            t = q.get("type")
            if t not in TYPES:
                warn(f"[{tag}] 非法题型 {t!r}，已丢弃")
                continue
            if not q.get("prompt") or not q.get("explanation"):
                warn(f"[{tag}] 缺 prompt/explanation，已丢弃")
                continue
            if q.get("teach"):
                if len(q["teach"]) > 100:
                    warn(f"[{tag}] teach 过长 ({len(q['teach'])}字)")
                if is_boss:
                    warn(f"[{tag}] Boss关不应有 teach（考试不给拐杖），已移除")
                    q.pop("teach", None)
            ok = True
            if t in ("choice", "blank"):
                opts = q.get("options") or []
                ai = q.get("answerIndex")
                if len(opts) != 4:
                    warn(f"[{tag}] {t} 选项数={len(opts)}(应为4)")
                if not isinstance(ai, int) or not (0 <= ai < len(opts)):
                    warn(f"[{tag}] answerIndex 无效，已丢弃")
                    ok = False
                if t == "blank" and "____" not in q.get("prompt", ""):
                    warn(f"[{tag}] blank 题干缺 ____，转为 choice")
                    q["type"] = "choice"
            elif t == "tf":
                if not isinstance(q.get("answerBool"), bool):
                    warn(f"[{tag}] tf 缺 answerBool，已丢弃")
                    ok = False
            elif t == "match":
                pairs = q.get("pairs") or []
                if not (2 <= len(pairs) <= 5):
                    warn(f"[{tag}] match 对数={len(pairs)}，已丢弃")
                    ok = False
                elif any(not p.get("left") or not p.get("right") for p in pairs):
                    warn(f"[{tag}] match 存在空项，已丢弃")
                    ok = False
            elif t == "order":
                items = q.get("items") or []
                if not (3 <= len(items) <= 5):
                    warn(f"[{tag}] order 项数={len(items)}，已丢弃")
                    ok = False
            if ok:
                keep.append(q)
        if len(keep) != len(qs):
            warn(f"[{lid}] 保留 {len(keep)}/{len(qs)} 题")
        if not is_boss and len(keep) < 5:
            warn(f"[{lid}] ⚠️ 普通关题数不足5 ({len(keep)})")
        l["questions"] = keep
    units.append(u)

data = {"units": units}
out = os.path.join(ROOT, "js", "data.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* 自动生成：tools/build_data.py，勿手改 */\n")
    f.write("window.CURRICULUM = ")
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")

n_lessons = sum(len(u["lessons"]) for u in units)
n_q = sum(len(l["questions"]) for u in units for l in u["lessons"])
n_teach = sum(1 for u in units for l in u["lessons"] for q in l["questions"] if q.get("teach"))
type_count = {}
for u in units:
    for l in u["lessons"]:
        for q in l["questions"]:
            type_count[q["type"]] = type_count.get(q["type"], 0) + 1

print(f"✅ 生成 {out}")
print(f"   单元 {len(units)} · 关卡 {n_lessons} · 题目 {n_q} · 含微教学 {n_teach}")
print(f"   题型分布: {json.dumps(type_count, ensure_ascii=False)}")
if problems:
    print(f"\n⚠️ 校验发现 {len(problems)} 处问题:")
    for p in problems:
        print("   - " + p)
else:
    print("   校验全部通过，无问题")
