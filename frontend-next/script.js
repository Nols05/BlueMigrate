import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Calculate date from 6 hours ago
    const sixhoursago = new Date();
    sixhoursago.setHours(sixhoursago.getHours() - 6);

    // Update all migrations that are PENDING and older than 6 hours to FAILED
    const migrations = await prisma.migration.updateMany({
        where: {
            status: "PENDING",
            User: {
                isPremium: true
            }
        },
        data: {
            status: "FAILED",
        }
    })

    console.log(migrations)


};



main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })