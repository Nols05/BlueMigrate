// Dependencies: pnpm install lucide-react

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";

export default function InputWithAt({ label, placeholder, name }: { label: string, placeholder: string, name: string }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-lg font-semibold text-gray-800">{label}</Label>
            <div className="relative">
                <Input id={name} name={name} placeholder={placeholder} className="peer ps-9 block w-full py-6 text-base max-sm:text-center font-normal shadow-xs max-sm:bg-white text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted" required />

                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <AtSign size={16} strokeWidth={2} aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
