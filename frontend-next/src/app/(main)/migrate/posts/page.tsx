import { NotebookPen } from "lucide-react";
import { getUser } from "@/lib/user";
import { redirectUserPremium } from "@/actions/user";
import { migratePosts } from "@/actions/migration";
import MigrationForm from "@/components/MigrationForm";





export default async function MigratePostsPage() {
    const user = await getUser();
    // await redirectUserPremium(user?.id);

    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="font-manrope text-5xl text-center font-bold text-white mb-4">Migrate posts</h2>
                    <p className="text-gray-300 text-xl text-center leading-6">We do not store any of your information.</p>

                </div>

                <div className="group relative flex flex-col mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-2xl transition-all duration-300 p-8 xl:p-12  ">

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex justify-center items-center transition-all duration-300 ">
                            <NotebookPen className="w-6 h-6 text-primary transition-all duration-300 " />
                        </div>
                        <h3 className="text-2xl font-bold my-7 text-center text-primary">Migrate Posts </h3>
                    </div>



                    <MigrationForm action={migratePosts} isPremium={user?.isPremium || false} />


                </div>


            </div>
        </section>


    )



}