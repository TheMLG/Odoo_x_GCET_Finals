import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Roles
  console.log("Creating roles...");
  
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

  console.log("✅ Roles created:", { adminRole, vendorRole, customerRole });

  // Create Admin User
  console.log("Creating admin user...");
  
  const adminEmail = "admin@odoo.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log("✅ Admin user created:", {
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
    });
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Create Sample Vendor
  console.log("Creating sample vendor...");
  
  const vendorEmail = "vendor@odoo.com";
  const existingVendor = await prisma.user.findUnique({
    where: { email: vendorEmail },
  });

  if (!existingVendor) {
    const hashedPassword = await bcrypt.hash("Vendor@123", 10);
    
    const vendorUser = await prisma.user.create({
      data: {
        email: vendorEmail,
        password: hashedPassword,
        firstName: "Sample",
        lastName: "Vendor",
        roles: {
          create: {
            roleId: vendorRole.id,
          },
        },
        vendor: {
          create: {
            companyName: "Sample Rentals Co.",
            gstNo: "22AAAAA0000A1Z5",
            product_category: "Electronics",
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        vendor: true,
      },
    });

    console.log("✅ Sample vendor created:", {
      email: vendorUser.email,
      companyName: vendorUser.vendor?.companyName,
    });
  } else {
    console.log("ℹ️  Sample vendor already exists");
  }

  // Create Sample Customer
  console.log("Creating sample customer...");
  
  const customerEmail = "customer@odoo.com";
  const existingCustomer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!existingCustomer) {
    const hashedPassword = await bcrypt.hash("Customer@123", 10);
    
    const customerUser = await prisma.user.create({
      data: {
        email: customerEmail,
        password: hashedPassword,
        firstName: "Sample",
        lastName: "Customer",
        roles: {
          create: {
            roleId: customerRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log("✅ Sample customer created:", {
      email: customerUser.email,
      name: `${customerUser.firstName} ${customerUser.lastName}`,
    });
  } else {
    console.log("ℹ️  Sample customer already exists");
  }

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Email: admin@odoo.com");
  console.log("  Password: Admin@123");
  console.log("\nVendor:");
  console.log("  Email: vendor@odoo.com");
  console.log("  Password: Vendor@123");
  console.log("\nCustomer:");
  console.log("  Email: customer@odoo.com");
  console.log("  Password: Customer@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
