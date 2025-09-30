const { PrismaClient } = require("@prisma/client");
(async () => {
  const prisma = new PrismaClient();
  try {
    const companyId = process.argv[2];
    const from = process.argv[3];
    const to = process.argv[4];
    if (!companyId || !from || !to) {
      console.error(
        "usage: node scripts/queryAppointments.js <companyId> <from> <to>"
      );
      process.exit(1);
    }
    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);
    const appts = await prisma.appointment.findMany({
      where: { companyId, startTime: { gte: fromDate, lte: toDate } },
      orderBy: { startTime: "asc" },
    });
    console.log("found", appts.length, "appointments");
    appts.forEach((a) =>
      console.log(a.id, a.startTime.toISOString(), a.serviceId)
    );
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
