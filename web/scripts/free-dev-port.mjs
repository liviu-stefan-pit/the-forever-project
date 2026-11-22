import { execFileSync } from "node:child_process";
import process from "node:process";

const PORT = 5173;

function run(cmd, args, { allowFail = false } = {}) {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    if (allowFail) {
      if (err && err.code === "ENOENT") throw err;
      return typeof err.stdout === "string" ? err.stdout : "";
    }
    throw err;
  }
}

function localPort(localAddress) {
  const m = String(localAddress).match(/:(\d+)$/);
  return m ? Number(m[1]) : NaN;
}

function windowsListeningPids(port) {
  // Vite on "localhost" usually binds IPv6 ([::1]:5173), which `-p tcp` (IPv4 only) never lists.
  const out = ["tcp", "tcpv6"].map((p) => run("netstat", ["-ano", "-p", p], { allowFail: true })).join("\n");
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Proto  Local Address  Foreign Address  State  PID
    const parts = trimmed.split(/\s+/);
    if (parts.length < 5) continue;
    const [proto, local, , state, pidStr] = parts;
    if (proto.toUpperCase() !== "TCP") continue;
    if (state.toUpperCase() !== "LISTENING") continue;
    if (localPort(local) !== port) continue;
    const pid = Number(pidStr);
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

function unixListeningPids(port) {
  let out;
  try {
    out = run("lsof", ["-ti", `tcp:${port}`], { allowFail: true });
  } catch (err) {
    if (err && err.code === "ENOENT") {
      console.log(`lsof not found; skipping free of port ${port}.`);
      return null;
    }
    throw err;
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const pid = Number(line.trim());
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

function windowsImageName(pid) {
  const out = run("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], {
    allowFail: true,
  });
  // "image.exe","pid","session","session#","mem"
  const match = out.match(/^"([^"]+)"/);
  return match ? match[1] : out.trim() || "(unknown)";
}

function unixImageName(pid) {
  const out = run("ps", ["-p", String(pid), "-o", "comm="], { allowFail: true }).trim();
  return out || "(unknown)";
}

function isNodeImage(image) {
  const base = image.replace(/^"|"$/g, "").split(/[/\\]/).pop() ?? "";
  return /^node(\.exe)?$/i.test(base);
}

function freePort() {
  const isWin = process.platform === "win32";
  let pids;
  if (isWin) {
    pids = windowsListeningPids(PORT);
  } else {
    pids = unixListeningPids(PORT);
    if (pids === null) process.exit(0);
  }

  const me = process.pid;
  for (const pid of pids) {
    if (pid === 0 || pid === me) continue;

    const image = isWin ? windowsImageName(pid) : unixImageName(pid);
    if (!isNodeImage(image)) {
      console.error(
        `Port ${PORT} is held by PID ${pid} (${image}), not node. Close it yourself, then retry.`,
      );
      process.exit(1);
    }

    if (isWin) {
      run("taskkill", ["/F", "/PID", String(pid)], { allowFail: true });
    } else {
      try {
        process.kill(pid);
      } catch {
        // already gone
      }
    }
    console.log(
      `Closed the previous dev server (PID ${pid}) so http://localhost:${PORT} stays the same.`,
    );
  }
}

freePort();
