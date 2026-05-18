import { Button } from "@/components/ui/button";
import { SliderRange } from "@/components/dual-range-slider";
import { QueryParams } from "@/models/types";

interface FilterViewProps {
    clearFilters: () => void;
    query: QueryParams;
    releaseValue: [number, number];
    durationValue: [number, number];
    bpmValue: [number, number];
    onReleaseChange: (v: [number, number]) => void;
    onDurationChange: (v: [number, number]) => void;
    onBPMChange: (v: [number, number]) => void;
    onGenreChange: (genre: string) => void;
}

export default function FilterView({ clearFilters, query, releaseValue, durationValue, bpmValue, onReleaseChange, onDurationChange, onBPMChange, onGenreChange }: FilterViewProps) {
    return (
        <div className="w-full border-b bg-background/50 backdrop-blur px-4 py-3 sm:py-4">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* <SliderRange
                        value={releaseValue}
                        min={1900}
                        max={2026}
                        step={1}
                        onChange={onReleaseChange}
                        text="Release Year"
                        className="mt-2"
                    /> */}

                    <SliderRange
                        value={durationValue}
                        min={0}
                        max={300}
                        step={1}
                        onChange={onDurationChange}
                        text="Duration"
                        className="mt-2"
                    />

                    <SliderRange
                        value={bpmValue}
                        min={0}
                        max={200}
                        step={5}
                        onChange={onBPMChange}
                        text="BPM"
                        className="mt-2"
                    />

                    {/* Genre Filter */}
                    <div>
                        <label className="text-sm font-medium">Genre</label>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            <Button variant={query.genre === "pop" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("pop")}>
                                Pop
                            </Button>
                            <Button variant={query.genre === "rap" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("rap")}>
                                Rap
                            </Button>
                            <Button variant={query.genre === "dance" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("dance")}>
                                Dance
                            </Button>
                            <Button variant={query.genre === "edm" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("edm")}>
                                EDM
                            </Button>
                            <Button variant={query.genre === "rock" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("rock")}>
                                Rock
                            </Button>
                            <Button variant={query.genre === "house" ? "default" : "outline"} size="sm" className="w-full text-xs sm:w-auto" onClick={() => onGenreChange("house")}>
                                House
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={clearFilters}>
                        Reset Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}