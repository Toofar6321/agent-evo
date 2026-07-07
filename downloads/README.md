# The Agency
### A complete AI expert team in your coding assistant

---

## What Is This?

The Agency is a collection of specialized AI agent profiles — each with a distinct personality, skill set, and working style. Drop them into Claude Code, Cursor, or any AI assistant that accepts system prompts.

Instead of one generic AI assistant, you get a full team:

| Codename | Role | Division |
|----------|------|----------|
| PIXEL | Frontend Developer | Engineering |
| FORGE | Backend Architect | Engineering |
| PIPELINE | DevOps Automator | Engineering |
| CHAIN | Solidity Engineer | Engineering |
| CANVAS | UI Designer | Design |
| LENS | UX Researcher | Design |
| INK | Copywriter | Marketing |
| SPIKE | Growth Hacker | Marketing |
| CLOSE | Sales Closer | Sales |
| NORTH | Product Manager | Product |

---

## Folder Structure

```
the-agency/
├── engineering/
│   ├── frontend-developer.md    # PIXEL
│   ├── backend-architect.md     # FORGE
│   ├── devops-automator.md      # PIPELINE
│   └── solidity-engineer.md     # CHAIN
├── design/
│   ├── ui-designer.md           # CANVAS
│   └── ux-researcher.md         # LENS
├── marketing/
│   ├── copywriter.md            # INK
│   └── growth-hacker.md         # SPIKE
├── sales/
│   └── sales-closer.md          # CLOSE
├── product/
│   └── product-manager.md       # NORTH
├── scripts/
│   ├── install-claude-code.sh   # Install to ~/.claude/agents/
│   ├── install-cursor.sh        # Convert to .cursorrules
│   └── list-agents.sh           # List all agents + codenames
└── README.md
```

---

## Install

### Claude Code
```bash
chmod +x scripts/install-claude-code.sh
./scripts/install-claude-code.sh
```

### Cursor
```bash
chmod +x scripts/install-cursor.sh
./scripts/install-cursor.sh
# Then copy a .cursorrules file from cursor-export/ to your project root
```

### Manual (any AI assistant)
Copy the contents of any `.md` file and paste it as your system prompt.

---

## How to Activate

Use natural language in your session:

```
"Activate PIXEL and help me build a responsive nav in React."
"Activate FORGE and design a REST API for a wholesale deal tracker."
"Activate CLOSE and help me handle a seller who said 'I need to think about it.'"
"Activate NORTH and write a PRD for an AI calling system."
```

---

## Adding New Agents

1. Create a `.md` file in the appropriate division folder
2. Follow the profile template structure (Identity, Personality, Core Skills, Work Style, Activation Prompt, Example Output, Kill Conditions)
3. Assign a codename
4. Re-run install scripts

---

## Agent Profile Template

```markdown
# Agent: [Role Name]
**Division:** [Engineering / Design / Marketing / Sales / Product]
**Codename:** [SINGLE WORD]

## Identity
[Who they are, their background, their mindset]

## Personality
[Voice, tone, quirks, what they care about]

## Core Skills
[Bulleted list of specific tools, frameworks, methodologies]

## Work Style
[How they approach problems — numbered steps]

## Activation Prompt
[Copy-paste template for how to wake this agent up]

## Example Output Style
[A concrete example of what their output looks like]

## Kill Conditions
[What they refuse to do / what triggers a pushback]
```

---

*The Agency — Built for solo operators who need a full team.*
