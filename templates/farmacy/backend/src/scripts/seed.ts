import { prisma } from "@/config/prisma.js";
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10;

const seed = async () => {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmacia.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@farmacia.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('Staff123!', SALT_ROUNDS);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@farmacia.com' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@farmacia.com',
      password: staffPassword,
      role: 'staff',
    },
  });
  console.log('✅ Staff user created:', staff.email);

  // Create sample lab
  const lab = await prisma.lab.upsert({
    where: { id: 'lab-farma' },
    update: {},
    create: {
      id: 'lab-farma',
      name: 'Lab Farma',
    },
  });
  console.log('✅ Lab created:', lab.name);

  // Create sample category
  const category = await prisma.category.upsert({
    where: { id: 'cat-analgesics' },
    update: {},
    create: {
      id: 'cat-analgesics',
      name: 'Analgesics',
    },
  });
  console.log('✅ Category created:', category.name);

  // Create sample medicines
  const medicines = [
    {
      tradeName: 'Ibuprofeno 400mg',
      genericName: 'Ibuprofeno',
      description: 'Anti-inflammatory drug',
      price: 12.50,
      stock: 100,
      laboratoryId: lab.id,
      categoryId: category.id,
    },
    {
      tradeName: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      description: 'Pain reliever and fever reducer',
      price: 8.00,
      stock: 150,
      laboratoryId: lab.id,
      categoryId: category.id,
    },
  ];

  for (const med of medicines) {
    const medId = med.tradeName.toLowerCase().replace(/\s+/g, '-').replace(/[0-9]+/g, '');
    const medicine = await prisma.medicine.upsert({
      where: { id: medId },
      update: {},
      create: {
        id: medId,
        ...med,
      },
    });
    console.log('✅ Medicine created:', medicine.tradeName);
  }

  // Create sample client
  const client = await prisma.client.upsert({
    where: { documentNumber: '12345678' },
    update: {},
    create: {
      name: 'Juan Pérez',
      documentNumber: '12345678',
      email: 'juan@email.com',
      phone: '555-1234',
      membership: 'silver',
    },
  });
  console.log('✅ Client created:', client.name);

  console.log('🎉 Seed completed!');
};

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
