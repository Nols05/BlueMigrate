'use client';

import { CirclePlus, X } from "lucide-react";
import { useState } from "react";

export default function ThreadForm() {
    const [threads, setThreads] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newThreads = [...threads];
        newThreads[index] = e.target.value;
        setThreads(newThreads);
    };

    const handleRemoveInput = (index: number) => {

        setThreads(threads.filter((_, i) => i !== index));
    };

    const handleAddInput = () => {
        if (threads.length < 100) {
            setThreads([...threads, '']);
        } else {
            alert('You can only add up to 100 threads.');
        }
    };

    return (
        <div className="space-y-8 my-6">
            <div>
                {threads.map((link, index) => (
                    <div key={index} className="space-y-2 my-4 relative">
                        <label
                            htmlFor={`thread-${index}`}
                            className="flex gap-2 items-center text-lg font-semibold ml-2 text-gray-800"
                        >
                            Thread {index + 1}
                        </label>
                        <input
                            className="block w-full px-6 py-3.5 text-base font-normal shadow-xs text-gray-900 border-none rounded-full placeholder-gray-400 focus:outline-none leading-normal bg-muted"
                            placeholder="https://x.com/username/status/1234567890123456789"
                            id={`thread-${index}`}
                            name="thread"
                            required
                            value={link}
                            onChange={(e) => handleChange(e, index)}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveInput(index)}
                            className="absolute top-0 right-0 mt-3 mr-3 text-gray-500 hover:text-red-600"
                        >
                            <X size={24} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddInput}
                    className="py-2.5 mt-6 mb-10 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-primary font-semibold text-center w-fit hover:bg-primary hover:text-white flex gap-2 items-center"
                >
                    <CirclePlus size={16} />
                    Add a thread
                </button>
            </div>


        </div>
    );
}
