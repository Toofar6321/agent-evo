import fs from 'fs';
import path from 'path';

const PATTERNS = {
  error: {
    regex: /\b(error|exception|uncaught|fatal|crash|failed|failure|traceback|stack trace)\b/gi,
    severity: 'error',
    label: 'Error / Exception',
  },
  warn: {
    regex: /\b(warn(?:ing)?|deprecated|timeout|retry|rate.?limit|throttl)\b/gi,
    severity: 'warn',
    label: 'Warning / Degraded',
  },
  loop: {
    regex: /\b(loop|infinite|recursion|repeat|duplicate|again|cycle)\b/gi,
    severity: 'warn',
    label: 'Possible Loop / Repetition',
  },
  hallucination: {
    regex: /\b(invented|fabricat|made.?up|confabul|hallucin|incorrect(?:ly)?|wrong(?:ly)?)\b/gi,
    severity: 'warn',
    label: 'Hallucination Signal',
  },
  performance: {
    regex: /\b(slow|latency|lag|delay|ms|seconds?|took \d+|timeout)\b/gi,
    severity: 'info',
    label: 'Performance Signal',
  },
  context: {
    regex: /\b(context.?length|token.?limit|truncat|overflow|max.?token)\b/gi,
    severity: 'warn',
    label: 'Context / Token Issue',
  },
  refusal: {
    regex: /\b(refus|cannot|can't|unable|not able|won't|will not|I'm sorry)\b/gi,
    severity: 'info',
    label: 'Refusal / Constraint Hit',
  },
  innovation: {
    regex: /\b(could|should|might|suggest|improve|better|alternative|instead|consider)\b/gi,
    severity: 'info',
    label: 'Innovation Opportunity',
  },
};

const SEVERITY_RANK = { error: 3, warn: 2, info: 1 };

function readFileSafe(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return fs
        .readdirSync(filePath)
        .filter((f) => /\.(log|txt|json|md)$/.test(f))
        .map((f) => {
          try { return fs.readFileSync(path.join(filePath, f), 'utf8'); }
          catch { return ''; }
        })
        .join('\n');
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

export function analyzeContent(logContent, memoryContent, minSeverity = 'warn') {
  const minRank = SEVERITY_RANK[minSeverity] ?? 2;
  const findings = [];
  const combined = `--- LOGS ---\n${logContent}\n--- MEMORY ---\n${memoryContent}`;
  const lines = combined.split('\n');

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    for (const [key, pat] of Object.entries(PATTERNS)) {
      if (SEVERITY_RANK[pat.severity] < minRank) continue;
      const matches = [...line.matchAll(new RegExp(pat.regex.source, 'gi'))];
      if (matches.length > 0) {
        findings.push({
          type: key,
          severity: pat.severity,
          label: pat.label,
          lineNumber: idx + 1,
          excerpt: line.trim().slice(0, 200),
          matchCount: matches.length,
        });
      }
    }
  });

  const grouped = {};
  for (const f of findings) {
    if (!grouped[f.type]) {
      grouped[f.type] = { ...f, excerpts: [f.excerpt], count: 1 };
    } else {
      grouped[f.type].count++;
      if (grouped[f.type].excerpts.length < 5) {
        grouped[f.type].excerpts.push(f.excerpt);
      }
    }
  }

  const wordFreq = {};
  memoryContent.split(/\W+/).forEach((w) => {
    if (w.length > 5) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const anomalies = Object.entries(wordFreq)
    .filter(([, c]) => c > 10)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    findings: Object.values(grouped).sort(
      (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
    ),
    memoryAnomalies: anomalies,
    totalLines: lines.length,
    scannedAt: new Date().toISOString(),
  };
}

export function loadInputs(logsPath, memoryPath) {
  const logContent = readFileSafe(logsPath);
  const memContent = readFileSafe(memoryPath);
  return {
    logContent: logContent ?? '(no log content found)',
    memContent: memContent ?? '(no memory content found)',
    logMissing: logContent === null,
    memMissing: memContent === null,
  };
}
