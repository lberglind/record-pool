"use client"

import { QueryParams, SortBy, SortDirection } from "@/models/types";
import { useRouter, useSearchParams } from "next/navigation";


export function useQueryParams() {
    const searchParams = useSearchParams()
    const router = useRouter();

    // Construct the query object from the URL search parameters, providing default values if parameters are missing
    const query: QueryParams = {
        title: searchParams.get('title') ?? "",
        artist: searchParams.get('artist') ?? "",
        page: searchParams.get('page') ?? "1",
        pageSize: searchParams.get('pageSize') ?? "20",
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