import type { SWRConfiguration } from "swr";

export type SWRModelEndpointConfig = {
    key: string;
    id?: number | string | number[] | string[] | null;
    nonNullId?: boolean;
    params?: Record<string, string | number | boolean | null>;
    nonNullParams?: boolean;
    serverFetcher?: <T>(url: string | null) => Promise<T | null>;
    trailingSlash?: boolean;
    swrConfig?: SWRConfiguration;
};

export type SWRModelEndpointConfigOverride = Omit<SWRModelEndpointConfig, "key">;

export type SWRModel = {
    id: number;
};
