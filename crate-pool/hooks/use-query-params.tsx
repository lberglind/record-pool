"use client"

import { QueryParams, SortBy, SortDirection } from "@/models/types";
import { useRouter, useSearchParams } from "next/navigation";


export function useQueryParams() {
    const searchParams = useSearchParams()
    const router = useRouter();

    // Construct the query object from the URL search parameters
    const query: QueryParams = {
        title: searchParams.get('title') ?? undefined,
        artist: searchParams.get('artist') ?? undefined,
        album: searchParams.get('album') ?? undefined,
        composer: searchParams.get('composer') ?? undefined,
        remixer: searchParams.get('remixer') ?? undefined,
        genre: searchParams.get('genre') ?? undefined,
        tonality: searchParams.get('tonality') ?? undefined,
        mix: searchParams.get('mix') ?? undefined,
        label: searchParams.get('label') ?? undefined,
        comments: searchParams.get('comments') ?? undefined,
        uploadedBy: searchParams.get('uploadedBy') ?? undefined,
        
        minBPM: searchParams.get('minBPM') ?? undefined,
        maxBPM: searchParams.get('maxBPM') ?? undefined,
        
        minDuration: searchParams.get('minDuration') ?? undefined,
        maxDuration: searchParams.get('maxDuration') ?? undefined,
        
        minDateAdded: searchParams.get('minDateAdded') ?? undefined,
        maxDateAdded: searchParams.get('maxDateAdded') ?? undefined,
        
        minTimeStamp: searchParams.get('minTimeStamp') ?? undefined,
        maxTimeStamp: searchParams.get('maxTimeStamp') ?? undefined,
        
        minRating: searchParams.get('minRating') ?? undefined,
        maxRating: searchParams.get('maxRating') ?? undefined,
        
        minPlayCount: searchParams.get('minPlayCount') ?? undefined,
        maxPlayCount: searchParams.get('maxPlayCount') ?? undefined,
        
        minBitRate: searchParams.get('minBitRate') ?? undefined,
        maxBitRate: searchParams.get('maxBitRate') ?? undefined,
        
        minSampleRate: searchParams.get('minSampleRate') ?? undefined,
        maxSampleRate: searchParams.get('maxSampleRate') ?? undefined,
        
        minSize: searchParams.get('minSize') ?? undefined,
        maxSize: searchParams.get('maxSize') ?? undefined,
        
        minYear: searchParams.get('minYear') ?? undefined,
        maxYear: searchParams.get('maxYear') ?? undefined,
        
        page: searchParams.get('page') ?? "1",
        pageSize: searchParams.get('pageSize') ?? "50",
        
        sortBy: (searchParams.get('sortBy') ?? "title") as SortBy,
        sortDirection: (searchParams.get('sortDirection') ?? "asc") as SortDirection,
    };

    // Function to update a specific query parameter in the URL, while preserving other parameters and resetting the page to 1 if any parameter other than page is changed
    function setQuery(key: keyof QueryParams, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        // Update the specific query parameter with the new value, or remove it if the value is empty
        if (value) {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }

        // Reset page to 1 if any query parameter other than page is changed
        if (key !== "page") {
            params.set("page", "1");
        }

        // Perform a client-side navigation to the provided route without adding a new entry into the browser’s history stack
        router.replace(`?${params.toString()}`)
    }

    return { query, setQuery }
}