import Link from "next/link";



export default function SocialProof() {

    return (
        <div className="flex flex-wrap justify-center items-center gap-2">
            <Link href="https://fazier.com/launches/bluemigrate-2" target="_blank" rel="noopener noreferrer"><img src="https://fazier.com/api/v1/public/badges/embed_image.svg?launch_id=2099&badge_type=daily&theme=light" width="270" alt="Example Image" className="d-inline-block rounded img-fluid p-3" /></Link>

        </div>
    )
}