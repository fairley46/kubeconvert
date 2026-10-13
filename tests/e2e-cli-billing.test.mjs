import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { initExecutionWorkflow } from "../packages/engine/dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "apps/bin/dist/cubeconvert.js");
const runtimeFile = join(root, "fixtures/cubeconvert/sample-runtime.json");
const intakeFile = join(root, "fixtures/cubeconvert/sample-intake.json");
const workspaceFile = join(root, "fixtures/cubeconvert/sample-workspace.json");

test("CLI end-to-end: billing fixture produces governed migration package", () => {
  assert.ok(existsSync(bin), "build apps/bin before running e2e (npm run build)");

  const outDir = mkdtempSync(join(tmpdir(), "cubeconvert-e2e-billing-"));

  const cli = spawnSync(
    process.execPath,
    [
      bin,
      "--runtime-file",
      runtimeFile,
      "--strategy",
      "balanced",
      "--intake-file",
      intakeFile,
      "--workspace-file",
      workspaceFile,
      "--signoff-required-approvers",
      "2",
      "--export-provider",
      "github",
      "--export-owner",
      "acme-enterprise",
      "--export-repo",
      "billing-modernization",
      "--out-dir",
      outDir,
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: process.env,
    }
  );

  assert.equal(cli.status, 0, `CLI failed:\nstdout:\n${cli.stdout}\nstderr:\n${cli.stderr}`);
  assert.match(cli.stdout, /Migration package generated at/);
  assert.match(cli.stdout, /workloads=3/);
  assert.match(cli.stdout, /signoff=PENDING/);
  assert.match(cli.stdout, /repositoryExport provider=github dryRun=true/);

  const executiveSummary = readFileSync(join(outDir, "reports/executive-summary.md"), "utf8");
  assert.match(executiveSummary, /Billing Platform/);
  assert.match(executiveSummary, /Finance Operations/);
  assert.match(executiveSummary, /3 application component/);

  const readiness = JSON.parse(readFileSync(join(outDir, "reports/readiness.json"), "utf8"));
  assert.ok(typeof readiness.score === "number");

  const cutover = JSON.parse(readFileSync(join(outDir, "reports/cutover-plan.json"), "utf8"));
  assert.equal(cutover.mode, "blue-green");

  const exportPlan = JSON.parse(readFileSync(join(outDir, "reports/repository-export.json"), "utf8"));
  assert.equal(exportPlan.provider, "github");
  assert.equal(exportPlan.dryRun, true);
  assert.ok(
    exportPlan.actions.some(
      (action) =>
        action.kind === "create-repository" &&
        String(action.description).includes("acme-enterprise/billing-modernization")
    )
  );

  assert.ok(existsSync(join(outDir, "docker/billing-api/Dockerfile")));
  assert.ok(existsSync(join(outDir, "docker/invoice-worker/Dockerfile")));
  assert.ok(existsSync(join(outDir, "docker/cleanup-job/Dockerfile")));
  assert.ok(existsSync(join(outDir, "helm/Chart.yaml")));
  assert.ok(existsSync(join(outDir, "helm/values.yaml")));
  assert.ok(existsSync(join(outDir, "reports/application-map-current.md")));
  assert.ok(existsSync(join(outDir, "reports/application-map-future.md")));

  const workflow = initExecutionWorkflow({
    migrationId: "e2e-billing",
    bundleDir: outDir,
    targetEnvironment: "demo-k8s",
    requiredApprovers: 2,
  });
  assert.equal(workflow.requiredApprovers, 2);
  assert.ok(existsSync(join(outDir, "reports/execution-job.json")));

  const executionJob = JSON.parse(readFileSync(join(outDir, "reports/execution-job.json"), "utf8"));
  assert.equal(executionJob.migrationId, "e2e-billing");
  assert.equal(executionJob.targetEnvironment, "demo-k8s");

  rmSync(outDir, { recursive: true, force: true });
});
