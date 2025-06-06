import type { MutatorCallback } from "swr";
import type { MutatorOptions } from "swr/_internal";

import { customMutate, customSWR } from "./SWRUtils";
import type { SWRModel, SWRModelEndpointConfig, SWRModelEndpointConfigOverride } from "./types";
import { convertObjectValuesToString, jsonFetcher } from "./utils";

export class SWRModelEndpoint {
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

    public endpoint(config?: SWRModelEndpointConfigOverride): string {
        if (Array.isArray(config?.id)) {
            throw new Error("id can be array only in ssr fallback.");
        }
        const c = this._configMerge(config);
        const p = new URLSearchParams(convertObjectValuesToString(c.params)).toString();
        const r = `${c.key}${c.id ? `${c.key.endsWith("/") ? "" : "/"}${c.id}` : ""}`;
        return c?.trailingSlash && !r.endsWith("/") ? `${r}/${p ? `?${p}` : ""}` : `${r}${p ? `?${p}` : ""}`;
    }

    public fetch<T>(config?: SWRModelEndpointConfigOverride) {
        if (this.config.serverFetcher) {
            return this.config.serverFetcher<T>(this.endpoint(config));
        }
        throw new Error("No serverFetcher provided.");
    }

    public async fetchFallback<T>(config?: SWRModelEndpointConfigOverride) {
        const c = this._configMerge(config);
        const fallbackPairs: Record<string, T> = {};
        for (const id of Array.isArray(c?.id) ? c.id : [c?.id]) {
            fallbackPairs[this.endpoint({ ...c, id })] = await this.fetch<T>({ ...c, id });
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

    public async update<T extends SWRModel | SWRModel[]>(
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
        }).then(() =>
            jsonFetcher(this.endpoint(c), "PUT", data).then((r) => {
                this.mutate(c, data).then(() => {
                    onSuccess?.(r);
                });
            }),
        );
    }

    public use<T>(config?: SWRModelEndpointConfigOverride) {
        return customSWR<T>(this.endpoint(config), this._configMerge(config).swrConfig);
    }
}
