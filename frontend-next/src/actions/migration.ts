"use server";

import { MigrationSchema, ThreadSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import nodemailer from 'nodemailer';
import { checkHandle, checkPassword } from "./bluesky";

type FormState =
    | {
        errors?: {
            twitterName?: string[];
            bskyHandle?: string[];
            password?: string[];
        };
        message?: string;
        success?: boolean;
    }
    | undefined;



export async function migratePosts(state: FormState, formData: FormData): Promise<FormState> {
    const user = await getUser();
    if (!user) { redirect('/login') }

    const data = {
        migrationId: "",
        twitterName: formData.get('twitterName') as string,
        bskyHandle: formData.get('bskyHandle') as string,
        password: formData.get('password') as string,
        threadUrls: (formData.getAll('thread') as string[]).filter(Boolean),
        limit: user.isPremium ? 1200 : 150
    }


    //remove @ from bskyHandle
    data.bskyHandle = data.bskyHandle.replace('@', '');

    // Validate data
    const validationResult = MigrationSchema.safeParse(data);
    if (!validationResult.success) {
        return { errors: validationResult.error.flatten().fieldErrors }
    }

    const exists = await checkHandle(data.bskyHandle);
    if (!exists) {
        return { errors: { bskyHandle: ["Handle not found"] } }
    }

    const correctPassword = await checkPassword(data.bskyHandle, data.password);
    if (!correctPassword) {
        return { errors: { password: ["Incorrect password"] } }
    }


    const migration = await prisma.migration.create({
        data: {
            User: { connect: { id: user.id } },
            type: "posts",
            bskyHandle: data.bskyHandle,
        },
    });

    // Remove @ from twitterName
    data.twitterName = data.twitterName.replace('@', '');

    //Add id and limit to data
    data.migrationId = migration.id;

    let response;

    try {
        response = await fetch(`${process.env.API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new Error(`Failed to fetch: ${error}`);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const json = await response.json();

    const status = json.success ? "PENDING" : "FAILED";

    await prisma.migration.update({
        where: { id: migration.id },
        data: {
            status,
            error_msg: json.error_message,
        },
    });

    revalidatePath("/")
    redirect(`/status/${migration.id}`);
}


export async function getMigrationStatus(migrationId: string) {
    const migration = await prisma.migration.findUnique({
        where: { id: migrationId }
    });

    return migration?.status;
}

export async function getUserMigrations(userId: string) {

    const migrations = await prisma.migration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    return migrations;
}

export async function getMigrationNumber() {
    const number = await prisma.migration.count();
    return number;
}

export async function migrateThreads(state: FormState, formData: FormData) {
    const user = await getUser();
    if (!user) { redirect('/login') }

    console.log("migrating threads");

    const data = {
        migrationId: "",
        threadUrls: (formData.getAll('thread') as string[]).filter(Boolean),
        bskyHandle: formData.get('bskyHandle') as string,
        password: formData.get('password') as string,
    }

    //remove @ from bskyHandle
    data.bskyHandle = data.bskyHandle.replace('@', '');

    // Validate data
    const validationResult = ThreadSchema.safeParse(data);
    if (!validationResult.success) {
        return { errors: validationResult.error.flatten().fieldErrors }
    }

    const exists = await checkHandle(data.bskyHandle);
    if (!exists) {
        return { errors: { bskyHandle: ["Handle not found"] } }
    }

    const correctPassword = await checkPassword(data.bskyHandle, data.password);
    if (!correctPassword) {
        return { errors: { password: ["Incorrect password"] } }
    }

    const migration = await prisma.migration.create({
        data: {
            User: { connect: { id: user.id } },
            type: "threads",
        },
    });

    //Add id to data
    data.migrationId = migration.id;

    let response;

    try {
        response = await fetch(`${process.env.API_URL}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new Error(`Failed to fetch: ${error}`);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const json = await response.json();

    const status = json.success ? "PENDING" : "FAILED";

    await prisma.migration.update({
        where: { id: migration.id },
        data: {
            status,
            error_msg: json.error_message,
        },
    });

    revalidatePath("/")
    redirect(`/status/${migration.id}`);

}

