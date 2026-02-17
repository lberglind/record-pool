import { FileList } from "./components/FileList"
import FileUpload from "./components/FileUpload"

function App() {
    return (
        <div>
            <h1>Record Pool Uploader</h1>
            <FileUpload />
            <FileList />
        </div>
    )
}

export default App
