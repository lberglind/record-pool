"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {NavbarView} from "@/views/navbar-view";

export function NavbarPresenter() {
    const router = useRouter(); //create router object for page navigation
    const pathname = usePathname(); //current path URL
    const searchParams = useSearchParams(); //get query parameters from URL

    // This is the source of truth for the search query state, derived from the URL query parameter "query"
    const urlQuery = searchParams.get("query") ?? ""; //get "query" parameter from URL, default to empty string if not present

    // useState will return; searchQuery; current value; setSearchQuery; function to update it
    //creates state of type string and initial value of initialQuery
    //state remains between renders
    const [searchQuery, setSearchQuery] = useState<string>(urlQuery);

    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery]);

    //called when user types in search bar
    // TODO: consider debouncing this to avoid excessive updates while typing
    // We could also consider updating the URL on every change instead of only on submit
    function handleSearchQueryChange(value: string): void {
        setSearchQuery(value);
    }

    //called when user hits enter in search bar
    function handleSearchSubmit(): void {
        const trimmedQuery = searchQuery.trim();
        const params = new URLSearchParams(searchParams.toString());

        if (trimmedQuery.length === 0) {
            params.delete("query");

            if (params.toString()) {
                router.push(`/?${params.toString()}`);
            } else {
                router.push("/");
            }
            return;
        }

        // Write query param; SearchPresenter reacts to URL query changes.
        params.set("query", trimmedQuery);

        // Reset page to 1 when a new search is submitted.
        params.delete("page");

        // Update URL with new search query; SearchPresenter reacts to URL query changes.
        router.push(`/?${params.toString()}`);
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

        // Clear the search query state and remove related query parameters from the URL.
        setSearchQuery("");

        // Remove query and page parameters from the URL.
        const params = new URLSearchParams(searchParams.toString());
        params.delete("query");
        params.delete("page");

        if (params.toString()) {
            router.push(`/?${params.toString()}`);
        } else {
            router.push("/");
        }
    }

    return (
        <NavbarView
            searchQuery={searchQuery}
            urlQuery={urlQuery}
            activePath={pathname}
            onSearchQueryChange={handleSearchQueryChange}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onLibraryClick={handleLibraryClick}
            onLikedClick={handleLikedClick}
            onProfileClick={handleProfileClick}
        />
    );
}