import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Calculate date from 2 days ago
    const eighthoursago = new Date();
    eighthoursago.setHours(eighthoursago.getHours() - 8);

    const migrations = await prisma.migration.findMany({
        where: {
            status: 'PENDING',


        },
        include: {
            User: {
                select: {
                    email: true
                }
            }
        }
    })

    migrations.forEach(m => {
        console.log(`${m.bskyHandle}`)
        console.log(`${m.User.email}`)
        console.log(`${m.createdAt}`)
    });
};

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })