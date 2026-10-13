---
name: verify-stratosphere
description: Drive Stratosphere's CLI migration flow with fixtures, doctor the binary, and capture report evidence. Use when verifying Stratosphere behavior, demos, or README claims.
---

# Verify Stratosphere

Primary surface: CLI (`stratosphere` via `npm run stratosphere` or `apps/bin/dist/stratosphere.js`). Secondary: `stratosphere doctor`, `stratosphere mcp` (stdio; needs an MCP host). There is no Web UI.

## Launch

From a clean clone:

```bash
npm install
npm run build
```

Ready when `apps/bin/dist/stratosphere.js` exists and `node apps/bin/dist/stratosphere.js --help` prints usage.

For an isolated demo run:

```bash
OUT_DIR="$(mktemp -d /tmp/stratosphere-verify-XXXX)"
npm run stratosphere -- \
  --runtime-file fixtures/stratosphere/sample-runtime.json \
  --strategy balanced \
  --intake-file fixtures/stratosphere/sample-intake.json \
  --workspace-file fixtures/stratosphere/sample-workspace.json \
  --signoff-required-approvers 2 \
  --export-provider github \
  --export-owner acme-enterprise \
  --export-repo billing-modernization \
  --out-dir "$OUT_DIR"
```

Or `npm run demo` (writes `artifacts/stratosphere-demo/` and `reports/execution-job.json`).

Teardown: delete only the out dir you created. Keep proof under `/tmp/stratosphere-proof-*` or `/opt/cursor/artifacts/`.

## Doctor

```bash
npm run doctor -- --out-dir /tmp/stratosphere-doctor-probe
# or
node apps/bin/dist/stratosphere.js doctor --out-dir /tmp/stratosphere-doctor-probe
```

Worth driving when stdout shows `Doctor status: OK` (or documents missing optional tools without failing required ones) and the probe path is writable.

## Drive

Harness: shell / tmux PTY. No browser.

Stable handles:

- Flags: `--runtime-file`, `--intake-file`, `--workspace-file`, `--out-dir`, `--strategy`, `--export-*`
- Success stdout: `Migration package generated at`, `workloads=`, `signoff=PENDING`
- Key files under `$OUT_DIR/reports/executive-summary.md`, `application-map-current.md`, `application-map-future.md`, `cutover-plan.json`, `repository-export.json`
- Workloads: `$OUT_DIR/docker/billing-api/Dockerfile`, `helm/Chart.yaml`

Do not combine `--wizard` with `--intake-file` or `--workspace-file`.

## Evidence

Proof standards:

- Exercise the real CLI path (or `npm run demo`), not internal setters alone.
- Capture the command, exit code, stdout summary line, and resulting report files.
- Side effects: Dockerfiles, Helm chart, and report JSON/MD under `--out-dir`.
- Store screenshots/transcripts under `/opt/cursor/artifacts/` (or a named proof dir). Cleanup must not delete them.

Automated CI proof: `tests/e2e-cli-billing.test.mjs` (runs in `npm run test`).

## Cleanup

```bash
rm -rf "$OUT_DIR"
# if using demo default:
rm -rf artifacts/stratosphere-demo
```

Never kill by process name. The CLI is short-lived; only remove directories you created.

## Helpers

Feature map: `.cursor/skills/verify-stratosphere/features/`.
