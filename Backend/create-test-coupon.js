const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCoupon() {
    try {
        // Get the first customer user
        const user = await prisma.user.findFirst({
            where: {
                roles: {
                    some: {
                        role: {
                            name: 'CUSTOMER'
                        }
                    }
                }
            }
        });

        if (!user) {
            console.log('❌ No customer user found');
            return;
        }

        console.log(`✅ Found user: ${user.email}`);

        // Check if user already has a welcome coupon
        const existingCoupon = await prisma.coupon.findFirst({
            where: {
                userId: user.id,
                isWelcomeCoupon: true
            }
        });

        if (existingCoupon) {
            console.log(`\n✅ User already has a welcome coupon!`);
            console.log(`   Code: ${existingCoupon.code}`);
            console.log(`   Discount: ${existingCoupon.discountValue}%`);
            return;
        }

        // Create welcome coupon
        const couponCode = `WELCOME-${user.id.substring(0, 6).toUpperCase()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const coupon = await prisma.coupon.create({
            data: {
                code: couponCode,
                description: "Welcome to RentX! Enjoy 10% off on your first order.",
                discountType: "PERCENTAGE",
                discountValue: 10,
                minOrderAmount: null,
                maxUsageCount: 1,
                currentUsageCount: 0,
                expiryDate: expiryDate,
                isActive: true,
                userId: user.id,
                isWelcomeCoupon: true,
            },
        });

        console.log('\n🎉 Welcome coupon created successfully!');
        console.log(`   Code: ${coupon.code}`);
        console.log(`   User: ${user.email}`);
        console.log(`   Discount: 10%`);
        console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
        console.log(`\n👉 Now refresh your cart page and click "View Coupons"!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestCoupon();
