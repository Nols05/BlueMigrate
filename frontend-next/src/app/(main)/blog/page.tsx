import { Metadata } from "next"


export const metadata: Metadata = {
    title: "Blog",
    description: "Read articles about how to migrate your tweets to Bluesky",
}

export default function AboutPage() {
    return (
        <section className="py-24">
            <div className="grid place-content-center h-[20rem] w-full bg-primary">
                <div>
                    <h2 className=" text-5xl text-center font-bold text-white mt-6">Blog</h2>
                </div>
            </div>


            <p className='font-bold text-center text-2xl mt-20'>Nothing to see yet.</p>
        </section>
    )
}