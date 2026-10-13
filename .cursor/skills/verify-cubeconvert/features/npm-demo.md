# One-command demo script

`npm run demo` runs the billing fixture CLI path, initializes an execution workflow job, and validates required report files.

## Sub-features

- `demo-cli`: generates the migration bundle under `artifacts/cubeconvert-demo/` (or a custom out dir)
- `execution-job`: writes `reports/execution-job.json` via `initExecutionWorkflow`
- `required-reports`: checks executive summary, maps, readiness, ROI, impact, cutover, glossary, export plan

## How to get to it (user POV)

1. From repo root: `npm run demo`
2. Or `bash scripts/demo.sh /tmp/my-demo-out`

## Driving it with shell

Preconditions: `npm install` and `npm run build` (the script invokes the workspace CLI which rebuilds as needed).

- Action: `npm run demo`
  Expect: stdout ends with `Demo complete.` and lists `ok:` for each required report.
- Action: `grep -q "Billing Platform" artifacts/cubeconvert-demo/reports/executive-summary.md`
  Expect: success.

## Gotchas

- Default out dir is gitignored `artifacts/cubeconvert-demo/`.
- The script fails fast if any required report file is missing.
