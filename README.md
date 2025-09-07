📦 Dependency Checker

A lightweight TypeScript tool to keep your project dependencies up-to-date and secure.
It scans for outdated packages, runs npm audit, and can even auto-fix vulnerabilities.
Works with single projects and monorepos (packages/*/), and generates both JSON and Markdown reports.

🚀 Features

🔍 Check outdated dependencies (npm outdated)

🛡️ Run security audit (npm audit)

⚡ Auto-fix issues (--fix, with optional --force)

📂 Monorepo support (scans packages/*/)

📑 Generates dependency-report.json + dependency-report.md

🛠️ Setup

Install TypeScript + Node.js typings (if not already installed):

npm install --save-dev ts-node typescript @types/node


Save the script as dependency-checker.ts in your project root.

(Optional) Create or update tsconfig.json:

{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["node"],
    "strict": true
  }
}

📌 Usage
🔍 Check dependencies
ts-node dependency-checker.ts

🛠️ Auto-fix safe issues
ts-node dependency-checker.ts --fix

💥 Auto-fix everything (⚠️ may break)
ts-node dependency-checker.ts --fix --force

📊 Output

✅ Console summary for each project

📄 dependency-report.json → machine-readable

📝 dependency-report.md → human-readable (great for PRs or Slack)

Example Markdown report:

### api-service
- Path: packages/api
- Outdated: 2
- Vulnerabilities: Critical=0, High=1, Moderate=3, Low=5
- AutoFix: ✅ Applied

⚠️ Precautions

Always review changes after auto-fix:

git diff


--force will install breaking changes. Use only if you’re ready to test thoroughly.

Monorepo support is limited to packages/*/. Extend script if your layout is different.

This is a helper, not a replacement for tools like Dependabot, Renovate, or Snyk.

✅ Best Practices

Run before every release.

Integrate into CI/CD to block merges if critical/high vulnerabilities exist.

Share the Markdown report with your team for visibility.
