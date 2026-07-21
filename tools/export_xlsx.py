#!/usr/bin/env python3
"""把 data/u1..u6.json 题库导出为格式化的 Excel 题库总表。"""
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "题库总表.xlsx")

UNIT_IDS = ["u1", "u9", "u2", "u3", "u4", "u10", "u5", "u6", "u7", "u8"]
SHEET_NAMES = ["1 新手村", "2 金融基础课", "3 市场地图", "4 下单基本功", "5 看懂行情", "6 估值课", "7 杠杆特训营", "8 韭菜防身术", "9 港股入门", "10 3倍ETF特训"]
TYPE_CN = {"choice": "单选", "tf": "判断", "blank": "选词填空", "match": "配对", "order": "排序"}

BRAND = "6C4CF1"
BRAND_SOFT = "EFEAFE"
BOSS_FILL = "FFF3CC"
CARD_FILL = "F2F7F2"
GRID = Side(style="thin", color="D9D9E3")

F_HEAD = Font(name="Arial", bold=True, color="FFFFFF", size=11)
F_BODY = Font(name="Arial", size=10.5)
F_BOLD = Font(name="Arial", size=10.5, bold=True)
F_GREEN = Font(name="Arial", size=10.5, bold=True, color="00794E")
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="top", wrap_text=True)

HEADERS = ["关卡", "关卡名", "关卡类型", "题号", "题型", "题面微教学 teach",
           "题干 / 知识卡片标题", "内容① (选项A/配对/顺序)", "内容②", "内容③", "内容④", "内容⑤",
           "正确答案", "解析 / 知识卡片正文"]
WIDTHS = [7, 16, 9, 6, 9, 30, 38, 24, 24, 24, 24, 18, 22, 44]

def style_row(ws, r, ncols, fill=None):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=r, column=c)
        cell.font = F_BODY
        cell.alignment = WRAP if c >= 6 else CENTER
        cell.border = Border(left=GRID, right=GRID, top=GRID, bottom=GRID)
        if fill:
            cell.fill = PatternFill("solid", fgColor=fill)

def content_cells(q):
    """返回 (内容①..⑤, 正确答案)"""
    t = q["type"]
    cells = ["", "", "", "", ""]
    if t in ("choice", "blank"):
        opts = q.get("options", [])
        for i, o in enumerate(opts[:5]):
            cells[i] = f"{'ABCDE'[i]}. {o}"
        ai = q.get("answerIndex", 0)
        ans = f"{'ABCDE'[ai]}. {opts[ai]}" if 0 <= ai < len(opts) else "?"
    elif t == "tf":
        cells[0] = "A. 对"
        cells[1] = "B. 错"
        ans = "对" if q.get("answerBool") else "错"
    elif t == "match":
        for i, p in enumerate(q.get("pairs", [])[:5]):
            cells[i] = f"{p['left']} ↔ {p['right']}"
        ans = "左右按 ↔ 对应（游戏中乱序出现）"
    elif t == "order":
        for i, it in enumerate(q.get("items", [])[:5]):
            cells[i] = f"{'①②③④⑤'[i]} {it}"
        ans = "按 ①→⑤ 顺序（游戏中乱序出现）"
    else:
        ans = "?"
    return cells, ans

wb = Workbook()

# ---------- 总览 ----------
ov = wb.active
ov.title = "总览"
ov.sheet_properties.tabColor = BRAND
ov["A1"] = "美股新手村 · BullCamp 题库总表"
ov["A1"].font = Font(name="Arial", bold=True, size=15, color=BRAND)
ov["A2"] = "6 单元 · 30 关 · 192 题 ｜ 数据源: bullcamp/data/u1..u6.json（12-agent 出题+金融事实审校流水线产出）"
ov["A2"].font = Font(name="Arial", size=10, color="7C7C93")

ov_headers = ["单元", "单元标题", "定位", "关卡数", "题目数"]
for c, h in enumerate(ov_headers, 1):
    cell = ov.cell(row=4, column=c, value=h)
    cell.font = F_HEAD
    cell.fill = PatternFill("solid", fgColor=BRAND)
    cell.alignment = CENTER
for w, c in zip([8, 22, 40, 9, 9], range(1, 6)):
    ov.column_dimensions[get_column_letter(c)].width = w

units = []
for uid in UNIT_IDS:
    with open(os.path.join(ROOT, "data", f"{uid}.json"), encoding="utf-8") as f:
        units.append(json.load(f))

for i, (u, sname) in enumerate(zip(units, SHEET_NAMES)):
    r = 5 + i
    ov.cell(row=r, column=1, value=f"单元{i+1}")
    ov.cell(row=r, column=2, value=f"{u['emoji']} {u['title']}")
    ov.cell(row=r, column=3, value=u["subtitle"])
    ov.cell(row=r, column=4, value=len(u["lessons"]))
    ov.cell(row=r, column=5, value=sum(len(l["questions"]) for l in u["lessons"]))
    style_row(ov, r, 5)

tot_r = 5 + len(units)
ov.cell(row=tot_r, column=2, value="合计")
ov.cell(row=tot_r, column=4, value=sum(len(u["lessons"]) for u in units))
ov.cell(row=tot_r, column=5, value=sum(len(l["questions"]) for u in units for l in u["lessons"]))
style_row(ov, tot_r, 5, fill=BRAND_SOFT)
for c in range(1, 6):
    ov.cell(row=tot_r, column=c).font = F_BOLD
ov.cell(row=tot_r + 2, column=1, value="注：统计值由导出脚本 tools/export_xlsx.py 从 data/u*.json 计算写入；手工增删题目后请重新运行脚本导出。")
ov.cell(row=tot_r + 2, column=1).font = Font(name="Arial", size=9, color="7C7C93")
ov.freeze_panes = "A5"

# ---------- 单元表 ----------
for u, sname in zip(units, SHEET_NAMES):
    ws = wb.create_sheet(sname)
    ws.sheet_properties.tabColor = BRAND
    for c, (h, w) in enumerate(zip(HEADERS, WIDTHS), 1):
        cell = ws.cell(row=1, column=c, value=h)
        cell.font = F_HEAD
        cell.fill = PatternFill("solid", fgColor=BRAND)
        cell.alignment = CENTER
        cell.border = Border(left=GRID, right=GRID, top=GRID, bottom=GRID)
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.freeze_panes = "A2"

    r = 2
    for l in u["lessons"]:
        is_boss = bool(l.get("boss"))
        ltype = "Boss" if is_boss else "普通"
        # 知识卡片行
        intro = l.get("intro")
        if intro:
            ws.cell(row=r, column=1, value=l["id"])
            ws.cell(row=r, column=2, value=l["title"])
            ws.cell(row=r, column=3, value=ltype)
            ws.cell(row=r, column=4, value="—")
            ws.cell(row=r, column=5, value="知识卡片")
            ws.cell(row=r, column=7, value=intro.get("title", ""))
            ws.cell(row=r, column=14, value=intro.get("body", ""))
            style_row(ws, r, len(HEADERS), fill=CARD_FILL)
            ws.cell(row=r, column=5).font = F_GREEN
            r += 1
        for qi, q in enumerate(l["questions"], 1):
            cells, ans = content_cells(q)
            ws.cell(row=r, column=1, value=l["id"])
            ws.cell(row=r, column=2, value=l["title"])
            ws.cell(row=r, column=3, value=ltype)
            ws.cell(row=r, column=4, value=qi)
            ws.cell(row=r, column=5, value=TYPE_CN.get(q["type"], q["type"]))
            ws.cell(row=r, column=6, value=q.get("teach", ""))
            ws.cell(row=r, column=7, value=q["prompt"])
            for ci, cv in enumerate(cells):
                ws.cell(row=r, column=8 + ci, value=cv)
            ws.cell(row=r, column=13, value=ans)
            ws.cell(row=r, column=14, value=q["explanation"])
            style_row(ws, r, len(HEADERS), fill=BOSS_FILL if is_boss else None)
            ws.cell(row=r, column=13).font = F_BOLD
            if q.get("teach"):
                ws.cell(row=r, column=6).font = F_GREEN
            r += 1

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print(f"✅ 已生成 {OUT}")
