(async () => {
  const fetch = globalThis.fetch || (await import("node-fetch")).default;
  try {
    const cp = await fetch("http://localhost:3001/api/company");
    const companies = await cp.json();
    console.log(
      "companies",
      Array.isArray(companies) ? companies.length : companies
    );
    if (!Array.isArray(companies)) console.log(companies);
    if (Array.isArray(companies) && companies[0]) {
      const companyId = companies[0].id;
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const apptsRes = await fetch(
        `http://localhost:3001/api/appointments?companyId=${encodeURIComponent(
          companyId
        )}&from=${dateStr}&to=${dateStr}`
      );
      const appts = await apptsRes.json();
      console.log(
        "appts",
        apptsRes.status,
        Array.isArray(appts) ? appts.length : appts
      );
      if (Array.isArray(appts) && appts[0]) {
        const id = appts[0].id;
        const put = await fetch("http://localhost:3001/api/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "CONFIRMED" }),
        });
        console.log("PUT status", put.status);
        const body = await put.json();
        console.log("PUT body", body);
      }
    }
  } catch (e) {
    console.error("err", e.message);
  }
})();
