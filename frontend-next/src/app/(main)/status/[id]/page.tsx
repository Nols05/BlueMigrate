


import { getMigrationStatus } from "@/actions/migration";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import LiveStatusIcon from "@/components/LiveStatusIcon";
import Image from "next/image";
import Link from "next/link";

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const status = await getMigrationStatus(id) || "PENDING";



    return (
        <section className="relative py-14 lg:pt-64 lg:pb-24 bg-gray-100">
            <div className="grid place-content-center w-full max-w-7xl mx-auto px-4 lg:px-8">
                <p className="text-xs text-gray-400 ml-1">id: {id}</p>
                <p className="text-3xl text-gray-600 text-center">The status of your migration is:</p>

                <div className="flex items-center justify-center gap-2 mt-8 mb-10">
                    <LiveStatusIcon id={id} status={status} textClassName="text-4xl" />
                </div>

                <Link href="/my-migrations"
                    className="bg-primary text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 py-3 px-6 text-sm hover:bg-blue-700">
                    Go back
                </Link>
            </div>

            <p className="text-center text-gray-500 mt-10">Due to the high amount of traffic, this process may take some time.</p><br />
            <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-center text-gray-500 text-balance mb-2">This is how your backdated tweets will look like. Click on any of them to see the archive badge.</p>
                <Image src="/backdated.png" alt="Backdate" width={500} height={500} />
            </div>

            <p className="text-center text-gray-400 text-xs mt-12">Issues? Please try doing the migration again or:<br />
                Contact us at <a href="mailto:support@bluemigrate.com" className="text-primary">support@bluemigrate.com</a></p>

            {/* <div className="flex justify-center mt-12">
                <BuyMeACoffee />
            </div> */}

        </section >


    )
}