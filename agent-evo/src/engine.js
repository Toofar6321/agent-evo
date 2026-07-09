import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import inquirer from 'inquirer';
import { loadInputs, analyzeContent } from './analyzer.js';
import { generateEvolutionPrompt, getModeConfig } from './promptgen.js';
import { saveAuditEntry } from './audit.js';

const OUTPUT_DIR = path.join(process.cwd(), 'prompts');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function printHeader(mode, watch) {
  const cfg = getModeConfig(mode);
  console.log(chalk.bold('Mode: ' + cfg.label) + (watch ? chalk.gray('  [WATCH]') : ''));
  console.log(chalk.gray('--------------------------------------------------'));
}

function printFindings(analysis) {
  if (analysis.findings.length === 0) {
    console.log(chalk.green('No significant patterns detected.'));
    return;
  }
  console.log(chalk.bold('\nFindings:\n'));
  for (const f of analysis.findings.slice(0, 10)) {
    const icon = f.severity === 'error' ? 'RED' : f.severity === 'warn' ? 'WARN' : 'INFO';
    console.log('  [' + icon + '] ' + f.label + '  x' + f.count);
    if (f.excerpts[0]) console.log('     "' + f.excerpts[0].slice(0, 100) + '"');
  }
  if (analysis.memoryAnomalies.length > 0) {
    console.log(chalk.yellow('\nMemory anomalies:'));
    analysis.memoryAnomalies.forEach(function(a) {
      console.log('     "' + a.word + '" x' + a.count);
    });
  }
}

async function singleRun(opts) {
  const logsPath = opts.logsPath;
  const memoryPath = opts.memoryPath;
  const mode = opts.mode;
  const review = opts.review;
  const minSeverity = opts.minSeverity;

  console.log(chalk.gray('\nLoading files...'));
  const inputs = loadInputs(logsPath, memoryPath);
  if (inputs.logMissing) console.log(chalk.yellow('Log path not found: ' + logsPath));
  if (inputs.memMissing) console.log(chalk.yellow('Memory path not found: ' + memoryPath));

  console.log(chalk.gray('Analyzing patterns...'));
  const analysis = analyzeContent(inputs.logContent, inputs.memContent, minSeverity);
  printFindings(analysis);

  console.log(chalk.gray('\nCalling Claude API...'));
  let result;
  try {
    result = await generateEvolutionPrompt(analysis, mode);
  } catch (err) {
    console.error(chalk.red('Generation failed: ' + err.message));
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log(result.modeLabel + ' — Suggested Evolution Prompt');
  console.log('==================================================\n');
  console.log(result.prompt);
  console.log('\n==================================================');
  console.log(chalk.gray('Tokens: ' + result.inputTokens + ' in / ' + result.outputTokens + ' out'));

  let approved = true;
  if (review) {
    const answers = await inquirer.prompt([
      {
        type: 'list'

cd ~/agent-evo && cat > src/engine.js << 'ENDOFFILE'
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import inquirer from 'inquirer';
import { loadInputs, analyzeContent } from './analyzer.js';
import { generateEvolutionPrompt, getModeConfig } from './promptgen.js';
import { saveAuditEntry } from './audit.js';

const OUTPUT_DIR = path.join(process.cwd(), 'prompts');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function printHeader(mode, watch) {
  const cfg = getModeConfig(mode);
  console.log(chalk.bold('Mode: ' + cfg.label) + (watch ? chalk.gray('  [WATCH]') : ''));
  console.log(chalk.gray('--------------------------------------------------'));
}

function printFindings(analysis) {
  if (analysis.findings.length === 0) {
    console.log(chalk.green('No significant patterns detected.'));
    return;
  }
  console.log(chalk.bold('\nFindings:\n'));
  for (const f of analysis.findings.slice(0, 10)) {
    const icon = f.severity === 'error' ? 'RED' : f.severity === 'warn' ? 'WARN' : 'INFO';
    console.log('  [' + icon + '] ' + f.label + '  x' + f.count);
    if (f.excerpts[0]) console.log('     "' + f.excerpts[0].slice(0, 100) + '"');
  }
  if (analysis.memoryAnomalies.length > 0) {
    console.log(chalk.yellow('\nMemory anomalies:'));
    analysis.memoryAnomalies.forEach(function(a) {
      console.log('     "' + a.word + '" x' + a.count);
    });
  }
}

async function singleRun(opts) {
  const logsPath = opts.logsPath;
  const memoryPath = opts.memoryPath;
  const mode = opts.mode;
  const review = opts.review;
  const minSeverity = opts.minSeverity;

  console.log(chalk.gray('\nLoading files...'));
  const inputs = loadInputs(logsPath, memoryPath);
  if (inputs.logMissing) console.log(chalk.yellow('Log path not found: ' + logsPath));
  if (inputs.memMissing) console.log(chalk.yellow('Memory path not found: ' + memoryPath));

  console.log(chalk.gray('Analyzing patterns...'));
  const analysis = analyzeContent(inputs.logContent, inputs.memContent, minSeverity);
  printFindings(analysis);

  console.log(chalk.gray('\nCalling Claude API...'));
  let result;
  try {
    result = await generateEvolutionPrompt(analysis, mode);
  } catch (err) {
    console.error(chalk.red('Generation failed: ' + err.message));
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log(result.modeLabel + ' — Suggested Evolution Prompt');
  console.log('==================================================\n');
  console.log(result.prompt);
  console.log('\n==================================================');
  console.log(chalk.gray('Tokens: ' + result.inputTokens + ' in / ' + result.outputTokens + ' out'));

  let approved = true;
  if (review) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'decision',
        message: 'Review this evolution prompt:',
        choices: [
          { name: 'Approve — save to file and audit trail', value: 'approve' },
          { name: 'Reject — log as rejected, discard', value: 'reject' },
        ],
      },
    ]);
    if (answers.decision === 'reject') {
      approved = false;
      console.log(chalk.red('Rejected.'));
    } else {
      console.log(chalk.green('Approved.'));
    }
  }

  let promptFile = null;
  if (approved) {
    ensureOutputDir();
    const filename = 'evo-' + mode + '-' + Date.now() + '.txt';
    promptFile = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(promptFile, [
      '# Evolution Prompt',
      'Mode: ' + result.modeLabel,
      'Generated: ' + result.generatedAt,
      '',
      result.prompt,
      '',
      '## Analysis Summary',
      result.analysisSummary,
    ].join('\n'));
    console.log(chalk.green('Prompt saved: ' + promptFile));
  }

  const entryId = saveAuditEntry({
    mode: mode,
    modeLabel: result.modeLabel,
    approved: approved,
    logsPath: logsPath,
    memoryPath: memoryPath,
    findingsSummary: analysis.findings.length + ' pattern groups, ' + analysis.totalLines + ' lines',
    evolutionPrompt: result.prompt,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    promptFile: promptFile,
  });
  console.log(chalk.gray('Audit entry: ' + entryId));
}

export async function runEvolution(opts) {
  const logsPath = opts.logs;
  const memoryPath = opts.memory;
  const mode = opts.mode;
  const review = opts.review;
  const watch = opts.watch;
  const minSeverity = opts.minSeverity;

  printHeader(mode, watch);

  if (!watch) {
    await singleRun({ logsPath, memoryPath, mode, review, minSeverity });
    return;
  }

  console.log(chalk.gray('Watching: ' + logsPath + ' and ' + memoryPath));
  let debounce = null;

  const watcher = chokidar.watch([logsPath, memoryPath], {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 800, pollInterval: 100 },
  });

  watcher.on('change', function(filePath) {
    clearTimeout(debounce);
    debounce = setTimeout(async function() {
      console.log('Change detected: ' + filePath);
      await singleRun({ logsPath, memoryPath, mode, review, minSeverity });
    }, 1500);
  });
}
