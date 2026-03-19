"use client";
import { getDate } from "@/utils/util";
import { useState } from "react";

export default function searchView() {
    const [number, setNumber] = useState(0);
    
    return (
        <div className="flex flex-col">
            <p>Search View</p>
            {getDate()}
            <button onClick={() => setNumber(number + 1)}>Increment</button>
            <p>{number}</p>
        </div>
        )
}