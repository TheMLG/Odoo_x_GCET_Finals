import prisma from "../Backend/config/prisma.js";

const TARGET_USER_ID = "2e1f4f98-c099-40d0-a57f-b28ce40d8ad8";

async function diagnose() {
    console.log("--- DIAGNOSTIC START ---");
    try {
        // 1. Check User
        const user = await prisma.user.findUnique({ where: { id: TARGET_USER_ID } });
        if (!user) {
            console.log("❌ User NOT FOUND in DB!");
        } else {
            console.log(`✅ User Found: ${user.email} (${user.firstName})`);
        }

        // 2. Check Active Cart
        const cart = await prisma.cart.findFirst({
            where: { userId: TARGET_USER_ID, status: "ACTIVE" },
            include: { items: true }
        });

        if (cart) {
            console.log(`⚠️  User still has an ACTIVE CART with ${cart.items.length} items.`);
            console.log("    This suggests the order was NOT placed successfully (cart wasn't cleared).");
        } else {
            console.log("✅ No Active Cart found (Cart might have been converted/deleted).");
        }

        // 3. Check Orders for this User
        const userOrders = await prisma.order.findMany({
            where: { userId: TARGET_USER_ID }
        });
        console.log(`ℹ️  Orders found for this user: ${userOrders.length}`);
        userOrders.forEach(o => console.log(`   - Order ${o.orderNumber} [${o.status}]`));

        // 4. Check Global Orders (in case logic linked to wrong user)
        const totalOrders = await prisma.order.count();
        console.log(`\n📊 Total Orders in System: ${totalOrders}`);
        if (totalOrders > 0) {
            const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' }, include: { user: true } });
            console.log(`   Last Order created at: ${lastOrder.createdAt}`);
            console.log(`   Belongs to: ${lastOrder.user.email} (${lastOrder.userId})`);
        }

    } catch (error) {
        console.error("Diagnostic Error:", error);
    } finally {
        await prisma.$disconnect();
        console.log("--- DIAGNOSTIC END ---");
    }
}

diagnose();
