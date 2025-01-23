//error.tsx needs to be a Client Component. This is useful for catching uncaught exceptions
'use client';

import { useEffect } from "react";

/**
 * the error prop is an instance of JS native Error object that is thrown when runtime errors occur
 * the reset prop is a function to re-render the route segment when executed
 * error:Error & { digest? :string } is a type that extends the native Error object with an optional digest property
 * reset: () => void means that reset is a function that takes no arguments and returns void
 */
export default function Error({error, reset}: {
    error: Error & { digest? :string };
    reset: () => void;
}) {

    /**
     * the [error] dependency array ensures that the useEffect hook runs 
     * only when the error prop changes
     */
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error("Error:",error);
    }, [error]);

    return (
        <main className="flex h-full flex-col items-center justify-center">
            <h2 className="text-center">Something went wrong!</h2>
            <button
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                onClick={
                    // Attempt to recover by trying to re-render the invoices route
                    ()=> reset()
                }
            >
                Try again
            </button>
            <p>{error.message}</p>
        </main>
    );
}