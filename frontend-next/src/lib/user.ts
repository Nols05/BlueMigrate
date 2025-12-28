import { verifySession, checkSession } from "./session";
import { prisma } from "./prisma";
import { cache } from "react"


export const getUser = cache(async (loginRedirect = true) => {
    const session = loginRedirect ? await verifySession() : await checkSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } });

    return user;
});