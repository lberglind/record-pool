"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field";
import { Search } from "lucide-react";
import { QueryParams } from "@/models/types";
import { useEffect, useState } from "react";

interface searchViewProps {
  onSearch: (value: string) => void;
  query: QueryParams;
}

export default function searchView(props: searchViewProps) {
  const [tempTitle, setTempTitle] = useState(props.query.title || "");

  useEffect(() => {
    setTempTitle(props.query.title || "");
  }, [props.query.title]);

  function searchACB() {
    props.onSearch(tempTitle);
  }

  return (
    <div className="flex flex-col">
      <Field orientation="horizontal">
        <Input
          type="search"
          placeholder="Search..."
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchACB();
            }
          }}
        />

        <Button size="icon" onClick={searchACB}>
          <Search className="h-4 w-4" />
        </Button>
      </Field>

    </div>
  )
}
