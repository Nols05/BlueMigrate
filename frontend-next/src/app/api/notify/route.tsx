import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const data = {
        "migrationId": body["migrationId"],
        "twitterName": body["twitterName"],
        "bskyHandle": body["bskyHandle"],
        "did": body["did"],
        "task_type": body["task_type"],
        "success": body["success"],
        "error_message": body["error_message"]
    };
    console.log("Notification received: ", data);

    const status = data.success ? "SUCCESS" : "FAILED";

    const migration = await prisma.migration.update({
        where: { id: data.migrationId },
        data: {
            status,
            error_msg: data.error_message
        }
    });


    const user = await prisma.user.findUnique({ where: { id: migration.userId || undefined } });
    const wasPremium = user?.isPremium;


    // Remove premium if user has already consumed the task
    if (migration && data.success && migration.userId) {
        await prisma.user.update({
            where: { id: migration.userId },
            data: {
                isPremium: false,
            },
        });
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or another SMTP service
        auth: {
            user: process.env.EMAIL_USER, // Use environment variables for security
            pass: process.env.EMAIL_PASS,
        },
    });


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER, // Usar variable de entorno
        subject: wasPremium ? `PREMIUM ${status}` : `Migration Notification: ${status}`,
        text: `

A migration process has completed with the following details:

- Migration ID: ${data.migrationId}
- Status: ${status}
- Twitter Name: ${data.twitterName}
- Bluesky Handle: ${data.bskyHandle}
- Error Message: ${data.error_message || 'None'}
`,
    };

    try {

        await transporter.sendMail(mailOptions);
        console.log("Notification email sent successfully.");
    } catch (error) {
        console.error("Failed to send notification email:", error);
    }


    return NextResponse.json({ success: true });
}



async function checkIfPremiumMigration(migrationId: string) {
    const migration = await prisma.migration.findUnique({
        where: { id: migrationId },
        select: { userId: true },
    });

    if (migration && migration.userId) {
        const user = await prisma.user.findUnique({
            where: { id: migration.userId },
            select: { isPremium: true },
        });

        return user?.isPremium;
    }

    return false;
}
