"use client"

import { QueryParams } from "@/models/types";
import { useRouter, useSearchParams } from "next/navigation";

interface SetQueryParams {
    key: keyof QueryParams;
    value: number | string;
}[];

export function useQueryParams() {
    const searchParams = useSearchParams()
    const router = useRouter();

    const keys = [
        'query',
        'album', 'composer',
        'album_artist',
        'remixer', 'genre',
        'tonality', 'mix',
        'label', 'comments', 'user',
        'min_bpm', 'max_bpm',
        'min_duration', 'max_duration',
        'min_release', 'max_release',
        'min_date_added', 'max_date_added',
        'min_time_stamp', 'max_time_stamp',
        'min_rating', 'max_rating',
        'min_play_count', 'max_play_count',
        'min_bitrate', 'max_bitrate',
        'min_sample_rate', 'max_sample_rate',
        'min_size', 'max_size',
        'page', 'limit',
        'last_timestamp', 'last_hash',
    ] as const;

    const query: QueryParams = {};

    // Iterate over the defined keys and populate the query object with values from the URL search parameters
    keys.forEach(key => {
        const value = searchParams.get(key);
        // Only include the parameter in the query object if it has a value (i.e., is not null)
        if (value) {
            query[key] = value;
        }
    });

    // Set default values for pagination if not present in the URL
    if (!query.page) {
        //query.page = "1";
    }

    if (!query.limit) {
        //query.limit = "50";
    }

    // Function to update a specific query parameter in the URL, while preserving other parameters and resetting the page to 1 if any parameter other than page is changed
    function setQuery(SetQueryParams: SetQueryParams[]) {
        const params = new URLSearchParams(searchParams.toString());

        // Update the specific query parameter with the new value.
        // If the value is empty, remove the parameter entirely from the URL.
        SetQueryParams.forEach(({ key, value }) => {
            if (value) {
                params.set(key, value.toString());
            }
            else {
                params.delete(key);
            }
        });

        // Reset page to 1 if any query parameter other than page is changed
        // if (key !== "page") {
        //     params.set("page", "1");
        // }

        // Use replace so the URL updates in place instead of adding a new history entry.
        // That means the back button does not step through every filter/search change.
        if (params.toString()) {
            router.replace(`?${params.toString()}`);
        } else {
            router.replace(`/`);
        }
    }

    function clearFilters() {
        const params = new URLSearchParams();

        // Behåll endast sökqueryn
        if (query.query) {
            params.set("query", query.query);
        }

        if (params.toString()) {
            router.replace(`?${params.toString()}`);
        } else {
            router.replace(`/`);
        }
    }

    return { query, setQuery, clearFilters };
}