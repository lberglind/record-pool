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

interface uploadViewProps {
  track: File | null;
  xml: File | null;
  onTrackFileChange: (f: File | null) => void;
  onXmlFileChange: (f: File | null) => void;
  onTrackUpload: (f: File | null) => void;
  onXmlUpload: (f: File | null) => void;
}

export default function UploadView(props: uploadViewProps) {
  const trackInputRef = useRef<HTMLInputElement>(null)
  const xmlInputRef = useRef<HTMLInputElement>(null)
  const [trackFileName, setTrackFileName] = useState("")
  const [xmlFileName, setXmlFileName] = useState("")

  function clearUpload() {
    if (trackInputRef.current) trackInputRef.current.value = "";
    if (xmlInputRef.current) xmlInputRef.current.value = "";

    setTrackFileName("")
    setXmlFileName("")
    props.onTrackFileChange(null)
    props.onXmlFileChange(null)
  }

  return (
    <div className="flex flex-col">
      <Dialog onOpenChange={(open) => {
        if (!open) {
          clearUpload();
        }
      }}>
        <DialogTrigger render={<Button className={"relative h-16 w-16 absolute bottom-5 right-5"}><PlusIcon /></Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload tracks or XML</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={trackInputRef}
              className="hidden"
              accept="audio/*, .mp3, .wav, .m4a"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setTrackFileName(file.name);
                  props.onTrackFileChange(file)
                }
              }}
            />
            <Button
              type="button"
              onClick={() => trackInputRef.current?.click()}
            >
              Choose track
            </Button>
            {trackFileName && (
              <p className="text-sm text-muted-foreground">
                {trackFileName}
              </p>
            )}
            <input
              type="file"
              ref={xmlInputRef}
              className="hidden"
              accept="application/xml"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setXmlFileName(file.name);
                  props.onXmlFileChange(file);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => xmlInputRef.current?.click()}
            >
              Choose XML
            </Button>
            {xmlFileName && (
              <p className="text-sm text-muted-foreground">
                {xmlFileName}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <DialogClose render={<Button variant="outline">Close</Button>} />
            <DialogClose render={<Button variant="default" disabled={!props.xml && !props.track}>Upload</Button>} onClick={() => {
              props.xml && props.onXmlUpload(props.xml);
              props.track && props.onTrackUpload(props.track);
            }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div >
  )
}
