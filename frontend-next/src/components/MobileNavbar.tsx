
'use client';

import { useState } from "react";
import Link from "next/link";
import { deleteSession } from "@/lib/session";


export default function MobileNavbar({ userId }: { userId: string | undefined }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="">
            <button data-collapse-toggle="navbar" type="button" onClick={() => setIsOpen(!isOpen)}
                className="inline-flex  items-center p-2 ml-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-controls="navbar-default" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"></path>
                </svg>
            </button>

            {
                isOpen &&
                <div className="z-10 absolute top-20 right-0 f bg-white rounded-lg shadow-md  w-44 ">
                    <ul className="text-sm text-gray-700 p-4">
                        <li>
                            <Link href="/about"
                                className="block py-2  hover:text-primary text-gray-900 font-semibold transition-all duration-500">About
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog"
                                className="block py-2  hover:text-primary text-gray-900 font-semibold transition-all duration-500">Blog
                            </Link>
                        </li>
                        <li>
                            <Link href="/pricing"
                                className="block py-2  hover:text-primary text-gray-900 font-semibold transition-all duration-500">Pricing
                            </Link>
                        </li>

                        <hr className="my-2" />
                        <li>
                            <Link href="/my-migrations"
                                className="block py-2  hover:text-primary text-gray-900 font-semibold transition-all duration-500">My migrations
                            </Link>
                        </li>
                        <li>
                            <Link href="/featured-accounts"
                                className="block py-2 hover:text-primary text-gray-900 font-semibold transition-all duration-500">Featured accounts
                            </Link>
                        </li>
                        {userId &&
                            <li>
                                <hr className="my-2" />
                                <form action={deleteSession}
                                    className="block  py-2 hover:text-primary text-gray-900 font-semibold transition-all duration-500">
                                    <button type="submit" >Logout</button>
                                </form>
                            </li>

                        }

                    </ul>
                </div>
            }
        </div>

    )

}