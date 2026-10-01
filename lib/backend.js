import { rtdbConfigured } from "./backends/rtdb/client.js";
import * as rtdb from "./backends/rtdb/ops.js";
import * as sql from "./backends/sql/ops.js";

/**
 * Picks the data backend. Realtime Database when a service account and a
 * database URL are present, libSQL otherwise — so a deployment moves between
 * them by changing environment variables, not code.
 */

let forced = null;

/** Tests pin a backend so both are covered by the same suite. */
export function forceBackend(name) {
  forced = name;
}

export function backendName() {
  return forced ?? (rtdbConfigured() ? "rtdb" : "sql");
}

export function backend() {
  return backendName() === "rtdb" ? rtdb : sql;
}
