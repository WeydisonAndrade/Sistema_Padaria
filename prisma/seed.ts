import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@padaria.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: "Administrador",
    },
  });

  await prisma.bakerySettings.upsert({
    where: { id: "default" },
    update: {
      name: "Tutti Pane",
      description:
        "Sabor e qualidade em cada fornada. Pães artesanais, bolos e doces feitos com ingredientes selecionados e muito carinho.",
    },
    create: {
      id: "default",
      name: "Tutti Pane",
      description:
        "Sabor e qualidade em cada fornada. Pães artesanais, bolos e doces feitos com ingredientes selecionados e muito carinho.",
      address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
      phone: "5511999999999",
      whatsapp: "5511999999999",
      latitude: -23.5614,
      longitude: -46.6559,
      openingHours: "Seg-Sáb: 6h às 20h | Dom: 6h às 14h",
    },
  });

  const products = [
    {
      code: "PAO001",
      name: "Pão Francês",
      category: "Pães",
      price: 0.75,
      stockQuantity: 200,
      expirationDate: null,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
      active: true,
    },
    {
      code: "PAO002",
      name: "Pão de Forma Integral",
      category: "Pães",
      price: 12.9,
      stockQuantity: 30,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80",
      active: true,
    },
    {
      code: "BOL001",
      name: "Bolo de Chocolate",
      category: "Bolos",
      price: 45.0,
      stockQuantity: 8,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
      active: true,
    },
    {
      code: "DOC001",
      name: "Croissant",
      category: "Doces",
      price: 8.5,
      stockQuantity: 50,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
      active: true,
    },
    {
      code: "SAL001",
      name: "Empada de Frango",
      category: "Salgados",
      price: 6.0,
      stockQuantity: 40,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
      active: true,
    },
    {
      code: "BEB001",
      name: "Café Expresso",
      category: "Bebidas",
      price: 5.0,
      stockQuantity: 100,
      expirationDate: null,
      imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: product,
      create: product,
    });
  }

  console.log("Seed concluído!");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
