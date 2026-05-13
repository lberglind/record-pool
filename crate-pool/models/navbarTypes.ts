//define types for props
export interface NavbarViewProps {
    searchQuery: string;
    urlQuery: string;
    activePath: string;
    isFilterViewOpen: boolean;
    onToggleFilterView: () => void;
    onSearchQueryChange: (value: string) => void;
    onClearSearch: () => void;
    onLibraryClick: () => void;
    onLikedClick: () => void;
    onProfileClick: () => void;
}