import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const AUDIT_DIR = path.join(process.cwd(), 'audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'evolution-log.json');

function ensureAuditDir() {
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

function loadAudit() {
  ensureAuditDir();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export function saveAuditEntry(entry) {
  ensureAuditDir();
  const log = loadAudit();
  const record = {
    id: `evo-${Date.now()}`,
    timestamp: new Date().toISOString(),
    mode: entry.mode,
    modeLabel: entry.modeLabel,
    approved: entry.approved,
    logsPath: entry.logsPath,
    memoryPath: entry.memoryPath,
    findingsSummary: entry.findingsSummary,
    evolutionPrompt: entry.evolutionPrompt,
    tokens: {
      input: entry.inputTokens ?? 0,
      output: entry.outputTokens ?? 0,
    },
    promptFile: entry.promptFile ?? null,
  };
  log.push(record);
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(log, null, 2));
  return record.id;
}

export async function showAuditTrail(opts) {
  const log = loadAudit();

  if (log.length === 0) {
    console.log(chalk.yellow('No audit entries found. Run agent-evo run first.'));
    return;
  }

  let entries = [...log];
  if (opts.mode) entries = entries.filter((e) => e.mode === opts.mode);

  const n = parseInt(opts.last, 10) || 10;
  const slice = entries.slice(-n).reverse();

  if (opts.json) {
    console.log(JSON.stringify(slice, null, 2));
    return;
  }

  console.log(chalk.bold(`\n📋 Evolution Audit Trail  (${slice.length} of ${log.length} entries)\n`));
  console.log(chalk.gray('─'.repeat(60)));

  for (const e of slice) {
    const approvedBadge = e.approved ? chalk.green('✓ APPROVED') : chalk.red('✗ REJECTED');
    console.log(`\n${chalk.bold.white(e.id)}  ${approvedBadge}`);
    console.log(`  ${chalk.gray('Date:')}    ${new Date(e.timestamp).toLocaleString()}`);
    console.log(`  ${chalk.gray('Mode:')}    ${e.modeLabel}`);
    console.log(`  ${chalk.gray('Tokens:')}  ${e.tokens.input} in / ${e.tokens.output} out`);
    if (e.promptFile) console.log(`  ${chalk.gray('Saved:')}   ${e.promptFile}`);
    console.log(`\n  ${chalk.cyan('── Evolution Prompt ──')}`);
    e.evolutionPrompt.split('\n').slice(0, 8).forEach((l) => console.log(`  ${l}`));
    console.log(chalk.gray('\n' + '─'.repeat(60)));
  }

  console.log(chalk.gray(`\nAudit file: ${AUDIT_FILE}\n`));
}
