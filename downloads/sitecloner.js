#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { runCloner } from '../src/index.js';

const program = new Command();

console.log(
  chalk.cyan(
    figlet.textSync('SiteCloner', { horizontalLayout: 'fitted' })
  )
);
console.log(chalk.gray('  Reverse-engineer any site into a Next.js + Tailwind codebase\n'));

program
  .name('sitecloner')
  .description('Clone a live website into a modern Next.js project')
  .version('1.0.0')
  .argument('<url>', 'URL of the site to clone')
  .option('-o, --output <dir>', 'Output directory name', 'cloned-site')
  .option('--no-assets', 'Skip downloading images and fonts')
  .option('--no-screenshot', 'Skip taking page screenshots')
  .option('-v, --verbose', 'Show detailed logs')
  .action(async (url, options) => {
    try {
      await runCloner(url, options);
    } catch (err) {
      console.error(chalk.red('\n✖ Fatal error:'), err.message);
      if (options.verbose) console.error(err.stack);
      process.exit(1);
    }
  });

program.parse();
