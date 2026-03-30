"use client";

import {useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import {NavbarView} from "@/views/navbar-view";

export function NavbarPresenter() {
    const router = useRouter(); //create router object for page navigation
    const pathname = usePathname(); //current path URL
    const searchParams = useSearchParams(); //get query parameters from URL

    //get query parameter "q" from URL or default to empty string
    // get on /search?q=house gives house
    const initialQuery = searchParams.get("q") ?? "";

    // useState will return; searchQuery; current value; setSearchQuery; function to update it
    //creates state of type string and initial value of initialQuery
    //state remains between renders
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

    //called when user types in search bar
    function handleSearchQueryChange(value: string): void {
        setSearchQuery(value);
    }

    //called when user hits enter in search bar
    function handleSearchSubmit(): void {
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery.length === 0) {
            router.push("/search");
            return;
        }

        //format search query for URL if special chars
        //drum & bass -> drum%20and%26bass
        const encodedQuery = encodeURIComponent(trimmedQuery);
        router.push(`/search?q=${encodedQuery}`);
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
        setSearchQuery("");
    }

    //pass props to view as single object
    return (
        <NavbarView
            searchQuery={searchQuery}
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