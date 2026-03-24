import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Track } from "@/presenters/track-preview-presenter";
import { HeartIcon, X } from "lucide-react";
import Image from "next/image";

interface TrackPreviewViewProps {
    track: Track;
}

export default function TrackPreviewView({ track }: TrackPreviewViewProps) {
    if (!track) {
        return (<Card>
            <CardHeader>
                <CardTitle>Track not found</CardTitle>
            </CardHeader>
        </Card>);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{track.name}</CardTitle>
                <CardDescription>{track.album.name}</CardDescription>
                <CardAction><Button size="icon-lg" variant="ghost"><X /></Button></CardAction>
            </CardHeader>
            <CardContent className="relative aspect-square w-full">
                <p>Card Content</p>
                <Image src={track.album.image} alt={track.album.name} fill className="object-cover" />
            </CardContent>
            <CardFooter className="flex flex-col">
                <div className="w-full flex justify-between">
                    <p>Length</p>
                    <p>{track.length} min</p>
                </div>
                <div className="w-full flex justify-between">
                    <p>Key</p>
                    <p>{track.key}</p>
                </div>
                <div className="w-full flex justify-between">
                    <p>Genre</p>
                    <p>{track.genre}</p>
                </div>
                <div className="w-full flex gap-4">
                    <Button className="flex-grow py-6 mt-4">Download</Button>
                    <Button className="p-6 mt-4" variant={"outline"}><HeartIcon /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}