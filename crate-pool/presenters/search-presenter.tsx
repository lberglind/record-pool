import SearchView from "@/views/search-view";
import UploadView from "@/views/upload-view";

export default function searchPresenter() {
    return (
        <div className="w-full mx-auto container">
            <SearchView />
            <UploadView />
        </div>)
}