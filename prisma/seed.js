const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  // Criar empresa
  const company = await prisma.company.create({
    data: {
      nomeFantasia: "Barbearia do João",
      razaoSocial: "Barbearia do João LTDA",
      cnpjCpf: "12345678901234",
      telefone: "(11) 99999-9999",
      email: "contato@barbeariadojoao.com",
    },
  });

  // Horários de funcionamento
  await prisma.workingHours.createMany({
    data: [
      {
        companyId: company.id,
        dayOfWeek: 1,
        openTime: "09:00",
        closeTime: "18:00",
      },
      {
        companyId: company.id,
        dayOfWeek: 2,
        openTime: "09:00",
        closeTime: "18:00",
      },
      {
        companyId: company.id,
        dayOfWeek: 3,
        openTime: "09:00",
        closeTime: "18:00",
      },
      {
        companyId: company.id,
        dayOfWeek: 4,
        openTime: "09:00",
        closeTime: "18:00",
      },
      {
        companyId: company.id,
        dayOfWeek: 5,
        openTime: "09:00",
        closeTime: "18:00",
      },
    ],
  });

  // Serviços
  const corte = await prisma.service.create({
    data: {
      companyId: company.id,
      name: "Corte de Cabelo",
      price: 50,
      duration: 30,
    },
  });
  const barba = await prisma.service.create({
    data: { companyId: company.id, name: "Barba", price: 35, duration: 20 },
  });

  // Usuários
  const owner = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "joao@barbearia.com",
      password: "senha123",
      role: "OWNER",
      companyId: company.id,
    },
  });
  const employee = await prisma.user.create({
    data: {
      name: "Carlos Pereira",
      email: "carlos@barbearia.com",
      password: "senha123",
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  // Profissional ⇔ serviços
  await prisma.professionalService.createMany({
    data: [
      { professionalId: employee.id, serviceId: corte.id },
      { professionalId: employee.id, serviceId: barba.id },
    ],
  });

  // Agendamento de teste
  await prisma.appointment.create({
    data: {
      companyId: company.id,
      professionalId: employee.id,
      clientName: "Cliente Teste",
      serviceId: corte.id,
      price: 50,
      startTime: new Date("2025-09-29T10:00:00"),
      endTime: new Date("2025-09-29T10:30:00"),
      status: "CONFIRMED",
    },
  });

  console.log("🌱 Seed executado com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
