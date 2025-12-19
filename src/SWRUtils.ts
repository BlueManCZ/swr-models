"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import type { SWRModelEndpoint } from "./SWRModelEndpoint";
import type { SWRModelEndpointConfigOverride } from "./types";

export const clientUseSWR = useSWR;
export const clientMutate = mutate;
export const clientUseSWRInfinite = useSWRInfinite;

export function useModel<T extends object>(
    modelInstance: SWRModelEndpoint<T>,
    config?: SWRModelEndpointConfigOverride,
) {
    const { data: original } = modelInstance.use(config);
    const [model, set] = useState(original);
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
