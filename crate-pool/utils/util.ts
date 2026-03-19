export function getDate() {
    const date = new Date();
    return date.toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}