import { getUserFeaturedAccounts } from "@/actions/bluesky"
import MyFeatured from "@/components/MyFeatured"
import { getUser } from "@/lib/user"
import Image from "next/image"




export default async function FeaturedAccounts() {
    const user = await getUser()
    if (!user) return

    const featuredAccounts = await getUserFeaturedAccounts(user.id)






    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className=" text-5xl text-center font-bold text-white mb-4">Featured accounts</h2>
                </div>




                <MyFeatured featuredAccounts={featuredAccounts} />

            </div>
        </section>
    )
}