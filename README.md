Why use this?

Running npm outdated and npm audit separately is annoying.

Sometimes you forget to check vulnerabilities until production (oops).

Teams without Dependabot/Renovate/Snyk still need a lightweight safety net.

This tool combines everything into one step and gives you reports you can actually read.

Setup

Install TypeScript support if you don’t already have it:

npm install --save-dev ts-node typescript @types/node


Save the script as dependency-checker.ts in your project root.

(Optional but recommended) Add a tsconfig.json if you don’t already have one:

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

Usage
Check dependencies
ts-node dependency-checker.ts

Auto-fix safe issues
ts-node dependency-checker.ts --fix

Auto-fix everything (can break stuff!)
ts-node dependency-checker.ts --fix --force

Output

Console summary for each project

dependency-report.json → machine-readable

dependency-report.md → human-readable (great for PRs or Slack)

Example Markdown:

### api-service
- Path: packages/api
- Outdated: 2
- Vulnerabilities: Critical=0, High=1, Moderate=3, Low=5
- AutoFix: ✅ Applied

Precautions ⚠️

Auto-fix may change your lockfile → always check with git diff before committing.

--force will install breaking changes. Use it only if you’re ready to test everything.

In monorepos, only packages/*/ is scanned. If your layout is different, extend the script.

This tool is not a replacement for Dependabot/Renovate/Snyk — think of it as a local helper.

Good practices

Run this before cutting a release.

Add it to CI to block merges if there are critical/high vulnerabilities.

Share the Markdown report in PRs so everyone knows what’s going on.
