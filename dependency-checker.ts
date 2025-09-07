import { exec as execCb } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const exec = promisify(execCb);

interface OutdatedDeps {
  [pkg: string]: {
    current: string;
    wanted: string;
    latest: string;
  };
}

interface AuditSummary {
  critical: number;
  high: number;
  moderate: number;
  low: number;
}

interface Report {
  project: string;
  path: string;
  outdated: OutdatedDeps;
  vulnerabilities: AuditSummary;
  autoFixApplied: boolean;
}

async function runCommand(cmd: string, cwd: string) {
  try {
    const { stdout } = await exec(cmd, { cwd });
    return stdout;
  } catch (err: any) {
    return err.stdout || err.message;
  }
}

async function checkOutdated(cwd: string): Promise<OutdatedDeps> {
  const output = await runCommand("npm outdated --json || true", cwd);
  if (!output || output.trim() === "") return {};
  try {
    return JSON.parse(output);
  } catch {
    return {};
  }
}

async function checkAudit(cwd: string): Promise<AuditSummary> {
  const output = await runCommand("npm audit --json || true", cwd);
  try {
    const json = JSON.parse(output);
    const vulns = json.metadata?.vulnerabilities ?? {};
    return {
      critical: vulns.critical ?? 0,
      high: vulns.high ?? 0,
      moderate: vulns.moderate ?? 0,
      low: vulns.low ?? 0,
    };
  } catch {
    return { critical: 0, high: 0, moderate: 0, low: 0 };
  }
}

async function autoFix(cwd: string, force: boolean): Promise<boolean> {
  const cmd = force ? "npm audit fix --force" : "npm audit fix";
  const result = await runCommand(cmd, cwd);
  return result.includes("fixed") || result.includes("up to date");
}

function findPackageDirs(root: string): string[] {
  const dirs: string[] = [];
  const main = path.join(root, "package.json");
  if (fs.existsSync(main)) dirs.push(root);

  const pkgsDir = path.join(root, "packages");
  if (fs.existsSync(pkgsDir)) {
    for (const name of fs.readdirSync(pkgsDir)) {
      const pkgPath = path.join(pkgsDir, name, "package.json");
      if (fs.existsSync(pkgPath)) {
        dirs.push(path.dirname(pkgPath));
      }
    }
  }
  return dirs;
}

async function generateReport(dir: string, fix: boolean, force: boolean): Promise<Report> {
  const outdated = await checkOutdated(dir);
  const vulnerabilities = await checkAudit(dir);
  let autoFixApplied = false;

  if (fix) {
    autoFixApplied = await autoFix(dir, force);
  }

  const project = path.basename(dir);
  return { project, path: dir, outdated, vulnerabilities, autoFixApplied };
}

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
  const force = args.includes("--force");

  const root = process.cwd();
  const packageDirs = findPackageDirs(root);

  const reports: Report[] = [];
  for (const dir of packageDirs) {
    console.log(`\n🔍 Checking ${dir} ...`);
    const report = await generateReport(dir, fix, force);
    reports.push(report);

    // Console summary
    console.log(`Project: ${report.project}`);
    console.log("Outdated deps:", Object.keys(report.outdated).length);
    console.log("Vulnerabilities:", report.vulnerabilities);
    console.log("Auto-fix applied:", report.autoFixApplied ? "✅ Yes" : "❌ No");
  }

  // Write JSON + Markdown reports
  fs.writeFileSync("dependency-report.json", JSON.stringify(reports, null, 2));

  const md = reports
    .map(
      (r) => `
### ${r.project}
- Path: \`${r.path}\`
- Outdated: ${Object.keys(r.outdated).length}
- Vulnerabilities: Critical=${r.vulnerabilities.critical}, High=${r.vulnerabilities.high}, Moderate=${r.vulnerabilities.moderate}, Low=${r.vulnerabilities.low}
- AutoFix: ${r.autoFixApplied ? "✅ Applied" : "❌ Not applied"}
`
    )
    .join("\n");

  fs.writeFileSync("dependency-report.md", md);

  console.log("\n📦 Reports generated: dependency-report.json, dependency-report.md");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
