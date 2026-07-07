import sqlite3, json, time, re, hashlib, math
from pathlib import Path

DB = Path.home() / ".headroom" / "memory.db"

def _ensure(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(path))
    con.execute("""CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT, source TEXT, agent_id TEXT,
        tags TEXT, created_at REAL)""")
    con.commit(); con.close()

def _tok(text):
    return re.findall(r'\b\w{3,}\b', text.lower())

class SharedMemory:
    def __init__(self):
        _ensure(DB)

    def write(self, content, source='', agent_id='', tags=None):
        con = sqlite3.connect(str(DB))
        con.execute("INSERT INTO memories (content,source,agent_id,tags,created_at) VALUES (?,?,?,?,?)",
            (content, source, agent_id, json.dumps(tags or []), time.time()))
        con.commit(); con.close()
        return {"status": "stored"}

    def query(self, query, top_k=10, **kw):
        con = sqlite3.connect(str(DB))
        con.row_factory = sqlite3.Row
        rows = [dict(r) for r in con.execute("SELECT * FROM memories").fetchall()]
        con.close()
        if not rows: return []
        qt = set(_tok(query))
        scored = sorted(rows, key=lambda r: len(qt & set(_tok(r['content']))), reverse=True)
        return scored[:top_k]

    def stats(self):
        con = sqlite3.connect(str(DB))
        n = con.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
        con.close()
        return {"total_memories": n}

def get_memory():
    return SharedMemory()
