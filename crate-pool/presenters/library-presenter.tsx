"use client"

import LibraryView from "@/views/library-view"

export default function LibraryPresenter() {
    return (
        <div className="w-full mx-auto container">
            <h1 className="text-2xl font-bold mb-4">Library</h1>
            <LibraryView />
        </div>

    )
}