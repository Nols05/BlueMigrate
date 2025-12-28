
"use client"

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { deleteSession } from "@/lib/session";


export default function LoginButton({ userId }: { userId: string | undefined }) {
    const path = usePathname();
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setIsOpen(false)
    }, [path])


    return (
        <div className="relative">

            <button onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-50 relative flex gap-2 items-center text-primary rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 py-3 px-6 text-sm hover:bg-indigo-100">
                Account
                <ChevronDown className="size-5" />
            </button >

            {
                isOpen && (
                    <div className="z-10 absolute top-14 right-0 f bg-white rounded-lg shadow-md  w-44 ">
                        <ul className="text-sm text-gray-700 p-4">

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
                )
            }



        </div>

    )
}

{/* <form action={deleteSession}>
<button type="submit"
    className="bg-indigo-50 text-primary rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 py-3 px-6 text-sm hover:bg-indigo-100">
    Logout
</button>
</form> */}