'use client'

import Image from "next/image";
import { useState } from "react";
import { cancelFeaturedAccount } from "@/lib/stripe";
import Link from "next/link";


type FeaturedAccount = {
    name: string;
    handle: string;
    image: string;
    subscriptionId: string;

}

export default function MyFeatured({ featuredAccounts }: { featuredAccounts: FeaturedAccount[] }) {
    const [showModal, setShowModal] = useState("");

    return (
        <>
            <div className="group relative flex flex-col mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-2xl transition-all duration-300 p-8 xl:p-12  ">

                {
                    featuredAccounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 h-96">
                            <p className="text-gray-500 text-lg">No featured accounts</p>
                            <Link href="/featured" className="text-primary">Feature an account</Link>
                        </div>
                    )
                }
                {
                    featuredAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <Image src={account.image} alt="" className="w-12 h-12 rounded-full" width={48} height={48} />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">{account.name}</h3>
                                    <p className="text-sm text-gray-500">{account.handle}</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-red-500 text-white rounded-full text-sm" onClick={() => setShowModal(account.subscriptionId)}>
                                Cancel
                            </button>
                        </div>
                    ))
                }
            </div>

            {
                showModal && <Modal subscriptionId={showModal} setShowModal={setShowModal} />
            }



        </>
    )

}


function Modal({ subscriptionId, setShowModal }: { subscriptionId: string, setShowModal: (value: string) => void }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl">
                <h2 className="text-2xl font-semibold">Are you sure you want to cancel?</h2>
                <p className="text-gray-500 text-sm mb-8">Your account will still be featured until the end of the billing cycle.</p>
                <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm mr-4" onClick={() => setShowModal("")}>No</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-full text-sm" onClick={() => cancelFeaturedAccount(subscriptionId)}>Yes</button>
                </div>
            </div>
        </div>
    )
}