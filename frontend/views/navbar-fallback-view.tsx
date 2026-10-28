import { Search, Library, Heart, User, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NavbarFallbackView() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* main navbar row */}
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
                {/* logo */}
                <div className="text-lg font-semibold tracking-tight opacity-60">
                    Crate Pool
                </div>

                {/* desktop search */}
                <div className="hidden min-w-0 flex-1 md:block">
                    <div className="flex gap-2 px-8">
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                disabled
                                placeholder="Loading search..."
                                className="pl-10"
                            />
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            disabled
                        >
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* nav buttons */}
                <nav
                    aria-label="Primary navigation"
                    className="ml-auto flex items-center gap-2"
                >
                    <Button variant="ghost" size="sm" disabled>
                        <Library className="h-4 w-4" />
                        <span className="hidden sm:inline">Library</span>
                    </Button>

                    <Button variant="ghost" size="sm" disabled>
                        <Heart className="h-4 w-4" />
                        <span className="hidden sm:inline">Liked</span>
                    </Button>

                    <Button variant="ghost" size="sm" disabled>
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </Button>
                </nav>
            </div>

            {/* mobile search */}
            <div className="border-t px-4 py-3 md:hidden">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        disabled
                        placeholder="Loading..."
                        className="pl-9"
                    />
                </div>
            </div>
        </header>
    );
}