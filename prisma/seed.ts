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
      name: "Pão Francês",
      description: "Pão francês tradicional, crocante por fora e macio por dentro.",
      price: 0.75,
      category: "Pães",
      weight: "50g",
      ingredients: "Farinha de trigo, água, sal, fermento",
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    },
    {
      name: "Pão de Forma Integral",
      description: "Pão de forma integral com grãos, ideal para um café da manhã saudável.",
      price: 12.9,
      category: "Pães",
      weight: "500g",
      ingredients: "Farinha integral, grãos, mel, fermento",
      imageUrl:
        "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80",
    },
    {
      name: "Bolo de Chocolate",
      description: "Bolo de chocolate com cobertura cremosa, perfeito para celebrações.",
      price: 45.0,
      category: "Bolos",
      weight: "1kg",
      ingredients: "Chocolate, ovos, farinha, açúcar, manteiga",
      imageUrl:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    },
    {
      name: "Croissant",
      description: "Croissant amanteigado, folhado e dourado.",
      price: 8.5,
      category: "Doces",
      weight: "80g",
      ingredients: "Farinha, manteiga, fermento, açúcar",
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    },
    {
      name: "Empada de Frango",
      description: "Empada recheada com frango desfiado temperado.",
      price: 6.0,
      category: "Salgados",
      weight: "100g",
      ingredients: "Farinha, frango, temperos, ovos",
      imageUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
    },
    {
      name: "Café Expresso",
      description: "Café expresso encorpado, torrado na hora.",
      price: 5.0,
      category: "Bebidas",
      weight: "50ml",
      ingredients: "Grãos de café arábica",
      imageUrl:
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    },
  ];

  const existingCount = await prisma.product.count();
  if (existingCount === 0) {
    await prisma.product.createMany({ data: products });
  }

  const imageFixes: Record<string, string> = {
    "Bolo de Chocolate":
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    "Café Expresso":
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
  };

  for (const [name, imageUrl] of Object.entries(imageFixes)) {
    await prisma.product.updateMany({ where: { name }, data: { imageUrl } });
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
