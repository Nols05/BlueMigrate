import Information from "@/components/Information";
import { buyPostsMigration, buyThreadsMigration } from "@/lib/stripe";
import { getUser } from "@/lib/user";
import { Activity, NotebookPen, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";



export default async function MigratePage() {
    const user = await getUser();

    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-4xl lg:text-5xl text-center font-bold text-white mb-4">What do you want to migrate?</h2>
                    <p className="text-gray-300  lg:text-xl text-center leading-6">We do not store any of your information.</p>

                </div>

                <div className="space-y-8 lg:grid lg:grid-cols-2 lg:space-y-5 lg:items-center">
                    <div className="group relative flex flex-col mx-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl transition-all duration-300 p-8 xl:p-12 mt-3 ">

                        <div className="border-b border-solid border-gray-200  pb-9 mb-9">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 mx-auto flex justify-center items-center transition-all duration-300 group-hover:bg-primary">
                                <Users className="w-6 h-6 text-primary transition-all duration-300 group-hover:text-white" />
                            </div>
                            <h3 className=" text-2xl font-bold my-7 text-center text-primary">100 posts</h3>
                            <div className="flex items-center justify-center my-4">
                                <span className=" text-4xl font-medium text-gray-900">Free</span>
                            </div>
                            <p className="text-sm text-center text-balance  text-gray-500">Your last 100 tweets, now on Bluesky.</p>
                            <p className="text-sm text-center text-balance  text-gray-500">No long threads.</p>

                        </div>

                        <Link href="/migrate/posts" className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit mx-auto group-hover:bg-primary group-hover:text-white ">Migrate posts</Link>
                    </div>

                    <div className="group relative flex flex-col mx-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl transition-all duration-300  p-8 xl:p-12  ">
                        <div className="border-b border-solid border-gray-200 pb-9 mb-9">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 mx-auto flex justify-center items-center transition-all duration-300 group-hover:bg-primary">
                                <NotebookPen className="w-6 h-6 text-primary transition-all duration-300 group-hover:text-white" />
                            </div>
                            <h3 className=" text-2xl font-bold my-7 text-center text-primary">1000 posts and threads</h3>
                            <div className="flex items-center justify-center my-4">
                                <span className=" text-4xl font-medium text-gray-900">$4</span>
                            </div>
                            <p className="text-sm text-center text-balance  text-gray-500">Your last 1000 tweets, now on Bluesky.</p>
                            <p className="text-sm text-center text-balance  text-gray-500">Long threads supported.</p>

                        </div>

                        {
                            user?.isPremium ?
                                <Link href="/migrate/posts" className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit mx-auto group-hover:bg-primary group-hover:text-white ">Migrate posts</Link>
                                :
                                <form action={buyPostsMigration} className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit mx-auto group-hover:bg-primary group-hover:text-white ">
                                    <button type="submit">
                                        Migrate posts
                                    </button>
                                </form>
                        }


                    </div>


                    <div />
                </div>

                <div className="mt-12 space-y-3 px-10">
                    <Information />
                </div>
            </div>

        </section>


    )



}