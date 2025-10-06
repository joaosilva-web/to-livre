const fetch = require("node-fetch");
(async () => {
  try {
    const whoRes = await fetch("http://localhost:3001/api/auth/whoami");
    const who = await whoRes.json().catch(() => null);
    console.log("whoami:", who);

    const companyId =
      who?.companyId ||
      who?.company?.id ||
      process.env.DEFAULT_COMPANY_ID ||
      null;
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}`;
    console.log("local date:", date);

    if (!companyId) {
      console.log("no companyId from whoami, fetching companies");
      const cs = await fetch("http://localhost:3001/api/company").then((r) =>
        r.json().catch(() => null)
      );
      console.log("companies:", cs);
      return;
    }

    const url = `http://localhost:3001/api/appointments?companyId=${encodeURIComponent(
      companyId
    )}&from=${date}&to=${date}`;
    console.log("fetching", url);
    const res = await fetch(url);
    console.log("status", res.status);
    const body = await res.text();
    console.log("body slice:", body.slice(0, 800));
  } catch (err) {
    console.error(err);
  }
})();
