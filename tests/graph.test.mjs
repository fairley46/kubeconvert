import assert from "node:assert/strict";
import test from "node:test";
import { buildVmDnaGraph } from "../packages/engine/dist/graph.js";

test("buildVmDnaGraph creates nodes and edges for core runtime entities", () => {
  const discovery = {
    runtime: {
      host: { hostname: "vm-b", os: "linux", distro: "Rocky", ip: "10.0.0.2" },
      processes: [
        {
          pid: 200,
          name: "api",
          command: "node index.js",
          user: "app",
          cpuPercent: 8,
          memoryMb: 256,
          listeningPorts: [3000],
          fileWrites: ["/var/log/api.log"],
          envHints: {},
        },
      ],
      connections: [
        {
          processName: "api",
          toHost: "postgres.internal",
          toPort: 5432,
          protocol: "tcp",
        },
      ],
      scheduledJobs: [],
      source: {
        repositoryPath: "git@github.com:acme/api.git",
        detectedStacks: ["nodejs"],
        buildFiles: ["package.json"],
      },
    },
    evidence: {
      collector: "snapshot",
      commands: [],
      warnings: [],
      collectedAt: new Date().toISOString(),
      commandResults: [],
    },
  };

  const graph = buildVmDnaGraph("mig-1", discovery);

  assert.ok(graph.nodes.find((node) => node.type === "host"));
  assert.ok(graph.nodes.find((node) => node.type === "process"));
  assert.ok(graph.nodes.find((node) => node.type === "external-service"));
  assert.ok(graph.nodes.find((node) => node.type === "source-repo"));
  assert.ok(graph.edges.find((edge) => edge.type === "calls"));
});

test("buildVmDnaGraph skips unmatched connections/jobs and de-duplicates nodes", () => {
  const discovery = {
    runtime: {
      host: { hostname: "vm-c", os: "linux", distro: "RHEL", ip: "10.0.0.3" },
      processes: [
        {
          pid: 201,
          name: "worker",
          command: "python worker.py",
          user: "app",
          cpuPercent: 3,
          memoryMb: 128,
          listeningPorts: [9000, 9000],
          fileWrites: ["/data/out.log", "/data/out.log"],
          envHints: {},
        },
      ],
      connections: [
        { processName: "missing", toHost: "ghost", toPort: 1111, protocol: "tcp" },
        { processName: "worker", toHost: "cache.internal", toPort: 6379, protocol: "tcp" },
      ],
      scheduledJobs: [
        { name: "unknown-job", schedule: "* * * * *", command: "run missing", source: "cron" },
        { name: "worker-job", schedule: "0 * * * *", command: "python worker", source: "cron" },
      ],
      source: undefined,
    },
    evidence: {
      collector: "snapshot",
      commands: [],
      warnings: [],
      collectedAt: new Date().toISOString(),
      commandResults: [],
    },
  };

  const graph = buildVmDnaGraph("mig-2", discovery);
  assert.ok(graph.nodes.some((node) => node.type === "scheduled-job"));
  assert.ok(graph.edges.some((edge) => edge.type === "scheduled-as"));
  assert.ok(!graph.nodes.some((node) => node.type === "source-repo"));
  assert.equal(graph.nodes.filter((node) => node.id === "port:9000").length, 1);
});

function discoveryForHost(hostname) {
  return {
    runtime: {
      host: { hostname, os: "linux", distro: "Rocky", ip: "10.0.0.9" },
      processes: [],
      connections: [],
      scheduledJobs: [],
    },
    evidence: {
      collector: "snapshot",
      commands: [],
      warnings: [],
      collectedAt: "2026-01-01T00:00:00.000Z",
      commandResults: [],
    },
  };
}

function hostNodeId(hostname) {
  const graph = buildVmDnaGraph("mig-slug", discoveryForHost(hostname));
  return graph.nodes.find((node) => node.type === "host").id;
}

test("buildVmDnaGraph collapses hostname runs into a 64-character slug", () => {
  assert.equal(hostNodeId("Foo---Bar!!!"), "host:foo-bar");
  assert.equal(hostNodeId("---Foo---Bar---"), "host:foo-bar");
  assert.equal(hostNodeId("---"), "host:");
  assert.equal(hostNodeId("A".repeat(70)), `host:${"a".repeat(64)}`);
  assert.equal(hostNodeId("a!".repeat(40)), `host:${"a-".repeat(32)}`);
});

test("buildVmDnaGraph slugs a long non-prefix separator run within 500ms", () => {
  const hostname = `a${"-".repeat(80_000)}b`;
  const start = performance.now();
  const id = hostNodeId(hostname);
  const elapsed = performance.now() - start;
  assert.equal(id, "host:a-b");
  assert.ok(elapsed < 500, `slug elapsed ${elapsed}ms`);
});
