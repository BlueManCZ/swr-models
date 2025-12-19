import type { MutatorCallback } from "swr";
import type { MutatorOptions } from "swr/_internal";
import { clientMutate, clientUseSWR, clientUseSWRInfinite } from "./SWRUtils";
import type { Fetcher, SWRModelEndpointConfig, SWRModelEndpointConfigOverride } from "./types";
import { convertObjectValuesToString, getJson, jsonFetcher } from "./utils";

export class SWRModelEndpoint<T extends object> {
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

    public mutate<Data = unknown, R = Data>(
        config?: SWRModelEndpointConfigOverride,
        data?: R | Promise<R> | MutatorCallback<R>,
        opts?: boolean | MutatorOptions<Data, R>,
    ) {
        return clientMutate(this.endpoint(config), data, opts);
    }

    public async update<R extends object | object[]>(
        data: R | Promise<R> | MutatorCallback<R>,
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
        return clientUseSWR<R>(this.endpoint(config), getJson, this._configMerge(config).swrConfig);
    }

    public useInfinite<R extends object = T>(config?: SWRModelEndpointConfigOverride) {
        const c = this._configMerge(config);
        return clientUseSWRInfinite<R>(
            (index, previousPageData) => {
                if (previousPageData && !c.pagination?.hasMore(previousPageData)) return null;
                const params = {
                    ...c.params,
                    ...(c.pagination ? c.pagination.getParams(index, previousPageData) : {}),
                };
                return this.endpoint({ ...c, params });
            },
            getJson,
            this._configMerge(config).swrConfig,
        );
    }
}
