import type { SWRConfiguration } from "swr";

export type Fetcher = <T>(url: string) => Promise<T>;

export type SWRModelEndpointConfig<T> = {
    key: string;
    id?: number | string | number[] | string[] | null;
    nonNullId?: boolean;
    params?: Record<string, string | number | boolean | null>;
    nonNullParams?: boolean;
    trailingSlash?: boolean;
    swrConfig?: SWRConfiguration;
    pagination?: {
        hasMore: (previousData: T) => boolean;
        getParams: (
            index: number,
            previousData: T | null,
        ) => Record<string, string | number | boolean | null>;
    };
};

export type SWRModelEndpointConfigOverride<T> = Omit<SWRModelEndpointConfig<T>, "key">;
