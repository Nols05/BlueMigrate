import { getFeaturedAccounts } from "@/actions/bluesky"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Info } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

export default async function FeaturedAccounts() {
    const profiles = await getFeaturedAccounts()

    return (
        <div>
            <h2 className="text-2xl font-bold my-6">Featured Bluesky Profiles</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profiles?.map((profile) => (
                    <Card key={profile.handle} className="flex flex-col max-h-56">
                        <CardContent className="flex-grow p-4 ">
                            <div className="flex items-start gap-3">
                                <Image
                                    src={profile.image || ""}
                                    alt={profile.name || ""}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <div className="min-w-0">
                                    <h3 className="font-semibold truncate">{profile.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{profile.handle}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm line-clamp-4 whitespace-pre-line">{profile.description}</p>

                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Link href={profile.link || ""} target="_blank">
                                <Button variant="outline" className="w-full justify-between">
                                    Visit profile
                                    <span className="ml-2">→</span>
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-semibold">Want to be here?</h3>
                            {/* <Info className="w-4 h-4 text-muted-foreground" /> */}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get hundreds of eyes on your profile by being featured on our homepage for 9.99$/week.
                        </p>
                        <Link href="/featured">
                            <Button className="w-full justify-between">
                                Take your spot
                                <span className="ml-2">→</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

