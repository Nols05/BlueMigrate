import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature || !webhookSecret) {
        console.error("Missing signature or webhook secret");
        return NextResponse.json({ error: "Missing required headers or secrets" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const data = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        try {
            const session = await stripe.checkout.sessions.retrieve(data.id, {
                expand: ["line_items", "subscription"],
            });

            const userId = session?.metadata?.userId;
            const bskyHandle = session?.metadata?.bskyHandle || "";

            if (!userId) {
                console.error("User ID is missing in session metadata");
                return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                console.error(`User with ID ${userId} not found`);
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            if (session?.subscription) {
                // Handle featured account subscription
                await prisma.featuredAccount.create({
                    data: {
                        userId,
                        subscriptionId: (session.subscription as Stripe.Subscription).id,
                        handle: bskyHandle,
                    },
                });
                console.log('User subscribed to featured account:', userId);
            } else {
                // Handle one-time product
                await prisma.user.update({
                    where: { id: userId },
                    data: { isPremium: true }
                });
                console.log('User upgraded to premium with one-time payment:', userId);
            }

            revalidatePath("/")

            return NextResponse.json({ success: true, message: `User ${userId} upgraded to premium` });

        } catch (err: any) {
            console.error('Error processing session:', err.message);
            return NextResponse.json({ error: 'Failed to process session' }, { status: 500 });
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription?.metadata.userId;
        const bskyHandle = subscription?.metadata.bskyHandle || "";

        if (!userId) {
            console.error("User ID is missing in subscription metadata");
            return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
        }

        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                console.error(`User with ID ${userId} not found`);
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Get the subscription expiration timestamp
            const expirationDate = new Date(subscription.current_period_end * 1000); // Convert to JavaScript date

            // Update featured account to include expiration info instead of immediate deletion
            await prisma.featuredAccount.updateMany({
                where: { userId: userId, handle: bskyHandle },
                data: { expiresAt: expirationDate }, // Add an `expiresAt` column in your schema
            });

            console.log(`Subscription cancellation processed. Featured account will remain until ${expirationDate}`);
            revalidatePath("/");

            return NextResponse.json({
                success: true,
                message: `Subscription cancellation processed for user ${userId}. Featured account retained until ${expirationDate}`,
            });

        } catch (err: any) {
            console.error("Error processing subscription cancellation:", err.message);
            return NextResponse.json({ error: "Failed to process subscription cancellation" }, { status: 500 });
        }
    }


    return NextResponse.json({ success: false, message: "Webhook event type not handled" });

}
