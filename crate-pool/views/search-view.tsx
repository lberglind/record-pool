"use client";
import { getDate } from "@//utils/util";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function searchView() {
    const [number, setNumber] = useState(0);
    
    return (
        <div className="flex flex-col">
            <p>Search View</p>
            {getDate()}
            <Button variant={"destructive"} onClick={() => setNumber(number + 1)}>Increment</Button>
            <p>{number}</p>
        </div>
        )
}