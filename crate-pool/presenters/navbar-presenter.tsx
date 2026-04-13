"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {NavbarView} from "@/views/navbar-view";

export function NavbarPresenter() {
    const router = useRouter(); //create router object for page navigation
    const pathname = usePathname(); //current path URL
    const searchParams = useSearchParams(); //get query parameters from URL

    // Keep navbar search synced with the active URL search title.
    const currentTitle = searchParams.get("title") ?? "";

    // useState will return; searchQuery; current value; setSearchQuery; function to update it
    //creates state of type string and initial value of initialQuery
    //state remains between renders
    const [searchQuery, setSearchQuery] = useState<string>(currentTitle);

    useEffect(() => {
        setSearchQuery(currentTitle);
    }, [currentTitle]);

    //called when user types in search bar
    function handleSearchQueryChange(value: string): void {
        setSearchQuery(value);
    }

    //called when user hits enter in search bar
    function handleSearchSubmit(): void {
        const trimmedQuery = searchQuery.trim();
        const params = new URLSearchParams(searchParams.toString());

        if (trimmedQuery.length === 0) {
            params.delete("title");

            if (params.toString()) {
                router.push(`/?${params.toString()}`);
            } else {
                router.push("/");
            }
            return;
        }

        // Write title query param; SearchPresenter reacts to URL query changes.
        params.set("title", trimmedQuery);
        params.delete("page");

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
        setSearchQuery("");

        const params = new URLSearchParams(searchParams.toString());
        params.delete("title");
        params.delete("page");

        if (params.toString()) {
            router.push(`/?${params.toString()}`);
        } else {
            router.push("/");
        }
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