import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export const CallbackView = () => {
  return (
    <div className="w-full min-h-dvh flex items-center justify-center">
      <div>
      <Item>
        <ItemMedia variant="icon">
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Finalizing your session...</ItemTitle>
          <ItemDescription>You will soon be redirected.</ItemDescription>
        </ItemContent>
      </Item>
      </div>
    </div>
  )
}
