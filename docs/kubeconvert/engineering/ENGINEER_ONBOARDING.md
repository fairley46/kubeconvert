# Engineer Onboarding

## Goal
Get a new engineer productive with KubeConvert in under 30 minutes.

If you are running from source checkout and the `kubeconvert` executable is not on your `PATH`, use `npm run kubeconvert --` and `npm run mcp:start` equivalents.

## 1) Local Setup
```bash
cd /path/to/kubeconvert
npm install
npm run build
```

## 2) Run a Full Example
```bash
kubeconvert \
  --runtime-file fixtures/kubeconvert/sample-runtime.json \
  --strategy balanced \
  --intake-file fixtures/kubeconvert/sample-intake.json \
  --workspace-file fixtures/kubeconvert/sample-workspace.json \
  --signoff-required-approvers 2 \
  --out-dir artifacts/kubeconvert
```

Optional guided intake (non-technical flow):
```bash
kubeconvert \
  --wizard \
  --runtime-file fixtures/kubeconvert/sample-runtime.json \
  --out-dir artifacts/kubeconvert
```

## 3) Validate Quality Gates
```bash
npm run test
npm run test:coverage
```

## 4) Key Artifacts to Inspect
1. `reports/executive-summary.md`
2. `reports/application-map-current.md`
3. `reports/application-map-future.md`
4. `reports/migration-options.md`
5. `reports/readiness.md`
6. `reports/business-impact.md`
7. `reports/cutover-plan.md`

## 5) Core Extension Points
1. Discovery adapters:
   - `packages/engine/src/discovery.ts`
2. Decomposition logic:
   - `packages/engine/src/decompose.ts`
3. Decision/reporting layer:
   - `packages/engine/src/decision.ts`
   - `packages/engine/src/business-impact.ts`
   - `packages/engine/src/cutover.ts`
4. Export policy and provider integration:
   - `packages/engine/src/repository-export.ts`
5. Workflow state machine:
   - `packages/engine/src/execution-workflow.ts`

## 6) MCP Mode (Agent Access)
Start the MCP server:
```bash
kubeconvert mcp
```

Primary MCP tools for full flow:
1. `generate_migration_bundle`
2. `init_execution_workflow`
3. `review_execution_workflow`
4. `approve_execution_workflow`
5. `run_execution_preflight`
6. `execute_workflow`

## 7) Troubleshooting
1. Missing required input:
   - Check CLI/MCP `code`, `message`, and `hint` fields.
2. Coverage gate failure:
   - Run `npm run test:coverage` and add branch-targeted tests.
3. Export execution not allowed:
   - Confirm `--export-execute` plus `KUBECONVERT_ENABLE_EXPORT_EXECUTION=true` and token env var.
   - For enterprise providers, set `--export-auth-mode oauth` and provider base URLs when needed.
4. Snapshot mode errors:
   - Ensure `--runtime-file` is present and valid JSON schema.
