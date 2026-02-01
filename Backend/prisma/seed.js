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
  Electronics: ["Sony DSLR Camera", "DJI Drone Phantom", "Epson Projector", "JBL Bluetooth Speaker", "Samsung Smart TV 55\""],
  Construction: ["Concrete Mixer Machine", "Bosch Jack Hammer", "Hilti Drill Machine", "Scaffolding Set", "Compactor Machine"],
  Photography: ["Manfrotto Tripod", "Godox Lighting Kit", "Green Screen Setup", "Camera Gimbal Stabilizer", "Reflector Kit"],
  "Event Equipment": ["JBL Sound System 5000W", "LED Video Wall P3", "Shamiyana Tent 20x40", "Generator 5KVA", "Stage Platform Set"],
  "Home Appliances": ["LG Washing Machine", "Voltas Air Conditioner 1.5T", "Aquaguard Water Purifier", "Havells Inverter", "Symphony Air Cooler"],
};

// Indian Names Data
const indianFirstNames = {
  male: ["Rahul", "Amit", "Vikram", "Rajesh", "Suresh", "Arun", "Deepak", "Sanjay", "Manoj", "Pradeep"],
  female: ["Priya", "Anjali", "Neha", "Pooja", "Sunita", "Kavita", "Meera", "Asha", "Geeta", "Rekha"]
};

const indianLastNames = ["Sharma", "Patel", "Singh", "Kumar", "Verma", "Gupta", "Reddy", "Nair", "Iyer", "Joshi"];

const indianCities = [
  { city: "Mumbai", state: "Maharashtra", stateCode: "27", pincode: "400001" },
  { city: "Delhi", state: "Delhi", stateCode: "07", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", stateCode: "29", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", stateCode: "33", pincode: "600001" },
  { city: "Ahmedabad", state: "Gujarat", stateCode: "24", pincode: "380001" },
  { city: "Hyderabad", state: "Telangana", stateCode: "36", pincode: "500001" },
  { city: "Pune", state: "Maharashtra", stateCode: "27", pincode: "411001" },
  { city: "Jaipur", state: "Rajasthan", stateCode: "08", pincode: "302001" },
];

const vendorCompanyNames = [
  "Bharat Rentals Pvt Ltd",
  "Desi Equipment Solutions",
  "Hindustan Hire Services",
  "Shree Ganesh Rentals",
];

// Generate valid Indian GST Number
const generateGSTNumber = (stateCode, index) => {
  const pan = `AABCP${index}234${String.fromCharCode(65 + index)}`;
  return `${stateCode}${pan}1Z${index}`;
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
  const vendorNames = [
    { firstName: "Rajesh", lastName: "Sharma" },
    { firstName: "Amit", lastName: "Patel" },
    { firstName: "Suresh", lastName: "Gupta" },
    { firstName: "Vikram", lastName: "Singh" },
  ];

  for (let i = 1; i <= 4; i++) {
    const cityData = indianCities[i - 1];
    const vendorName = vendorNames[i - 1];
    
    const user = await prisma.user.upsert({
      where: { email: `vendor${i}@rentkar.in` },
      update: {},
      create: {
        email: `vendor${i}@rentkar.in`,
        password: await hash(`Vendor@${i}23`),
        firstName: vendorName.firstName,
        lastName: vendorName.lastName,
        roles: {
          create: { roleId: vendorRole.id },
        },
        vendor: {
          create: {
            companyName: vendorCompanyNames[i - 1],
            gstNo: generateGSTNumber(cityData.stateCode, i),
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
  const customerNames = [
    { firstName: "Priya", lastName: "Verma" },
    { firstName: "Rahul", lastName: "Kumar" },
    { firstName: "Anjali", lastName: "Reddy" },
    { firstName: "Deepak", lastName: "Nair" },
    { firstName: "Neha", lastName: "Joshi" },
  ];

  for (let i = 1; i <= 5; i++) {
    const customerName = customerNames[i - 1];
    const cityData = indianCities[i - 1];
    
    const user = await prisma.user.upsert({
      where: { email: `customer${i}@gmail.com` },
      update: {},
      create: {
        email: `customer${i}@gmail.com`,
        password: await hash(`Customer@${i}23`),
        firstName: customerName.firstName,
        lastName: customerName.lastName,
        roles: {
          create: { roleId: customerRole.id },
        },
        addresses: {
          create: {
            fullName: `${customerName.firstName} ${customerName.lastName}`,
            phoneNumber: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
            addressLine1: `${Math.floor(100 + Math.random() * 900)}, ${["MG Road", "Gandhi Nagar", "Nehru Street", "Patel Colony", "Shastri Nagar"][i - 1]}`,
            addressLine2: `Near ${["City Mall", "Railway Station", "Bus Stand", "Temple", "Market"][i - 1]}`,
            city: cityData.city,
            state: cityData.state,
            postalCode: cityData.pincode,
            country: "India",
            isDefault: true,
          },
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

  const conditionAttr = await prisma.attribute.upsert({
    where: { name: "Condition" },
    update: {},
    create: { name: "Condition" },
  });

  const red = await prisma.attributeValue.create({
    data: { id: "RED", attributeId: colorAttr.id, value: "Red" },
  });

  const blue = await prisma.attributeValue.create({
    data: { id: "BLUE", attributeId: colorAttr.id, value: "Blue" },
  });

  const black = await prisma.attributeValue.create({
    data: { id: "BLACK", attributeId: colorAttr.id, value: "Black" },
  });

  const white = await prisma.attributeValue.create({
    data: { id: "WHITE", attributeId: colorAttr.id, value: "White" },
  });

  const large = await prisma.attributeValue.create({
    data: { id: "L", attributeId: sizeAttr.id, value: "Large" },
  });

  const medium = await prisma.attributeValue.create({
    data: { id: "M", attributeId: sizeAttr.id, value: "Medium" },
  });

  const excellent = await prisma.attributeValue.create({
    data: { id: "EXCELLENT", attributeId: conditionAttr.id, value: "Excellent" },
  });

  const good = await prisma.attributeValue.create({
    data: { id: "GOOD", attributeId: conditionAttr.id, value: "Good" },
  });

  const colors = [red, blue, black, white];
  const sizes = [large, medium];
  const conditions = [excellent, good];

  /* ───────────────────────── PRODUCTS ───────────────────────── */

  const products = [];
  const productDescriptions = {
    "Sony DSLR Camera": "Professional Sony Alpha series DSLR camera with 24.2MP sensor, perfect for weddings and events",
    "DJI Drone Phantom": "DJI Phantom 4 Pro drone with 4K camera, ideal for aerial photography and videography",
    "Epson Projector": "Epson PowerLite 3200 lumens projector for corporate presentations and movie screenings",
    "JBL Bluetooth Speaker": "JBL PartyBox 310 portable Bluetooth speaker with powerful bass",
    "Samsung Smart TV 55\"": "Samsung 55-inch 4K Smart LED TV for events and exhibitions",
    "Concrete Mixer Machine": "Heavy-duty concrete mixer with 10 cubic feet capacity for construction sites",
    "Bosch Jack Hammer": "Bosch professional demolition hammer for breaking concrete and masonry",
    "Hilti Drill Machine": "Hilti TE 70-ATC rotary hammer drill for professional construction work",
    "Scaffolding Set": "Complete scaffolding set with platforms, ideal for building maintenance",
    "Compactor Machine": "Plate compactor for soil and asphalt compaction",
    "Manfrotto Tripod": "Manfrotto professional video tripod with fluid head for stable shots",
    "Godox Lighting Kit": "Godox SL-60W LED video lighting kit with softboxes",
    "Green Screen Setup": "Professional green screen backdrop with stand for video production",
    "Camera Gimbal Stabilizer": "DJI Ronin-S gimbal stabilizer for smooth video footage",
    "Reflector Kit": "5-in-1 photography reflector kit for studio and outdoor shoots",
    "JBL Sound System 5000W": "JBL Professional 5000W sound system with speakers and amplifiers for events",
    "LED Video Wall P3": "P3 indoor LED video wall panels for exhibitions and stage shows",
    "Shamiyana Tent 20x40": "Traditional Shamiyana tent 20x40 feet for weddings and functions",
    "Generator 5KVA": "Kirloskar 5KVA silent diesel generator for power backup",
    "Stage Platform Set": "Modular aluminum stage platform set for events and concerts",
    "LG Washing Machine": "LG 8kg fully automatic front load washing machine",
    "Voltas Air Conditioner 1.5T": "Voltas 1.5 Ton split AC for temporary cooling needs",
    "Aquaguard Water Purifier": "Aquaguard RO+UV water purifier for events and offices",
    "Havells Inverter": "Havells 1500VA pure sine wave inverter with battery",
    "Symphony Air Cooler": "Symphony Diet 50i tower air cooler for large spaces",
  };

  for (const vendor of vendors) {
    const names = productsByCategory[vendor.product_category] || ["Generic Item"];

    for (const name of names) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const dayPrice = Math.floor(Math.random() * 3000) + 500; // ₹500 - ₹3500 per day
      const weekPrice = dayPrice * 5; // ~30% discount for weekly
      
      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name,
          description: productDescriptions[name] || `${name} available for rent - well maintained and ready for use`,
          isPublished: true,
          inventory: {
            create: {
              totalQty: Math.floor(Math.random() * 15) + 3,
            },
          },
          pricing: {
            createMany: {
              data: [
                { type: "DAY", price: dayPrice },
                { type: "WEEK", price: weekPrice },
              ],
            },
          },
          attributes: {
            createMany: {
              data: [
                {
                  attributeId: colorAttr.id,
                  attributeValueId: randomColor.id,
                },
                {
                  attributeId: sizeAttr.id,
                  attributeValueId: randomSize.id,
                },
                {
                  attributeId: conditionAttr.id,
                  attributeValueId: randomCondition.id,
                },
              ],
            },
          },
        },
      });

      products.push(product);
    }
  }

  console.log(`📦 Created ${products.length} products`);

  /* ───────────────────────── CARTS + ORDERS ───────────────────────── */

  const orderStatuses = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED"];

  for (const customer of customers) {
    const product = products[Math.floor(Math.random() * products.length)];
    const start = new Date();
    const end = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days rental
    const unitPrice = Math.floor(Math.random() * 2000) + 800; // ₹800 - ₹2800

    const cart = await prisma.cart.create({
      data: {
        userId: customer.id,
        items: {
          create: {
            productId: product.id,
            quantity: Math.floor(Math.random() * 2) + 1,
            rentalStart: start,
            rentalEnd: end,
            unitPrice: unitPrice,
          },
        },
      },
      include: { items: true },
    });

    const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const gstAmount = Math.round(totalAmount * 0.18); // 18% GST
    const finalAmount = totalAmount + gstAmount;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        vendorId: product.vendorId,
        status: orderStatus,
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

    const paymentModes = ["UPI", "CARD", "NETBANKING", "COD"];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        totalAmount: totalAmount,
        gstAmount: gstAmount,
        status: orderStatus === "PENDING" ? "PENDING" : "PAID",
        payments: {
          create: {
            amount: finalAmount,
            mode: paymentMode,
            status: orderStatus === "PENDING" ? "PENDING" : "SUCCESS",
            paidAt: orderStatus === "PENDING" ? null : new Date(),
          },
        },
      },
    });
  }

  console.log(`🛒 Created ${customers.length} orders with invoices`);

  console.log("🎉 Database seeded successfully");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
