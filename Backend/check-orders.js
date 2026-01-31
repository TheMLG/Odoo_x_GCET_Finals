import prisma from "../Backend/config/prisma.js";

async function checkOrders() {
    console.log("--- START DB CHECK ---");
    try {
        const total = await prisma.order.count();
        console.log(`Total Orders: ${total}`);

        if (total > 0) {
            const orders = await prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: true, items: true }
            });

            console.log("\nLatest Orders:");
            orders.forEach(o => {
                console.log(`[${o.status}] Order #${o.orderNumber}`);
                console.log(`  ID: ${o.id}`);
                console.log(`  User: ${o.user.email} (${o.userId})`);
                console.log(`  Items: ${o.items.length}`);
                console.log(`  Created: ${o.createdAt}`);
                console.log("-------------------");
            });
        } else {
            console.log("No orders found.");
        }
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await prisma.$disconnect();
        console.log("--- END DB CHECK ---");
    }
}

checkOrders();
