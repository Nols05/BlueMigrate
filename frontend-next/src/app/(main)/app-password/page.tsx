import Information from "@/components/Information"
import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Generate App password",
    description: "Learn how to generate an app password on Bluesky",
}


export default function AppPassword() {
    return (
        <section className="py-24 lg:pt-64">
            <div className="absolute h-[36.5rem] w-full top-0 bg-primary -z-10"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className=" text-5xl text-center font-bold text-white mb-4">Generate a disposable App password</h2>
                </div>

                <div className="space-y-8">

                    <div className="group relative flex flex-col gap-4 mx-auto w-full bg-white rounded-2xl shadow-2xl transition-all duration-300  p-8 xl:p-12 text-justify  ">
                        <h2 className='h2-primary'>What is a disposable App Password?</h2>
                        <p className="text-gray-500 text-lg mb-2">Bluesky allows you to generate a disposable password that you can use to authenticate your account with third-party applications. This password is unique and can be revoked at any time. It does not ask for 2FA, so if you have it activated this is required for our service to work.</p>
                        <Image src="/apppassword.png" alt="App password" width={800} height={400} />
                        <p className="text-gray-500 text-lg mb-2">Create a new app password and give it a random name. It will give you a code, that code is the password you need to use.</p>
                        <Image src="/apppasswordexample.png" alt="App password" width={800} height={400} />

                    </div>



                </div>
            </div>
        </section>
    )
}