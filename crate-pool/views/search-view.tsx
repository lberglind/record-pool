"use client";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field";
import { Search } from "lucide-react";

export default function searchView() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState("")

    function handleSearch() {
        console.log(query)
    }

    return (
        <div className="flex flex-col">
            <Field orientation="horizontal">
                <Input type="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />

                <Button size="icon" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                </Button>
            </Field>

        </div>
    )
}