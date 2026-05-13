"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavbarView } from "@/views/navbar-view";
import FilterView from "@/views/filter-view";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDebouncedCallback } from 'use-debounce';

export function NavbarPresenter() {
    const router = useRouter(); //create router object for page navigation
    const pathname = usePathname(); //current path URL

    const { query, setQuery, clearFilters } = useQueryParams(); //custom hook to parse query parameters into an object

    // This is the source of truth for the search query state, derived from the URL query parameter "query"
    const urlQuery = query.query || ""; //get "query" parameter from URL, default to empty string if not present

    // useState will return; searchQuery; current value; setSearchQuery; function to update it
    //creates state of type string and initial value of initialQuery
    //state remains between renders
    const [searchQueryState, setSearchQueryState] = useState<string>(urlQuery);

    useEffect(() => {
        setSearchQueryState(urlQuery);
    }, [urlQuery]);


    // Update local input state immediately, but debounce updates to the URL
    const debouncedSetQuery = useDebouncedCallback((value: string) => {
        setQuery([{ key: "query", value }]); // update "query" parameter in URL with new value
    }, 300); // Debounce for 300ms

    function handleSearchQueryChange(value: string): void {
        setSearchQueryState(value); // update local input immediately so the UI is responsive
        debouncedSetQuery(value); // debounce the URL update
    }

    function handleLibraryClick(): void {
        router.push("/library");
    }

    function handleLikedClick(): void {
        router.push("/liked");
    }

    function handleProfileClick(): void {
        router.push("/profile");
    }

    function handleClearSearch(): void {
        debouncedSetQuery.cancel?.();
        setSearchQueryState(""); // Clear the search query state and remove related query parameters from the URL.
        setQuery([{ key: "query", value: "" }]); // This will remove the "query" parameter from the URL
    }

    const [isFilterViewOpen, setIsFilterViewOpen] = useState(false);

    function toggleFilterView(): void {
        setIsFilterViewOpen(!isFilterViewOpen);
    }

    function renderFilterView() {
        if (!isFilterViewOpen) return null;
        // Compute controlled values for sliders from URL query params
        const releaseValue: [number, number] = [
            query.min_release ? Number(query.min_release) : 1900,
            query.max_release ? Number(query.max_release) : 2026,
        ];

        const durationValue: [number, number] = [
            query.min_duration ? Number(query.min_duration) : 0,
            query.max_duration ? Number(query.max_duration) : 300,
        ];

        const bpmValue: [number, number] = [
            query.min_bpm ? Number(query.min_bpm) : 0,
            query.max_bpm ? Number(query.max_bpm) : 200,
        ];

        function handleReleaseChange([min, max]: [number, number]) {
            setQuery([{ key: "min_release", value: min }, { key: "max_release", value: max }]);
        }

        function handleDurationChange([min, max]: [number, number]) {
            setQuery([{ key: "min_duration", value: min }, { key: "max_duration", value: max }]);
        }

        function handleBPMChange([min, max]: [number, number]) {
            setQuery([{ key: "min_bpm", value: min }, { key: "max_bpm", value: max }]);
        }

        function handleGenreChange(genre: string) {
            if (query.genre === genre) {                // If the same genre is clicked again, toggle it off
                setQuery([{ key: "genre", value: "" }]);
                return;
            }
            setQuery([{ key: "genre", value: genre }]);
        }

        return (
            <div className="fixed top-16 left-0 right-0 z-40 w-full animate-in fade-in">
                <FilterView
                    clearFilters={clearFilters}
                    query={query}
                    releaseValue={releaseValue}
                    durationValue={durationValue}
                    bpmValue={bpmValue}
                    onReleaseChange={handleReleaseChange}
                    onDurationChange={handleDurationChange}
                    onBPMChange={handleBPMChange}
                    onGenreChange={handleGenreChange}
                />
            </div>
        );
    }

    return (
        <>
            <NavbarView
                searchQuery={searchQueryState}
                urlQuery={urlQuery}
                activePath={pathname}
                onSearchQueryChange={handleSearchQueryChange}
                onClearSearch={handleClearSearch}
                onLibraryClick={handleLibraryClick}
                onLikedClick={handleLikedClick}
                onProfileClick={handleProfileClick}
                isFilterViewOpen={isFilterViewOpen}
                onToggleFilterView={toggleFilterView}
            />
            {renderFilterView()}
        </>
    );
}