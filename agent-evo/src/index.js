#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { runEvolution } from './engine.js';
import { showAuditTrail } from './audit.js';

const banner = `
${chalk.cyan('╔══════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('AGENT-EVO')} ${chalk.gray('· Self-Evolution Engine')}  ${chalk.cyan('║')}
${chalk.cyan('╚══════════════════════════════════════╝')}
`;

program
  .name('agent-evo')
  .description('Watch agent logs/memory, generate evolution prompts')
  .version('1.0.0');

program
  .command('run')
  .description('Analyze logs and generate an evolution prompt')
  .requiredOption('-l, --logs <path>', 'Path to agent log file or directory')
  .requiredOption('-m, --memory <path>', 'Path to agent memory file or directory')
  .option('--mode <mode>', 'Evolution mode: repair | innovate | optimize | harden', 'repair')
  .option('--review', 'Human-in-the-loop: require approval before saving prompt')
  .option('--watch', 'Watch for file changes and run continuously')
  .option('--min-severity <level>', 'Min log severity to flag (error|warn|info)', 'warn')
  .action(async (opts) => {
    console.log(banner);
    const validModes = ['repair', 'innovate', 'optimize', 'harden'];
    if (!validModes.includes(opts.mode)) {
      console.error(chalk.red(`✗ Invalid mode "${opts.mode}". Choose: ${validModes.join(' | ')}`));
      process.exit(1);
    }
    await runEvolution(opts);
  });

program
  .command('audit')
  .description('View the evolution audit trail')
  .option('-n, --last <n>', 'Show last N entries', '10')
  .option('--mode <mode>', 'Filter by mode')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    console.log(banner);
    await showAuditTrail(opts);
  });

program.parse();
