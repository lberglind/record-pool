"use client"
import SearchPresenter from "./search-presenter";
import { useTrackStore } from "@/models/useTrackStore";
import { useLikeStore } from "@/models/useLikeStore";
import { useQueryParams } from "@/hooks/use-query-params";

export default function MainPresenter() {
  const trackModel = useTrackStore();
  const likeModel = useLikeStore();

  const { query } = useQueryParams();


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <SearchPresenter trackModel={trackModel} likeModel={likeModel} queryParams={query} />
      </main>
    </div>
  )
}
