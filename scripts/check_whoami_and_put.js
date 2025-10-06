(async () => {
  const fetch = globalThis.fetch || (await import("node-fetch")).default;
  try {
    const who = await fetch("http://localhost:3001/api/auth/whoami");
    console.log("who status", who.status);
    const whoR = await who.json().catch(() => null);
    console.log("who body", whoR);
    if (whoR?.user?.companyId) {
      const companyId = whoR.user.companyId;
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const apptsRes = await fetch(
        `http://localhost:3001/api/appointments?companyId=${encodeURIComponent(
          companyId
        )}&from=${dateStr}&to=${dateStr}`
      );
      const appts = await apptsRes.json().catch(() => null);
      console.log("appts", apptsRes.status, appts?.data ?? appts);
      const list = Array.isArray(appts) ? appts : appts?.data;
      if (Array.isArray(list) && list[0]) {
        const id = list[0].id;
        const put = await fetch("http://localhost:3001/api/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "CONFIRMED" }),
        });
        console.log("PUT status", put.status);
        const body = await put.json().catch(() => null);
        console.log("PUT body", body);
      }
    }
  } catch (e) {
    console.error("err", e.message);
  }
})();
