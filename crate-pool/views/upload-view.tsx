"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react";

export default function UploadView() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState("")

    return (
        <div className="flex flex-col">
            <Dialog>
                <DialogTrigger render={<Button className={"relative h-16 w-16 absolute bottom-5 right-5"}><PlusIcon/></Button>}/>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload track</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            ref={inputRef}
                            className="hidden"
                            accept="audio/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFileName(file.name)
                            }}
                        />
                        <Button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                        >
                            Choose file
                        </Button>
                        {fileName && (
                            <p className="text-sm text-muted-foreground">
                                {fileName}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-start">
                        <DialogClose render={<Button variant="outline">Close</Button>}/>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}