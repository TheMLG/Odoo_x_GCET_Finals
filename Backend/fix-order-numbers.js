import prisma from "./config/prisma.js";

async function fixOrderNumbers() {
  try {
    // Update orders without orderNumber
    const orders = await prisma.order.findMany({
      where: { orderNumber: null },
    });

    console.log(`Found ${orders.length} orders without orderNumber`);

    for (const order of orders) {
      const orderNumber = `ORD-${order.id.substring(0, 8).toUpperCase()}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { orderNumber },
      });
      console.log(`Updated order ${order.id} with orderNumber ${orderNumber}`);
    }

    // Update invoices without invoiceNumber
    const invoices = await prisma.invoice.findMany({
      where: { invoiceNumber: null },
    });

    console.log(`Found ${invoices.length} invoices without invoiceNumber`);

    for (const invoice of invoices) {
      const invoiceNumber = `INV-${invoice.id.substring(0, 8).toUpperCase()}`;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { invoiceNumber },
      });
      console.log(
        `Updated invoice ${invoice.id} with invoiceNumber ${invoiceNumber}`,
      );
    }

    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrderNumbers();
