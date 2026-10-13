# CubeConvert Quickstart

*For engineers getting CubeConvert running in under 10 minutes.*

If you are running from source checkout and do not have the release binary on your `PATH`, replace `cubeconvert` below with `npm run cubeconvert --`.

## Single binary commands (recommended on VMs)

```bash
cubeconvert doctor
cubeconvert --help
cubeconvert mcp
```

For SSH-first install details, see `ON_BOX_QUICKSTART.md`.

## Generate a migration package from a runtime snapshot

From the `cubeconvert/` directory:

```bash
cubeconvert \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --out-dir artifacts/cubeconvert
```

## Generate with audit and export planning

```bash
cubeconvert \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --initiated-by platform-team \
  --signoff-required-approvers 2 \
  --export-provider github \
  --export-owner my-org \
  --export-repo billing-migration
```

## Request export execution (policy-gated)

```bash
CUBECONVERT_ENABLE_EXPORT_EXECUTION=true GITHUB_TOKEN=*** \
cubeconvert \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --export-provider github \
  --export-owner my-org \
  --export-repo billing-migration \
  --export-auth-mode oauth \
  --export-branch codex/cubeconvert-migration \
  --export-target-branch main \
  --export-token-env GITHUB_TOKEN \
  --export-api-base-url https://api.github.com \
  --export-web-base-url https://github.com \
  --export-execute
```

## Run guided intake wizard (plain language)

```bash
cubeconvert \
  --wizard \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --out-dir artifacts/cubeconvert
```

## Generate with business intake + application workspace context

```bash
cubeconvert \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --strategy balanced \
  --intake-file fixtures/cubeconvert/sample-intake.json \
  --workspace-file fixtures/cubeconvert/sample-workspace.json \
  --out-dir artifacts/cubeconvert
```

## Generate from local VM discovery (no runtime file)

```bash
cubeconvert \
  --local-discovery \
  --initiated-by platform-team \
  --signoff-required-approvers 2 \
  --out-dir artifacts/cubeconvert
```

## Input validation behavior

- Conflicting inputs (example: `--local-discovery` with `--ssh-host`) are rejected.
- Missing required inputs return structured error output with code + hint.
- Invalid JSON snapshot files return explicit parse errors.

## Optional: include SSH connection metadata

```bash
cubeconvert \
  --runtime-file fixtures/cubeconvert/sample-runtime.json \
  --ssh-host 10.40.8.23 \
  --ssh-user migration-readonly \
  --ssh-port 22 \
  --out-dir artifacts/cubeconvert
```

## Print read-only SSH discovery command set

```bash
cubeconvert --print-ssh-commands
```

## Start MCP server

```bash
cubeconvert mcp
```

## MCP local-VM flow

Use MCP tool `generate_local_vm_bundle` when CubeConvert MCP is running on the target VM.

## Run tests

```bash
npm run test
npm run test:coverage
```

## Run full demo

```bash
npm run demo
```

## Generated bundle

- `docker/<component>/Dockerfile`
- `helm/Chart.yaml`
- `helm/values.yaml`
- `helm/templates/workloads.yaml`
- `helm/templates/services.yaml`
- `terraform/{aws,azure,gcp,openstack}/main.tf`
- `reports/decomposition.md`
- `reports/vm-dna.json`
- `reports/vm-dna-graph.json`
- `reports/validation.json`
- `reports/blue-green-runbook.md`
- `reports/migration-summary.json`
- `reports/executive-summary.md`
- `reports/intake.json` (when intake input is provided)
- `reports/workspace.json` (when workspace input is provided)
- `reports/runtime-profile-summary.json`
- `reports/runtime-profile-window.json`
- `reports/runtime-profile-window.md`
- `reports/source-analysis.json`
- `reports/migration-options.json`
- `reports/migration-options.md`
- `reports/readiness.json`
- `reports/readiness.md`
- `reports/roi-estimate.json`
- `reports/roi-estimate.md`
- `reports/business-impact.json`
- `reports/business-impact.md`
- `reports/cutover-plan.json`
- `reports/cutover-plan.md`
- `reports/glossary.json`
- `reports/glossary.md`
- `reports/executive-pack.json`
- `reports/executive-pack.md`
