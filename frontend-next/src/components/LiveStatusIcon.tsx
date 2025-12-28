
'use client';

import { Check, X } from "lucide-react";
import Loading from "./Loading";
import { useEffect, useState } from "react";
import { getMigrationStatus } from "@/actions/migration";




export default function LiveStatusIcon({ id, status, textClassName, iconClassName }: { id: string, status: string, iconClassName?: string, textClassName?: string }) {
    const [currentStatus, setCurrentStatus] = useState(status);


    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const newStatus = await getMigrationStatus(id);
                if (newStatus) {
                    setCurrentStatus(newStatus);
                }
            } catch (error) {
                console.error("Failed to fetch migration status:", error);
            }
        };

        // Poll every 5 seconds
        const interval = setInterval(() => {
            if (currentStatus === "PENDING")
                fetchStatus();
        }, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [id, currentStatus]);

    return (
        <div>
            <div className="flex items-center justify-center gap-2 ">
                {
                    currentStatus === "SUCCESS" ? <Check className={`w-8 h-8 bg-primary text-green-100 rounded-full p-1 ${iconClassName}`} />
                        : currentStatus === "PENDING" ? <Loading />
                            : <X className={`w-8 h-8 bg-red-500 text-red-100 rounded-full p-1 ${iconClassName}`} />
                }
                <p className={`${textClassName} text-4xl ${currentStatus === "PENDING" ? "text-primary" : currentStatus === "SUCCESS" ? "text-primary" : "text-red-500"}`}> {currentStatus}</p>
            </div>
            {
                currentStatus === "FAILED" ? <p className="text-red-500 text-center my-2">Please try again</p>
                    :
                    <p className="text-gray-500 text-balance text-center max-w-sm mt-4">{"Don't forget to share this tool!"}</p>

            }
        </div>
    )
}