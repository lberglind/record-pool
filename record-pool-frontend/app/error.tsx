"use client"

export default function Error({
    error,
}: {
    error: Error;
}) {
    return (
        <div className="p-6">
            <h2 className="text-red-600 font-bold">
                Something Went Wrong..
            </h2>
            <pre>{error.message}</pre>
        </div>
    );
}
