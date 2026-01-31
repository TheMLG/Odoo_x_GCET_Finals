import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

const hash = (pwd) => bcrypt.hash(pwd, 10);

const categories = [
  "Electronics",
  "Construction",
  "Photography",
  "Event Equipment",
  "Home Appliances",
];

const productsByCategory = {
  Electronics: ["DSLR Camera", "Drone", "Projector"],
  Construction: ["Concrete Mixer", "Jack Hammer"],
  Photography: ["Tripod", "Lighting Kit"],
  "Event Equipment": ["Sound System", "LED Wall"],
  "Home Appliances": ["Washing Machine", "Air Conditioner"],
};

async function main() {
  console.log("🌱 Starting database seed...");

  /* ───────────────────────── ROLES ───────────────────────── */

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const vendorRole = await prisma.role.upsert({
    where: { name: "VENDOR" },
    update: {},
    create: { name: "VENDOR" },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER" },
  });

  /* ───────────────────────── ADMIN ───────────────────────── */

  await prisma.user.upsert({
    where: { email: "admin@odoo.com" },
    update: {},
    create: {
      email: "admin@odoo.com",
      password: await hash("Admin@123"),
      firstName: "Admin",
      lastName: "User",
      roles: {
        create: { roleId: adminRole.id },
      },
    },
  });

  /* ───────────────────────── VENDORS ───────────────────────── */

  const vendors = [];

  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.upsert({
      where: { email: `vendor${i}@odoo.com` },
      update: {},
      create: {
        email: `vendor${i}@odoo.com`,
        password: await hash(`Vendor@${i}23`),
        firstName: "Vendor",
        lastName: `${i}`,
        roles: {
          create: { roleId: vendorRole.id },
        },
        vendor: {
          create: {
            companyName: `Rental Co ${i}`,
            gstNo: `22AAAAA000${i}A1Z${i}`,
            product_category: categories[i % categories.length],
          },
        },
      },
      include: { vendor: true },
    });

    vendors.push(user.vendor);
  }

  /* ───────────────────────── CUSTOMERS ───────────────────────── */

  const customers = [];

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `customer${i}@odoo.com` },
      update: {},
      create: {
        email: `customer${i}@odoo.com`,
        password: await hash(`Customer@${i}23`),
        firstName: "Customer",
        lastName: `${i}`,
        roles: {
          create: { roleId: customerRole.id },
        },
      },
    });

    customers.push(user);
  }

  /* ───────────────────────── ATTRIBUTES ───────────────────────── */

  const colorAttr = await prisma.attribute.upsert({
    where: { name: "Color" },
    update: {},
    create: { name: "Color" },
  });

  const sizeAttr = await prisma.attribute.upsert({
    where: { name: "Size" },
    update: {},
    create: { name: "Size" },
  });

  const red = await prisma.attributeValue.create({
    data: { id: "RED", attributeId: colorAttr.id, value: "Red" },
  });

  const blue = await prisma.attributeValue.create({
    data: { id: "BLUE", attributeId: colorAttr.id, value: "Blue" },
  });

  const large = await prisma.attributeValue.create({
    data: { id: "L", attributeId: sizeAttr.id, value: "Large" },
  });

  /* ───────────────────────── PRODUCTS ───────────────────────── */

  const products = [];

  for (const vendor of vendors) {
    const names = productsByCategory[vendor.product_category] || [
      "Generic Item",
    ];

    for (const name of names) {
      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name,
          description: `${name} available for rent`,
          isPublished: true,
          inventory: {
            create: {
              totalQty: Math.floor(Math.random() * 20) + 5,
            },
          },
          pricing: {
            createMany: {
              data: [
                { type: "DAY", price: Math.floor(Math.random() * 2000) + 500 },
                {
                  type: "WEEK",
                  price: Math.floor(Math.random() * 8000) + 3000,
                },
              ],
            },
          },
          attributes: {
            createMany: {
              data: [
                {
                  attributeId: colorAttr.id,
                  attributeValueId: Math.random() > 0.5 ? red.id : blue.id,
                },
                {
                  attributeId: sizeAttr.id,
                  attributeValueId: large.id,
                },
              ],
            },
          },
        },
      });

      products.push(product);
    }
  }

  /* ───────────────────────── CARTS + ORDERS ───────────────────────── */

  for (const customer of customers) {
    const product = products[Math.floor(Math.random() * products.length)];
    const start = new Date();
    const end = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const cart = await prisma.cart.create({
      data: {
        userId: customer.id,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            rentalStart: start,
            rentalEnd: end,
            unitPrice: 1200,
          },
        },
      },
      include: { items: true },
    });

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        vendorId: product.vendorId,
        status: "CONFIRMED",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            rentalStart: item.rentalStart,
            rentalEnd: item.rentalEnd,
            unitPrice: item.unitPrice,
            reservations: {
              create: {
                productId: item.productId,
                reservedFrom: item.rentalStart,
                reservedTo: item.rentalEnd,
                quantity: item.quantity,
              },
            },
          })),
        },
      },
    });

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        totalAmount: 1200,
        gstAmount: 216,
        status: "PAID",
        payments: {
          create: {
            amount: 1416,
            mode: "UPI",
            status: "SUCCESS",
            paidAt: new Date(),
          },
        },
      },
    });
  }

  console.log("🎉 Database seeded successfully");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
