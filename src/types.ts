export type SWRModelEndpointConfig = {
    key: string;
    id?: number | string | number[] | string[];
    params?: Record<string, string>;
    serverFetcher?: <T>(url: string) => Promise<T>;
};

export type SWRModelEndpointConfigOverride = Omit<SWRModelEndpointConfig, "key">;

export type SWRModel = {
    id: number;
};
