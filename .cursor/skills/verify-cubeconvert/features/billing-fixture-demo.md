# Billing fixture migration package

Runs CubeConvert against the committed billing VM fixture with intake, workspace, and a dry-run GitHub export plan, then checks the governed bundle.

## Sub-features

- `cli-billing-run`: CLI exits 0 and prints `workloads=3` with `signoff=PENDING`
- `executive-summary`: `reports/executive-summary.md` names Billing Platform
- `bundle-layout`: Dockerfiles for billing-api, invoice-worker, cleanup-job plus `helm/Chart.yaml`
- `export-plan`: `reports/repository-export.json` plans `acme-enterprise/billing-modernization` in dry-run

## How to get to it (user POV)

1. From repo root after build, run `npm run cubeconvert --` with the sample runtime, intake, and workspace fixtures.
2. Open `$OUT_DIR/reports/executive-summary.md`.

## Driving it with shell

Preconditions: `npm run build` completed; disposable `$OUT_DIR`.

- Action: run the billing fixture CLI command from the skill Launch section.
  Expect: exit 0; stdout contains `Migration package generated at` and `repositoryExport provider=github dryRun=true`.
- Action: `test -f "$OUT_DIR/reports/executive-summary.md" && grep -q "Billing Platform" "$OUT_DIR/reports/executive-summary.md"`.
  Expect: success.
- Action: `test -f "$OUT_DIR/docker/billing-api/Dockerfile" && test -f "$OUT_DIR/helm/Chart.yaml"`.
  Expect: success.

CI equivalent: `node --test tests/e2e-cli-billing.test.mjs`.

## Gotchas

- Paths are relative to the invoke cwd. Run from the repo root.
- Without `--export-provider`, `repository-export.json` is absent.
- `--wizard` cannot be combined with intake or workspace files.
