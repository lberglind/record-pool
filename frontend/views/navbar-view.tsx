import { Search, Library, Heart, User, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavbarViewProps } from "@/models/navbarTypes";
import Link from "next/link";

//props and types defined in navbarTypes.ts
export function NavbarView(props: NavbarViewProps) {
    const {
        searchQuery,
        activePath,
        onSearchInputChange,
        onSearchFormSubmit,
        onLibraryClick,
        onLikedClick,
        onProfileClick,
        isFilterViewOpen,
        onToggleFilterView
    } = props; 

    // check if the current path matches any of the active paths for ghost highlighting
    // This is used to determine which navigation button should be highlighted as active
    const isLibraryActive = activePath === "/library";
    const isLikedActive = activePath === "/liked";
    const isProfileActive = activePath === "/profile";

    // Disable search button when search query is empty or only whitespace
    const isSearchDisabled = searchQuery.trim().length === 0;

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
                    className="hidden min-w-0 flex-1 md:block"
                    onSubmit={onSearchFormSubmit}
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
                                onChange={onSearchInputChange}
                                type="search"
                                placeholder="Search tracks, artists, playlists..."
                                //input padding
                                className="pl-10"
                                aria-label="Search"
                            />
                        </div>
                        <Button
                            type="button"
                            variant={!isFilterViewOpen ? "ghost" : "default"}
                            size="icon"
                            className="cursor-pointer"
                            onClick={onToggleFilterView}
                            aria-label="Toggle filters"
                        >
                            <ListFilter className="h-4 w-4" />
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
                <form onSubmit={onSearchFormSubmit}>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
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
                                onChange={onSearchInputChange}
                                type="search"
                                placeholder="Search tracks, artists, playlists..."
                                //input padding
                                className="pl-10"
                                aria-label="Search"
                            />
                        </div>
                        <Button
                            type="button"
                            variant={!isFilterViewOpen ? "ghost" : "default"}
                            size="icon"
                            className="cursor-pointer"
                            onClick={onToggleFilterView}
                            aria-label="Toggle filters"
                        >
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </div>
        </header>
    );
}