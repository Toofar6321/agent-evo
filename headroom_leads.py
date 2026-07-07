import sys
import os
sys.path.insert(0, os.path.expanduser('~/headroom'))

from headroom import compress
from headroom.memory.shared import get_memory

mem = get_memory()

print("Paste your BatchLeads data below.")
print("When done, press Enter then Ctrl+D\n")

text = sys.stdin.read()

# Compress it
r = compress(text)
print(f"\n✅ Compressed: {r.original_tokens} → {r.compressed_tokens} tokens ({r.savings_pct}% saved)")
print("\n--- COMPRESSED (paste this into Claude) ---\n")
print(r.compressed)

# Save to memory
mem.write(
    content=r.compressed,
    source="batchleads",
    agent_id="houston-pipeline",
    tags=["leads", "houston", "batchleads"]
)
print("\n✅ Saved to Headroom memory for future sessions")
