//define types for props
export interface NavbarViewProps {
    searchQuery: string;
    urlQuery: string;
    activePath: string;
    onSearchQueryChange: (value: string) => void;
    onSearchSubmit: () => void;
    onClearSearch: () => void;
    onLibraryClick: () => void;
    onLikedClick: () => void;
    onProfileClick: () => void;
}