"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field";
import { Search } from "lucide-react";

interface searchViewProps {
  onSearch: (query: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
}

export default function searchView(props: searchViewProps) {

  function searchACB() {
    props.onSearch(props.query);
  }

  return (
    <div className="flex flex-col">
      <Field orientation="horizontal">
        <Input type="search" placeholder="Search..." value={props.query} onChange={(e) => props.onQueryChange(e.target.value)} />

        <Button size="icon" onClick={searchACB}>
          <Search className="h-4 w-4" />
        </Button>
      </Field>

    </div>
  )
}
