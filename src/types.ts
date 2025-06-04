import type { SWRConfiguration } from "swr";

export type SWRModelEndpointConfig = {
    key: string;
    id?: number | string | number[] | string[];
    params?: Record<string, string | number | boolean>;
    serverFetcher?: <T>(url: string) => Promise<T>;
    trailingSlash?: boolean;
    swrConfig?: SWRConfiguration;
};

export type SWRModelEndpointConfigOverride = Omit<SWRModelEndpointConfig, "key">;

export type SWRModel = {
    id: number;
};
