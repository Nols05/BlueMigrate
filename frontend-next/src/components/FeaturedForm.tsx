
'use client';

import Bluesky from "@/components/icons/BlueskyIcon";
import { useActionState, useState } from "react";
import { buyFeaturedAccount } from "@/lib/stripe";

export default function FeaturedForm() {
    const [state, formAction, pending] = useActionState(buyFeaturedAccount, { errors: { bskyHandle: [''] } });
    const [formData, setFormData] = useState({ bskyHandle: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <form className="space-y-8 my-6" action={formAction}>
            <div className="space-y-2">

                <label htmlFor="bskyHandle" className="flex gap-2 items-center text-lg font-semibold ml-2 text-gray-800">
                    <Bluesky className="size-7 " />
                    Full bluesky handle
                </label>
                <input className="block w-full px-6 py-3.5 text-base  font-normal shadow-xs  text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted" placeholder="john.bsky.social" id="bskyHandle" name="bskyHandle" required defaultValue={formData.bskyHandle} onChange={handleChange} />
                {state?.errors?.bskyHandle && <p className="text-red-500 text-sm">{state.errors.bskyHandle}</p>}

            </div>



            <button className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit mx-auto hover:bg-primary hover:text-white ">Get featured (9.99$/week)</button>

        </form>
    )
}