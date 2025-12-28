import { ArrowRight } from "lucide-react";
import Bluesky from "./icons/BlueskyIcon";
import X from "./icons/XIcon";
import Link from "next/link";
import { getMigrationNumber } from "@/actions/migration";
import FeaturedAccounts from "./FeaturedAccounts";
import SocialProof from "./SocialProof";


export default function Hero() {
    return (

        <section className="relative py-14 lg:pt-48 lg:pb-24 bg-gray-100">

            <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">

                <div className="w-full max-w-4xl mx-auto sm:px-12 mb-10 lg:mb-12 flex flex-col items-center">



                    <div className="flex items-center justify-center gap-4 mb-6  ">
                        <X className="size-16 lg:size-16 p-2 bg-black" />
                        <ArrowRight className="size-8" />
                        <Bluesky className="size-16 lg:size-16" />
                    </div>

                    <h1 className="font-bold text-5xl leading sm:text-6xl text-center mb-5 text-black text-balance">
                        Migrate your tweets to Bluesky <span className="text-primary">in a few clicks</span>
                    </h1>
                    <p className="text-xl font-medium leading-8 text-gray-400 text-center mb-10 max-w-xl mx-auto">
                        Import your tweets keeping their original date.
                    </p>

                    <div className=" flex flex-col w-full sm:flex-row items-center max-w-xl mx-auto justify-center gap-y-4 sm:justify-between pr-2 sm:pr-1 sm:bg-white rounded-full mb-5 relative group transition-all duration-500 border border-transparent hover:border-primary focus-within:border-primary">

                        <input className="block w-full px-6 py-3.5 text-base max-sm:text-center font-normal shadow-xs max-sm:bg-white text-gray-900 bg-transparent border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal" placeholder="@bluemigrate" name="u" />

                        <Link href='/migrate/' className="py-3 px-6 max-sm:w-full text-center rounded-full bg-primary text-white text-sm leading-4 font-medium whitespace-nowrap transition-all duration-300 hover:bg-blue-700 sm:absolute top-1.5 right-3">Migrate</Link>


                    </div>
                    {/* <div className="my-4 px-5 py-1.5 text-sm font-medium  text-primary border-2 rounded-full ">
                        {getMigrationNumber()} people already migrated their tweets!
                    </div> */}

                    <SocialProof />
                    <FeaturedAccounts />
                </div>


            </div>
        </section>
    );
}