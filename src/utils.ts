/** Fetch wrapper that sends and returns JSON. */
export const jsonFetcher = (
    key: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    payload?: object,
) =>
    fetch(key, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

/** Helper function getting JSON from a URL. */
export const getJson = (key: string) => jsonFetcher(key).then((response) => response.json());

/** Factory function for creating a JSON fetcher. This can be used to create a fetcher with a specific protocol, host and port. */
export const jsonFetcherFactory =
    (
        protocol: string,
        host: string,
        port: string,
        cache: "force-cache" | "no-cache" = "no-cache",
        revalidate = 0,
    ) =>
    async <T>(endpoint: string): Promise<T> => {
        const url = `${protocol}://${host}:${port}/${endpoint}`;
        const response = await fetch(url, {
            cache,
            // @ts-expect-error This is expected to raise a type error in non-next.js projects.
            next: { revalidate },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`);
        }
        return response.json();
    };

/** Helper function converting object values to strings. */
export const convertObjectValuesToString = (obj?: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(obj ?? {})
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => [key, String(value)]),
    );
