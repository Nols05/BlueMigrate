import Information from "@/components/Information"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "About",
    description: "Learn more about BlueMigrate",
}


export default function AboutPage() {
    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className=" text-5xl text-center font-bold text-white mb-4">About</h2>
                </div>

                <div className="space-y-8">

                    <div className="group relative flex flex-col gap-4 mx-auto w-full bg-white rounded-2xl shadow-2xl transition-all duration-300  p-8 xl:p-12 text-justify  ">
                        <Information />
                    </div>



                </div>
            </div>
        </section>
    )
}