import type { MutatorCallback } from "swr";
import type { MutatorOptions } from "swr/_internal";

import { customMutate, customSWR } from "./SWRUtils";
import type { Fetcher, SWRModelEndpointConfig, SWRModelEndpointConfigOverride } from "./types";
import { convertObjectValuesToString, jsonFetcher } from "./utils";

export class SWRModelEndpoint<T> {
    private readonly config: SWRModelEndpointConfig;

    constructor(config: SWRModelEndpointConfig) {
        this.config = config;
    }

    private _configMerge(config?: SWRModelEndpointConfigOverride) {
        return {
            ...this.config,
            ...config,
        };
    }

    public endpoint(config?: SWRModelEndpointConfigOverride): string | null {
        if (Array.isArray(config?.id)) {
            throw new Error("id can be array only in ssr fallback.");
        }
        const c = this._configMerge(config);

        if (c.nonNullId) {
            // Check if id is not null
            if (c.id === null) {
                return null;
            }
        }

        if (c.params && c.nonNullParams) {
            // Check if all params are not null or undefined
            if (Object.values(c.params).some((value) => value === null || value === undefined)) {
                return null;
            }
        }

        const p = new URLSearchParams(convertObjectValuesToString(c.params)).toString();

        const r = `${c.key}${c.id ? `${c.key.endsWith("/") ? "" : "/"}${c.id}` : ""}`;
        return c?.trailingSlash && !r.endsWith("/") ? `${r}/${p ? `?${p}` : ""}` : `${r}${p ? `?${p}` : ""}`;
    }

    public fetch<R = T>(fetcher: Fetcher, config?: SWRModelEndpointConfigOverride) {
        const endpoint = this.endpoint(config);
        if (endpoint === null) {
            return Promise.resolve(null);
        }
        return fetcher<R>(endpoint);
    }

    public async fetchFallback<R = T>(fetcher: Fetcher, config?: SWRModelEndpointConfigOverride) {
        const c = this._configMerge(config);
        const fallbackPairs: { [url: string]: R } = {};
        for (const id of Array.isArray(c?.id) ? c.id : [c?.id]) {
            const key = this.endpoint({ ...c, id });
            if (key !== null) {
                const value = await this.fetch<R>(fetcher, { ...c, id });
                if (value !== null) {
                    fallbackPairs[key] = value;
                }
            }
        }
        return fallbackPairs;
    }

    public mutate<Data = unknown, T = Data>(
        config?: SWRModelEndpointConfigOverride,
        data?: T | Promise<T> | MutatorCallback<T>,
        opts?: boolean | MutatorOptions<Data, T>,
    ) {
        return customMutate(this.endpoint(config), data, opts);
    }

    public async update<T extends object | object[]>(
        data: T | Promise<T> | MutatorCallback<T>,
        onSuccess?: (response: Response) => void,
        config?: SWRModelEndpointConfigOverride,
    ) {
        const c = this._configMerge(config);
        return this.mutate(c, data, {
            optimisticData: data instanceof Function ? undefined : data,
            revalidate: false,
            populateCache: true,
            rollbackOnError: false,
        }).then(() => {
            const key = this.endpoint(c);
            if (key === null) {
                return null;
            }
            jsonFetcher(key, "PUT", data).then((r) => {
                this.mutate(c, data).then(() => {
                    onSuccess?.(r);
                });
            });
        });
    }

    public use<R = T>(config?: SWRModelEndpointConfigOverride) {
        return customSWR<R>(this.endpoint(config), this._configMerge(config).swrConfig);
    }
}
