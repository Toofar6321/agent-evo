const MODE_CONFIG = {
  repair: {
    label: '🔧 REPAIR',
    instruction: `You are a senior AI systems engineer performing a post-mortem.
Your job: analyze the agent's error patterns and produce a precise, actionable evolution prompt
that instructs the agent to fix its failure modes. Be surgical. Name each bug type explicitly.
Provide concrete behavioral rules the agent must follow going forward.
Format: numbered list of directives, each 2 sentences max. Max 300 words.`,
    focusTypes: ['error', 'warn', 'loop', 'hallucination', 'context'],
  },
  innovate: {
    label: '🚀 INNOVATE',
    instruction: `You are a creative AI product strategist.
Your job: analyze the agent's current behavior patterns and surface opportunities for it to
do more, try new strategies, or expand its capabilities. Don't fix bugs — find edges to push.
Format: 3-5 bold innovation directives with a one-line rationale each. Max 300 words.`,
    focusTypes: ['innovation', 'refusal', 'performance'],
  },
  optimize: {
    label: '⚡ OPTIMIZE',
    instruction: `You are a performance engineer focused on efficiency.
Your job: analyze latency signals, token usage patterns, and repetitive behaviors.
Produce a focused prompt that instructs the agent to be faster, leaner, and less verbose
without sacrificing accuracy. Format: bulleted rules with measurable targets where possible. Max 300 words.`,
    focusTypes: ['performance', 'context', 'loop'],
  },
  harden: {
    label: '🛡️ HARDEN',
    instruction: `You are a red-team AI safety engineer.
Your job: identify refusal patterns, constraint violations, and edge-case failures.
Produce a hardening prompt that makes the agent more robust, consistent, and boundary-aware.
Format: IF/THEN behavioral rules. Max 300 words.`,
    focusTypes: ['refusal', 'error', 'hallucination'],
  },
};

export function getModeConfig(mode) {
  return MODE_CONFIG[mode] ?? MODE_CONFIG.repair;
}

function buildAnalysisSummary(analysis, mode) {
  const cfg = getModeConfig(mode);
  const relevant = analysis.findings.filter(
    (f) => cfg.focusTypes.includes(f.type) || f.severity === 'error'
  );
  const others = analysis.findings.filter(
    (f) => !cfg.focusTypes.includes(f.type) && f.severity !== 'error'
  );

  let summary = `=== AGENT DIAGNOSTIC REPORT ===\nMode: ${cfg.label}\nScanned: ${analysis.scannedAt}\nTotal lines analyzed: ${analysis.totalLines}\n\n`;

  if (relevant.length === 0 && others.length === 0) {
    summary += 'No significant patterns detected.\n';
  }

  if (relevant.length > 0) {
    summary += `--- PRIMARY FINDINGS ---\n`;
    for (const f of relevant.slice(0, 8)) {
      summary += `\n[${f.severity.toUpperCase()}] ${f.label} (${f.count} occurrence${f.count > 1 ? 's' : ''})\n`;
      f.excerpts.slice(0, 3).forEach((ex, i) => {
        summary += `  ${i + 1}. "${ex}"\n`;
      });
    }
  }

  if (others.length > 0) {
    summary += `\n--- SECONDARY FINDINGS ---\n`;
    for (const f of others.slice(0, 4)) {
      summary += `[${f.severity.toUpperCase()}] ${f.label}: ${f.count} occurrence(s)\n`;
    }
  }

  if (analysis.memoryAnomalies.length > 0) {
    summary += `\n--- MEMORY ANOMALIES ---\n`;
    analysis.memoryAnomalies.forEach(({ word, count }) => {
      summary += `  "${word}" appears ${count} times\n`;
    });
  }

  return summary;
}

export async function generateEvolutionPrompt(analysis, mode) {
  const cfg = getModeConfig(mode);
  const analysisSummary = buildAnalysisSummary(analysis, mode);

  const userMessage = `${analysisSummary}

Based on the above diagnostic data, generate an evolution prompt for this AI agent.
Write it as direct instructions TO the agent (second person).
It must be actionable, specific to the patterns found, and immediately usable.
Mode context: ${cfg.label}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: cfg.instruction,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  return {
    prompt: text,
    analysisSummary,
    mode,
    modeLabel: cfg.label,
    generatedAt: new Date().toISOString(),
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}
