# Doctor host checks

`stratosphere doctor` reports platform info, writable output paths, and required or optional host commands.

## Sub-features

- `doctor-header`: prints `Stratosphere Doctor` and platform line
- `writable-probe`: reports whether the requested out dir is writable
- `command-checks`: lists required and optional command status

## How to get to it (user POV)

1. Run `npm run doctor -- --out-dir /tmp/stratosphere-doctor-probe` or `node apps/bin/dist/stratosphere.js doctor --out-dir /tmp/stratosphere-doctor-probe`.

## Driving it with shell

Preconditions: built binary exists.

- Action: run doctor with a writable probe path.
  Expect: stdout includes `Stratosphere Doctor` and a `Writable:` line.
- Action: read the final status line.
  Expect: `Doctor status: OK` when required commands exist, otherwise a failed status with install hints.

## Gotchas

- Optional missing tools do not always fail the run; read `Missing required commands`.
- Doctor does not start MCP or generate a migration bundle.
