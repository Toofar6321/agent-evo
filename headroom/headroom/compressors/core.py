import re, hashlib, time
from dataclasses import dataclass, field

def _count_tokens(text):
    return max(1, len(text) // 4)

@dataclass
class CompressionResult:
    original: str
    compressed: str
    original_tokens: int
    compressed_tokens: int
    ratio: float
    strategies_applied: list = field(default_factory=list)
    duration_ms: float = 0.0

    @property
    def savings_pct(self):
        return round((1 - self.ratio) * 100, 1)

@dataclass
class CompressorConfig:
    target_tokens: int = None
    strategies: list = field(default_factory=lambda: ["dedup","prune_json","prune_code","extract_logs","trim_reply"])

class Compressor:
    def __init__(self, config=None):
        self.config = config or CompressorConfig()

    def compress(self, text):
        t0 = time.monotonic()
        orig = _count_tokens(text)
        cur = text
        applied = []

        if "dedup" in self.config.strategies:
            lines = text.splitlines(keepends=True)
            seen = set()
            out = []
            for line in lines:
                s = line.strip()
                if s and s in seen:
                    continue
                seen.add(s)
                out.append(line)
            r = "".join(out)
            if r != cur: cur = r; applied.append("dedup")

        if "extract_logs" in self.config.strategies:
            lines = cur.splitlines()
            pat = re.compile(r'\b(ERROR|WARN|WARNING|CRITICAL|FATAL)\b', re.I)
            imp = set()
            for i, l in enumerate(lines):
                if pat.search(l):
                    for j in range(max(0,i-2), min(len(lines),i+3)):
                        imp.add(j)
            if imp and len(imp) < len(lines):
                cur = "\n".join(lines[i] for i in sorted(imp))
                applied.append("extract_logs")

        FILLER = re.compile(r'(?i)(certainly[,!]?\s*|of course[,!]?\s*|I\'d be happy to\s*|as an AI[^,]*,?\s*|I hope this helps\.?\s*)')
        r = FILLER.sub("", cur).strip()
        if r != cur: cur = r; applied.append("trim_reply")

        comp = _count_tokens(cur)
        ratio = comp / max(orig, 1)
        return CompressionResult(
            original=text, compressed=cur,
            original_tokens=orig, compressed_tokens=comp,
            ratio=ratio, strategies_applied=applied,
            duration_ms=(time.monotonic()-t0)*1000
        )
