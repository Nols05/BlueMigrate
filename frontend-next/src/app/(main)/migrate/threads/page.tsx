import FeaturedForm from "@/components/FeaturedForm";
import ThreadForm from "@/components/ThreadForm";
import { getUser } from "@/lib/user";






export default async function ThreadPage() {
    const user = await getUser();

    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="font-manrope text-5xl text-center font-bold text-white mb-4">Migrate threads</h2>
                    <p className="text-gray-300 text-xl text-center leading-6">Enter the links of the root of your threads</p>

                </div>

                <div className="group relative flex flex-col mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-2xl transition-all duration-300 p-8 xl:p-12  ">

                    <ThreadForm />


                </div>


            </div>
        </section>


    )



}