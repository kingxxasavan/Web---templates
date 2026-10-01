// Apply only to reads: timing out must never pretend a purchase write failed
// while an uncancelled mutation may still complete in the background.
export async function withReadTimeout(read, timeoutMs = 3000, label = "Database") {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(read),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error(label + " read timed out. Please check the connection and credentials.");
          error.code = "ETIMEDOUT";
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally { clearTimeout(timer); }
}
