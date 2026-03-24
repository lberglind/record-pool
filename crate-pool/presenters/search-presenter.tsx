import SearchView from "@/views/search-view";
import UploadView from "@/views/upload-view";

export default function searchPresenter() {
    return (
        <div>
            <p>Search Presenter</p>
            <SearchView />
            <UploadView />
        </div>)
}