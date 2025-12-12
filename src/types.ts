import type { SWRConfiguration } from "swr";

export type Fetcher = <T>(url: string) => Promise<T>;

export type SWRModelEndpointConfig = {
    key: string;
    id?: number | string | number[] | string[] | null;
    nonNullId?: boolean;
    params?: Record<string, string | number | boolean | null>;
    nonNullParams?: boolean;
    trailingSlash?: boolean;
    swrConfig?: SWRConfiguration;
};

export type SWRModelEndpointConfigOverride = Omit<SWRModelEndpointConfig, "key">;
