"use server"

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";


export async function redirectUserPremium(userId: string | undefined) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true }
    });

    if (!user?.isPremium)
        redirect("/migrate");
}