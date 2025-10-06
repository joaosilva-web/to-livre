(async () => {
  try {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}`;
    console.log("local date:", date);

    const cs = await fetch("http://localhost:3001/api/company");
    const companies = await cs.json().catch(() => null);
    console.log(
      "companies response preview:",
      Array.isArray(companies)
        ? companies.length
        : JSON.stringify(companies).slice(0, 200)
    );
    const companyId =
      Array.isArray(companies) && companies[0]?.id
        ? companies[0].id
        : companies?.data?.[0]?.id;
    if (!companyId) {
      console.log("no companyId found");
      return;
    }

    const url = `http://localhost:3001/api/appointments?companyId=${encodeURIComponent(
      companyId
    )}&from=${date}&to=${date}`;
    console.log("fetching", url);
    const r = await fetch(url);
    console.log("status", r.status);
    const b = await r.text();
    console.log("bodySlice:", b.slice(0, 1000));
  } catch (err) {
    console.error(err);
  }
})();
