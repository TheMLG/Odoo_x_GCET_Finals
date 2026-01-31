import cron from "node-cron";
import prisma from "../config/prisma.js";
import { sendEmail } from "../utils/emailService.js";

/**
 * Finds all order items with rental end date exactly 1 day from now
 * and sends reminder emails to the customers
 */
const sendRentalReturnReminders = async () => {
  try {
    console.log("[CRON] Running rental return reminder job...");

    // Calculate the date range for "1 day from now"
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set to start of tomorrow
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Set to end of tomorrow
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find all order items with rental ending tomorrow
    const orderItemsDueTomorrow = await prisma.orderItem.findMany({
      where: {
        rentalEnd: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
        order: {
          status: {
            in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            deliveryAddress: true,
          },
        },
        product: {
          select: {
            name: true,
            product_image_url: true,
          },
        },
      },
    });

    if (orderItemsDueTomorrow.length === 0) {
      console.log("[CRON] No rental items due for return tomorrow.");
      return;
    }

    console.log(
      `[CRON] Found ${orderItemsDueTomorrow.length} rental items due for return tomorrow.`,
    );

    // Group order items by user email to send one email per user
    const itemsByUser = {};
    for (const item of orderItemsDueTomorrow) {
      const userEmail = item.order.user.email;
      if (!itemsByUser[userEmail]) {
        itemsByUser[userEmail] = {
          user: item.order.user,
          items: [],
        };
      }
      itemsByUser[userEmail].items.push({
        productName: item.product.name,
        quantity: item.quantity,
        rentalEnd: item.rentalEnd,
        orderNumber: item.order.orderNumber,
        productImage: item.product.product_image_url,
      });
    }

    // Send emails to each user
    for (const [email, data] of Object.entries(itemsByUser)) {
      const { user, items } = data;
      const userName = `${user.firstName} ${user.lastName}`;

      const subject = `🔔 Rental Return Reminder - Items Due Tomorrow`;

      const itemsListHtml = items
        .map(
          (item) => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <img src="${item.productImage}" alt="${item.productName}"
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <strong>${item.productName}</strong><br>
                        <span style="color: #666;">Quantity: ${item.quantity}</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <strong style="color: #e74c3c;">${new Date(
                          item.rentalEnd,
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</strong>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        #${item.orderNumber}
                    </td>
                </tr>
            `,
        )
        .join("");

      const itemsListText = items
        .map(
          (item) =>
            `- ${item.productName} (Qty: ${item.quantity}) - Order #${item.orderNumber} - Due: ${new Date(item.rentalEnd).toLocaleDateString()}`,
        )
        .join("\n");

      const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Rental Return Reminder</h1>
                    </div>

                    <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
                        <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>

                        <p style="font-size: 16px;">This is a friendly reminder that the following rental items are due for return <strong style="color: #e74c3c;">tomorrow</strong>:</p>

                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Image</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Return Date</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Order #</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsListHtml}
                            </tbody>
                        </table>

                        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404;">
                                <strong>⚠️ Important:</strong> Please ensure you return the items on time to avoid any late fees.
                                If you need to extend your rental, please contact us before the due date.
                            </p>
                        </div>

                        <p style="font-size: 14px; color: #666;">
                            Thank you for choosing our rental service!
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                        <p style="font-size: 12px; color: #999; text-align: center;">
                            This is an automated reminder. If you have any questions, please contact our support team.
                        </p>
                    </div>
                </body>
                </html>
            `;

      const text = `
Rental Return Reminder

Hello ${userName},

This is a friendly reminder that the following rental items are due for return tomorrow:

${itemsListText}

⚠️ Important: Please ensure you return the items on time to avoid any late fees.
If you need to extend your rental, please contact us before the due date.

Thank you for choosing our rental service!
            `.trim();

      try {
        await sendEmail(email, subject, text, html);
        console.log(`[CRON] Reminder email sent to ${email}`);
      } catch (emailError) {
        console.error(
          `[CRON] Failed to send reminder email to ${email}:`,
          emailError.message,
        );
      }
    }

    console.log(
      `[CRON] Rental return reminder job completed. Sent ${Object.keys(itemsByUser).length} emails.`,
    );
  } catch (error) {
    console.error("[CRON] Error in rental return reminder job:", error);
  }
};

/**
 * Initializes the rental return reminder cron job
 * Runs every day at 9:00 AM
 */
export const initRentalReminderCron = () => {
  // Schedule: Run every day at 9:00 AM
  // Cron format: second(optional) minute hour day-of-month month day-of-week
  const schedule = "0 9 * * *"; // 9:00 AM every day

  cron.schedule(schedule, sendRentalReturnReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata", // Adjust timezone as needed
  });

  console.log(
    "[CRON] Rental return reminder cron job initialized. Runs daily at 9:00 AM IST.",
  );
};

/**
 * Manually trigger the rental return reminder (for testing purposes)
 */
export const triggerRentalReminder = async () => {
  console.log("[CRON] Manually triggering rental return reminder...");
  await sendRentalReturnReminders();
};

export default {
  initRentalReminderCron,
  triggerRentalReminder,
};
