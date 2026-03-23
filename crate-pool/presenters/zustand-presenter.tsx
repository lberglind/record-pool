"use client"

import { useModelStore } from "@/stores/model";
import ZustandView from "@/views/zustand-view";

export default function ZustandPresenter() {
    const model = useModelStore();

    return (
        <ZustandView model={model} />
    )
}