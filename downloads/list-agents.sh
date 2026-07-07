#!/bin/bash
# ═══════════════════════════════════════════
# The Agency — List All Available Agents
# Usage: ./scripts/list-agents.sh
# ═══════════════════════════════════════════

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              THE AGENCY — ROSTER                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

current_division=""

while IFS= read -r -d '' agent_file; do
  division=$(basename "$(dirname "$agent_file")")
  agent_name=$(basename "$agent_file" .md)

  # Print division header when it changes
  if [ "$division" != "$current_division" ]; then
    echo ""
    echo "  ▸ ${division^^}"
    echo "  ──────────────────────────────"
    current_division="$division"
  fi

  # Extract metadata from file
  codename=$(grep -m1 "\*\*Codename:\*\*" "$agent_file" | sed 's/.*\*\*Codename:\*\* //' | tr -d '\r')
  tagline=$(grep -m1 "^You are $codename" "$agent_file" | sed "s/You are $codename — //" | cut -c1-55)

  printf "  %-12s %-10s %s\n" "$agent_name" "[$codename]" "$tagline..."

done < <(find "$SOURCE_DIR" -path "$SOURCE_DIR/scripts" -prune -o \
  -name "*.md" ! -name "README.md" -print0 | sort -z)

echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo "  ACTIVATE:"
echo "  > 'Activate [CODENAME] and [task]'"
echo ""
echo "  INSTALL:"
echo "  > ./scripts/install-claude-code.sh"
echo "  > ./scripts/install-cursor.sh"
echo ""
