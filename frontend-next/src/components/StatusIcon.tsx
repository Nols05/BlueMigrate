

import { Check, X } from "lucide-react";
import Loading from "./Loading";




export default function StatusIcon({ status, textClassName, iconClassName }: { status: string, iconClassName?: string, textClassName?: string }) {

    return (
        <div className="flex items-center gap-2 mb-4">
            {
                status === "SUCCESS" ? <Check className={`w-6 h-6 bg-primary text-green-100 rounded-full p-1 ${iconClassName}`} />
                    : status === "PENDING" ? <Loading />
                        : <X className={`w-6 h-6 bg-red-500 text-red-100 rounded-full p-1 ${iconClassName}`} />
            }
            <p className={`${textClassName} text-lg ${status === "PENDING" ? "text-primary" : status === "SUCCESS" ? "text-primary" : "text-red-500"}`}> {status}</p>
        </div>
    )
}