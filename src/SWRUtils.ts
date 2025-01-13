"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate, SWRConfig } from "swr";

import type { SWRModelEndpoint } from "./SWRModelEndpoint";
import type { SWRModel, SWRModelEndpointConfigOverride } from "./types";
import { getJson } from "./utils";

export function customSWR<T>(endpoint: string) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR<T>(endpoint, getJson, { revalidateOnFocus: false });
}

export const customMutate = mutate;
export const CustomSWRConfig = SWRConfig;

export function useModel<T extends SWRModel | SWRModel[]>(
    modelInstance: SWRModelEndpoint,
    config?: SWRModelEndpointConfigOverride,
) {
    const { data: original } = modelInstance.use<T>(config);
    const [model, set] = useState<T | undefined>(original);
    const [refreshLock, setRefreshLock] = useState(false);
    const [commitLock, setCommitLock] = useState(true);

    useEffect(() => {
        if (!refreshLock) {
            set(original);
        }
    }, [refreshLock, original]);

    useEffect(() => {
        if (!commitLock && model) {
            modelInstance.update(model, undefined, config);
            setCommitLock(true);
        }
    }, [commitLock, config, model, modelInstance]);

    function reset() {
        set(original);
    }

    function commit() {
        setCommitLock(false);
    }

    function lock() {
        setRefreshLock(true);
    }

    function unlock() {
        setRefreshLock(false);
    }

    return { original, model, set, reset, commit, lock, unlock };
}
