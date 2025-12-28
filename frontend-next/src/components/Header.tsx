import Image from "next/image";
import Link from "next/link";
import LoginButton from "./LoginButton";
import MobileNavbar from "./MobileNavbar";
import BuyMeACoffee from "./BuyMeACoffee";
import { getUser } from "@/lib/user";



export default async function Header() {
    const user = await getUser(false);


    return (


        <nav className="py-5 lg:fixed transition-all top-0 left-0 z-50 duration-500 w-full bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="w-full flex flex-col lg:flex-row">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <Image src={"/logo.svg"} alt="logo" className="w-56 lg:hidden" width={300} height={100} />
                        </Link>

                        <MobileNavbar userId={user?.id} />

                    </div>
                    <div className="hidden justify-between w-full lg:flex lg:pl-11 max-lg:mt-1 max-lg:h-screen max-lg:overflow-y-auto" id="navbar">
                        <Link href="/" className="flex items-center">
                            <Image src={"/logo.svg"} alt="logo" className="w-56" width={300} height={100} />
                        </Link>
                        <ul
                            className="flex flex-col lg:flex-row lg:items-center lg:gap-6 lg:ml-14 lg:mt-0 lg:mb-0 lg:mr-0 ">

                            <li>
                                <Link href="/about"
                                    className="nav-link mb-2 block lg:mr-6 md:mb-0 lg:text-left text-gray-500 font-medium transition-all duration-500 hover:text-gray-900">About
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog"
                                    className="nav-link mb-2 block lg:mr-6 md:mb-0 lg:text-left text-gray-500 font-medium transition-all duration-500 hover:text-gray-900">Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing"
                                    className="nav-link mb-2 block lg:mr-6 md:mb-0 lg:text-left text-gray-500 font-medium transition-all duration-500 hover:text-gray-900">Pricing
                                </Link>
                            </li>

                        </ul>
                        <div className="flex lg:items-center w-full justify-start flex-col lg:flex-row gap-4 lg:w-max max-lg:gap-4 lg:ml-14 lg:justify-end">
                            <LoginButton userId={user?.id} />
                            <Link href="/migrate/"
                                className="bg-primary text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 py-3 px-6 text-sm hover:bg-indigo-700">
                                Migrate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>




    );

}