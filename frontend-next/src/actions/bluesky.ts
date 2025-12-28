"use server";

import { AtpAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api';
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

const sessionFilePath = path.resolve('./bluemigrate-session.json');

// Utility to load the session from a file
function loadSession(): AtpSessionData | undefined {
    if (fs.existsSync(sessionFilePath)) {
        return JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    }
    return undefined;
}

// Utility to save the session to a file
function saveSession(event: AtpSessionEvent, session?: AtpSessionData) {
    if (event === 'create' && session) {
        fs.writeFileSync(sessionFilePath, JSON.stringify(session));
    }
}

const agent = new AtpAgent({
    service: 'https://bsky.social',
    persistSession: saveSession,
});

// Ensure a valid session
async function ensureSession() {
    if (!agent.hasSession) {
        console.log('No valid session, attempting to log in.');
        await agent.login({
            identifier: process.env.BLUESKY_HANDLE || '',
            password: process.env.BLUESKY_PASSWORD as string,
        });
    }
}

// Resume session if available and handle expired tokens
const savedSessionData = loadSession();
if (savedSessionData) {
    try {
        await agent.resumeSession(savedSessionData);
    } catch (error) {
        console.log('Session expired, clearing session file.');
        fs.unlinkSync(sessionFilePath);
    }
}

export async function getFeaturedAccounts() {
    await ensureSession();

    const accounts = [];
    const featured = await prisma.featuredAccount.findMany({
        where: {
            OR: [
                {
                    expiresAt: {
                        gte: new Date(), // Accounts with a valid future expiration date
                    },
                },
                {
                    expiresAt: null, // Accounts with no expiration date
                },
            ],
        },
    });


    try {
        const blueskyProfile = await agent.getProfile({ actor: 'bluemigrate.com' });
        accounts.push({
            image: blueskyProfile.data.avatar || "",
            name: blueskyProfile.data.displayName || "",
            description: blueskyProfile.data.description || "",
            handle: blueskyProfile.data.handle || "",
            link: `https://bsky.app/profile/${blueskyProfile.data.handle}`,
        });


        //fix for the guy error

    } catch (error) {
        console.error('Error fetching profile for bluemigrate:', error);
    }

    for (const account of featured) {
        try {
            const profile = await agent.getProfile({ actor: account.handle });
            accounts.push({
                image: profile.data.avatar || "",
                name: profile.data.displayName || "",
                description: profile.data.description || "",
                handle: profile.data.handle || "",
                link: `https://bsky.app/profile/${profile.data.handle}`,
            });
        } catch (error) {
            console.error(`Error fetching profile for ${account.handle}:`, error);
        }
    }

    return accounts;
}

export async function checkHandle(handle: string) {
    await ensureSession();

    try {
        const profile = await agent.getProfile({ actor: handle });
        return profile.data.handle === handle;
    } catch (error) {
        return false;
    }
}

export async function getUserFeaturedAccounts(userId: string) {
    await ensureSession();

    const accounts = [];
    const featured = await prisma.featuredAccount.findMany({
        where: {
            OR: [
                {
                    expiresAt: {
                        gte: new Date(), // Accounts with a valid future expiration date
                    },
                },
                {
                    expiresAt: null, // Accounts with no expiration date
                },
            ],
        },
    });


    for (const account of featured) {
        try {
            const profile = await agent.getProfile({ actor: account.handle });
            accounts.push({
                image: profile.data.avatar || "",
                name: profile.data.displayName || "",
                handle: profile.data.handle || "",
                subscriptionId: account.subscriptionId || "",
            });
        } catch (error) {
            console.error(`Error fetching profile for ${account.handle}:`, error);
        }
    }
    return accounts;
}

export async function checkPassword(identifier: string, password: string) {
    const newAgent = new AtpAgent({ service: 'https://bsky.social' });

    try {
        await newAgent.login({
            identifier,
            password,
        });
        return true;
    } catch (error) {
        return false;
    }
}