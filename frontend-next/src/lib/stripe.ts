'use server';

import Stripe from "stripe";
import { getUser } from "./user";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { FeaturedSchema } from "./definitions";
import { prisma } from "./prisma";
import { checkHandle } from "@/actions/bluesky";
import { revalidatePath } from "next/cache";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function getPriceById(priceId: string) {
    return await stripe.prices.retrieve(priceId);
}

export async function buyPostsMigration(formData: FormData) {
    console.log('Buying posts migration');

    const user = await getUser();
    if (!user) {
        throw new Error("User not found");
    }

    const postsPrice = await getPriceById(process.env.STRIPE_POSTS_PRICE_ID as string);

    if (!postsPrice.unit_amount) {
        throw new Error("Posts price or its unit amount is undefined");
    }

    const session = await stripe.checkout.sessions.create({

        customer_email: user.email,
        line_items: [
            {
                price: postsPrice.id, // Directly use the price ID
                quantity: 1,
            },
        ],
        metadata: {
            userId: user.id,
        },
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_URL}/migrate/posts`,
    });

    redirect(session.url as string);

}

export async function buyThreadsMigration(formData: FormData) {
    console.log('Buying threads migration');

    const user = await getUser();
    if (!user) {
        throw new Error("User not found");
    }

    const postsPrice = await getPriceById(process.env.STRIPE_POSTS_PRICE_ID as string);

    if (!postsPrice.unit_amount) {
        throw new Error("Posts price or its unit amount is undefined");
    }

    const session = await stripe.checkout.sessions.create({

        customer_email: user.email,
        line_items: [
            {
                price: postsPrice.id, // Directly use the price ID
                quantity: 1,
            },
        ],
        metadata: {
            userId: user.id,
        },
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_URL}/migrate/threads`,
    });

    redirect(session.url as string);

}


type FeaturedState = {
    errors?: {
        bskyHandle?: string[];
    };
} | undefined;


export async function buyFeaturedAccount(state: FeaturedState, formData: FormData) {
    const user = await getUser();
    if (!user) {
        redirect('/login');
    }

    console.log('Buying featured account');

    const data = {
        bskyHandle: formData.get('bskyHandle') as string,
    }

    const validationResult = FeaturedSchema.safeParse(data);
    if (!validationResult.success) {
        return { errors: validationResult.error.flatten().fieldErrors }
    }

    const exists = await checkHandle(data.bskyHandle);
    if (!exists) {
        return { errors: { bskyHandle: ["Handle not found"] } }
    }

    const featuredPrice = await getPriceById(process.env.STRIPE_FEATURED_PRICE_ID as string);

    if (!featuredPrice.unit_amount) {
        throw new Error("Featured price or its unit amount is undefined");
    }

    // Create Stripe Checkout session for a subscription
    const session = await stripe.checkout.sessions.create({
        customer_email: user.email, // Tie subscription to user email
        line_items: [
            {
                price: featuredPrice.id, // Price ID for the subscription
                quantity: 1,
            },
        ],
        mode: "subscription", // Subscription mode
        metadata: {
            userId: user.id,
            bskyHandle: formData.get('bskyHandle') as string,
        },
        success_url: `${process.env.NEXT_PUBLIC_URL}/featured-accounts`,
    });



    redirect(session.url as string);
}


export async function cancelFeaturedAccount(subscriptionId: string) {

    const user = await getUser();
    if (!user) {
        return redirect('/login'); // Redirect to login if user is not authenticated
    }

    try {
        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(subscriptionId);

        // Retrieve subscription expiration date from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const expirationDate = new Date(subscription.current_period_end * 1000); // Convert timestamp to Date

        // Update the `expiresAt` field for the featured account
        await prisma.featuredAccount.updateMany({
            where: {
                userId: user.id,
                subscriptionId: subscriptionId,
            },
            data: {
                expiresAt: expirationDate,
            },
        });

        console.log(
            `Subscription ${subscriptionId} canceled for user ${user.id}. Featured account will expire at ${expirationDate}`
        );
    } catch (err) {
        console.error('Failed to cancel subscription:', err);
    }

    // Revalidate the path and redirect
    revalidatePath('/');
    return redirect('/');
}
