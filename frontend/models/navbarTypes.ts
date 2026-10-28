import type { ChangeEvent, FormEvent } from "react";

//define types for props
export interface NavbarViewProps {
    searchQuery: string;
    urlQuery: string;
    activePath: string;
    isFilterViewOpen: boolean;
    onToggleFilterView: () => void;
    onSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSearchFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClearSearch: () => void;
    onLibraryClick: () => void;
    onLikedClick: () => void;
    onProfileClick: () => void;
}