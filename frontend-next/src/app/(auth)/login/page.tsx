
import Loading from "@/components/Loading"
import LoginForm from "@/components/LoginForm"
import { Suspense } from "react"



export default function Login() {



    return (
        <Suspense fallback={<Loading />}>
            <LoginForm />
        </Suspense>
    )



}