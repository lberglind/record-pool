import { Search, Library, Heart, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavbarViewProps } from "@/models/navbarTypes";
import type { ChangeEvent, SubmitEvent } from "react";
import Link from "next/link";

//props and types defined in navbarTypes.ts
export function NavbarView(props: NavbarViewProps) {
    const {
        searchQuery,
        urlQuery,
        activePath,
        onSearchQueryChange,
        onSearchSubmit,
        onClearSearch,
        onLibraryClick,
        onLikedClick,
        onProfileClick,
    } = props;  //destructure props

    // ran when user types in search bar
    // event has type of a ChangeEvent which is triggered when the value of an <input> element is changed
    //returns void
    function handleSearchInputChange(event: ChangeEvent<HTMLInputElement>): void {
        onSearchQueryChange(event.target.value);
    }

    // ran when user submits search form
    // event has type of a SubmitEvent which is triggered when the user submits a form
    // returns void
    function handleSearchFormSubmit(event: SubmitEvent<HTMLFormElement>): void {
        event.preventDefault(); //stop page from reloading when form is submitted
        onSearchSubmit();
    }

    // check if the current path matches any of the active paths for ghost highlighting
    // This is used to determine which navigation button should be highlighted as active
    const isLibraryActive = activePath === "/library";
    const isLikedActive = activePath === "/liked";
    const isProfileActive = activePath === "/profile";

    // Disable search button when search query is empty or only whitespace
    const isSearchDisabled = searchQuery.trim().length === 0;

    const isQueryEmpty = urlQuery.trim().length === 0;

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* main navbar row */}
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
                {/* logo; send to home page when clicked */}
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    Crate Pool
                </Link>

                {/* search form; hidden on small screens, visible on medium screens and
                adjusts to layout */}
                <form
                    onSubmit={handleSearchFormSubmit}
                    className="hidden min-w-0 flex-1 md:block"
                >
                    <div className="flex gap-2 px-8">
                        <div className="relative w-full">
                            {/* Search icon */}
                            <button
                                type="submit"
                                disabled={isSearchDisabled}
                                //active when search query exists; change cursor to pointer and activate click
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground enabled:cursor-pointer disabled:cursor-default"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                            {/* Search text inside form,
                         onChange fires custom event up*/}
                            <Input
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                type="search"
                                placeholder="Search tracks, artists, playlists..."
                                //input padding
                                className="pl-10"
                                aria-label="Search"
                            />
                        </div>
                        <Button
                            type="button"
                            variant={isQueryEmpty ? "ghost" : "default"}
                            className="gap-2 cursor-pointer"
                            onClick={onClearSearch}
                        >
                            Clear
                        </Button>
                    </div>
                </form>

                {/* buttons to other pages */}
                <nav
                    aria-label="Primary navigation"
                    className="ml-auto flex items-center gap-2"
                >
                    {/* library */}
                    <Button
                        type="button"
                        variant={isLibraryActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2 cursor-pointer"
                        onClick={onLibraryClick}
                        aria-current={isLibraryActive ? "page" : undefined}
                    >
                        <Library className="h-4 w-4" />
                        <span className="hidden sm:inline">Library</span>
                    </Button>

                    {/* liked */}
                    <Button
                        type="button"
                        variant={isLikedActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2 cursor-pointer"
                        onClick={onLikedClick}
                        aria-current={isLikedActive ? "page" : undefined}
                    >
                        <Heart className="h-4 w-4" />
                        <span className="hidden sm:inline">Liked</span>
                    </Button>

                    {/* profile */}
                    <Button
                        type="button"
                        variant={isProfileActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2 cursor-pointer"
                        onClick={onProfileClick}
                        aria-current={isProfileActive ? "page" : undefined}
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </Button>
                </nav>
            </div>

            {/* search for mobile or small screens,
             shown on row below by separating divs */}
            <div className="border-t px-4 py-3 md:hidden">
                <form onSubmit={handleSearchFormSubmit}>
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            type="search"
                            placeholder="Search..."
                            className="pl-9"
                            aria-label="Search"
                        />
                    </div>
                </form>
            </div>
        </header>
    );
}