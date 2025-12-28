import { getUserMigrations } from "@/actions/migration";
import StatusIcon from "@/components/StatusIcon";
import { getUser } from "@/lib/user";
import Link from "next/link";
import { redirect } from "next/navigation";

// Define the Migration type for clarity and reuse
type Migration = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    type: string;
    status: string;
    error_msg: string | null;
};

export default async function MyMigrations() {
    const user = await getUser();
    if (!user) redirect("/login");

    const migrations: Migration[] = await getUserMigrations(user?.id);

    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-5xl text-center font-bold text-white mb-4">My migrations</h2>
                    <p className="text-gray-300 text-xl text-center leading-6">
                        Issues? Try again or contact us at support@bluemigrate.com
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="group relative flex flex-col gap-4 mx-auto w-full bg-white rounded-2xl shadow-2xl transition-all duration-300 p-8 xl:p-12 text-justify">
                        {migrations.length === 0 ? (
                            <p className="text-gray-500 text-center">You have no migrations yet</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {migrations.map((migration: Migration) => (
                                    <Link
                                        key={migration.id}
                                        href={`/status/${migration.id}`}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col flex-wrap  gap-4">
                                            <p className="text-md font-semibold">Migration: {migration.id}</p>
                                            <StatusIcon
                                                status={migration.status}
                                                textClassName="text-lg font-medium"
                                                iconClassName="w-5 h-5"
                                            />
                                        </div>
                                        {migration.status === "FAILED" && <p className="text-gray-500 text-sm">The site is getting a massive amount of traffic and migrations are failing due to API rate limits, please try this migration again in 24 hours. You will not be charged again. If the issue persists, contact us at support@bluemigrate.com</p>}

                                        <hr className="w-full border-gray-200 my-8" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
