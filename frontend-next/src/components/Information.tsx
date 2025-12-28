import Image from "next/image";
import Link from "next/link";



export default function Information() {

    return (
        <>
            <h2 className='h2-primary'>Is everything copied?</h2>

            <p className="text-gray-500 text-lg text-pretty">
                Tweets with more than 300 characters are truncated since Bluesky has that limit.
            </p>

            <p className="text-gray-500 text-lg text-pretty">
                Videos are copied as a thumbnail.
            </p>
            <p className="text-gray-500 text-lg text-pretty">
                {"Of course, RTs and quotes are not copied since they involve other people's content."}
            </p>
            <p className="text-gray-500 text-lg text-pretty">
                NSFW or private accounts are not copied.
            </p>
            <p className="text-gray-500 text-lg"><strong>Important: </strong>X only allows retrieving your last 3200 tweets with its API. This numbers counts RTs and quotes, which are not migrated with this tool. So if you have lots of RTs and Quotes distributed among the tweets that should be migrated, the number of migrated tweets will be lower than expected.</p>

            <h2 className='h2-primary'>How are the tweets backdated?</h2>
            <p className="text-gray-500 text-lg">Bluesky allows posts to have a past date. That will order your posts chronologically as if they were posted on the original date. If you click on those posts it will show the original date as a badge.</p>
            <Image src="/backdated.png" alt="Backdate" width={500} height={300} className="mx-auto" />


            <h2 className='h2-primary'>How does it work?</h2>
            <p className="text-gray-500 text-lg">BlueMigrate uses available APIs to migrate your data from one platform to another. For the moment, it is necessary to provide Bluesky credentials to migrate your data.</p>
            <p className=" font-normal text-lg text-gray-500">We recommend generating a disposable app password. If you have 2FA activated, this is required:
                <Link className="text-primary mx-1" target="_blank" href="/app-password">Here is how you can do it on Bluesky.</Link>
            </p>



            <h2 className='h2-primary'>Refund policy</h2>
            <p className="text-gray-500 text-lg">Refunds are available within 7 days if the migration fails due to a service error. Refunds are not available if the issue is one of the limitations mentioned in the <strong>Is everything copied?</strong> section. Please, read it carefully before commiting.</p>


            <h2 className='h2-primary'>How can I contact you?</h2>
            <p className="text-gray-500 text-lg">For any questions, issues or concerns, send an email to <a href="mailto:support@bluemigrator.com" className="text-primary">support@bluemigrate.com</a></p>


        </>
    )


}