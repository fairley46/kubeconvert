#!/usr/bin/env node
import { runCli } from "@kubeconvert/cli";
import { toErrorPayload, toUserFacingError, sanitizeErrorDetails } from "@kubeconvert/engine";
import { runMcpServer } from "@kubeconvert/mcp";
import { pathToFileURL } from "node:url";
import { runDoctor } from "./doctor.js";

const VERSION = "0.1.0";

function printUsage(): void {
  console.log(`KubeConvert

Usage:
  kubeconvert [cli flags]
  kubeconvert doctor [--out-dir <path>] [--json]
  kubeconvert mcp
  kubeconvert version

Examples:
  kubeconvert --runtime-file fixtures/kubeconvert/sample-runtime.json --out-dir artifacts/my-migration
  kubeconvert --local-discovery --out-dir artifacts/my-migration
  kubeconvert doctor
  kubeconvert mcp
`);
}

function printMcpUsage(): void {
  console.log(`Usage: kubeconvert mcp

Starts the KubeConvert MCP server over stdio.
`);
}

function printTopLevelError(error: unknown, operation: string): void {
  const payload = toErrorPayload(error);
  const user = toUserFacingError(error, { operation });
  const details = sanitizeErrorDetails(payload.details);

  console.error("KubeConvert could not complete your request.");
  console.error(`Issue: ${user.title}`);
  console.error(`Code: ${payload.code}`);
  console.error(`What happened: ${user.message}`);
  console.error(`Guidance: ${user.hint}`);
  if (details) {
    console.error(`Details: ${JSON.stringify(details, null, 2)}`);
  }
}

function isHelpFlag(value: string): boolean {
  return value === "--help" || value === "-h" || value === "help";
}

export async function runKubeConvert(argv: string[] = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0) {
    printUsage();
    return 0;
  }

  const [command, ...rest] = argv;

  if (command === "version" || command === "--version" || command === "-v") {
    console.log(`kubeconvert ${VERSION}`);
    return 0;
  }

  if (isHelpFlag(command)) {
    printUsage();
    return 0;
  }

  if (command === "doctor") {
    return runDoctor(rest);
  }

  if (command === "mcp") {
    if (rest.some(isHelpFlag)) {
      printMcpUsage();
      return 0;
    }
    await runMcpServer();
    return 0;
  }

  // Fall through to CLI mode for all migration flags.
  await runCli(argv);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runKubeConvert()
    .then((exitCode) => {
      if (exitCode !== 0) process.exit(exitCode);
    })
    .catch((error: unknown) => {
      printTopLevelError(error, "BINARY_RUN");
      process.exit(1);
    });
}
