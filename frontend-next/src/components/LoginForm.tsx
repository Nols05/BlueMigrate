


'use client'

import Image from "next/image"
import Link from "next/link"
import React, { useActionState, useState } from "react"
import { login } from "@/actions/auth"
import { useSearchParams } from "next/navigation"



export default function LoginForm() {

    const [state, action, pending] = useActionState(login, undefined);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const searchParams = useSearchParams();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <section className="bg-gray-50 ">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 ">
                    <Image src={"/logo.svg"} alt="logo" width={300} height={100} />
                </Link>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" action={action}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">Your email</label>
                                <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  " placeholder="name@company.com" required defaultValue={formData.email} onChange={handleChange} />
                                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                                <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  " required defaultValue={formData.password} onChange={handleChange} />
                                {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password}</p>}
                            </div>

                            <button type="submit" className="w-full text-white bg-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center">Sign in</button>
                            <p className="text-sm font-light text-gray-500 ">
                                {"Don't have an account yet?"} <Link href={`/signup?${searchParams.get("r") ? `r=${searchParams.get("r")}` : ""}`}
                                    className="font-medium text-primary hover:underline ">Sign up</Link>
                            </p>


                            <input type="hidden" name="r" value={searchParams.get("r") || ""} />

                        </form>
                    </div>
                </div>
            </div>
        </section>
    )



}