
import Loading from "@/components/Loading"
import SignupForm from "@/components/SignupForm"
import { Suspense } from "react"



export default function SignupPage() {

    return (
        <Suspense fallback={<Loading />}>
            <SignupForm />
        </Suspense>
    )

}