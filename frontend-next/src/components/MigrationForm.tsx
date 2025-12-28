
'use client';

import X from "@/components/icons/XIcon";
import Bluesky from "@/components/icons/BlueskyIcon";
import { useActionState, useState } from "react";
import Link from "next/link";
import ThreadForm from "./ThreadForm";

export default function MigrationForm({ action, isPremium }: { action: any, isPremium: boolean }) {
    const [state, formAction, pending] = useActionState(action, { errors: { twitterName: '', bskyHandle: '', password: '' } });
    const [formData, setFormData] = useState({ twitterName: '', bskyHandle: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <form className="space-y-8 my-6" action={formAction}>

            <div className="space-y-2">

                <label htmlFor="twitterName" className="flex gap-2 items-center text-lg font-semibold ml-2 text-gray-800">
                    <X className="size-7 p-1 bg-black" />
                    Your X username
                </label>
                <input className="block w-full px-6 py-3.5 text-base  font-normal shadow-xs  text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted" placeholder="@bluemigrate" id="twitterName" name="twitterName" required defaultValue={formData.twitterName} onChange={handleChange} />
                {state?.errors?.twitterName && <p className="text-red-500 text-sm">{state.errors.twitterName}</p>}

            </div>


            <div className="space-y-2">

                <label htmlFor="bskyHandle" className="flex gap-2 items-center text-lg font-semibold ml-2 text-gray-800">
                    <Bluesky className="size-7 " />
                    Full bluesky handle
                </label>
                <input className="block w-full px-6 py-3.5 text-base  font-normal shadow-xs  text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted" placeholder="john.bsky.social" id="bskyHandle" name="bskyHandle" required defaultValue={formData.bskyHandle} onChange={handleChange} />
                {state?.errors?.bskyHandle && <p className="text-red-500 text-sm">{state.errors.bskyHandle}</p>}

            </div>

            <div className="space-y-2">

                <label htmlFor="password" className="flex gap-2 items-center text-lg font-semibold ml-2 text-gray-800">
                    <Bluesky className="size-7 " />
                    Bluesky password
                </label>
                <p className="text-sm font-normal text-gray-500 ml-3">We recommend generating a disposable app password. If you have 2FA activated, this is required:
                    <Link className="text-primary mx-1" target="_blank" href="/app-password" tabIndex={-1}>Here is how you can do it on Bluesky</Link>
                </p>
                <input className="block w-full px-6 py-3.5 text-base font-normal shadow-xs  text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted" placeholder="********" type="password" id="password" name="password" required defaultValue={formData.password} onChange={handleChange} />
                {state?.errors?.password && <p className="text-red-500 text-sm">{state.errors.password}</p>}


            </div>
            {
                isPremium &&
                <div>

                    <div>

                        <h2 className="text-xl font-bold text-primary">Have any long threads? Add the link of their first tweet </h2>
                        <p className="text-sm font-normal text-gray-500">Long threads are the ones with 3 or more tweets.</p>
                    </div>

                    <ThreadForm />
                </div>
            }



            <p className="text-sm font-normal text-gray-500">
                Quotes and videos are not copied.
            </p>




            <button className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit mx-auto hover:bg-primary hover:text-white " disabled={pending}>
                {pending ? 'Migrating...' : 'Migrate'}
            </button>
        </form>
    )
}