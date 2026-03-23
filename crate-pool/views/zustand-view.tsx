import { Button } from "@/components/ui/button";
import { ModelState } from "@/stores/model"

interface ZustandViewProps {
    model: ModelState

}

export default function ZustandView({ model }: ZustandViewProps) {
    const { username, email, number, update } = model;

    return(
        <div>
            <h1>Zustand View</h1>
            <p>Username: {username}</p>
            <p>Email: {email}</p>
            <p>Number: {number}</p>
            <Button onClick={() => update(number + 1)}>Increment Number</Button>
        </div>
    )
}