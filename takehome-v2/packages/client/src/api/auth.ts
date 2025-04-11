import { queryOptions, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { queryClient } from '../query'
import { serverOrigin } from '.'

async function login(input: { username: string; password: string }) {
    const response = await fetch(`${serverOrigin}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(input)
    })

    if (!response.ok) {
        throw new Error(`Login failed with status ${response.status} ${response.statusText}`)
    }

    const user = z
        .object({
            username: z.string()
        })
        .parse(await response.json())

    return user
}
function useLogin(opts?: { key?: unknown[] }) {
    return useMutation({
        mutationKey: ['auth.login', ...(opts?.key ?? [])],
        mutationFn: login,
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ['auth.whoami'] })
        },
        onError(error) {
            console.error(error)
        }
    })
}

async function logout() {
    const response = await fetch(`${serverOrigin}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status} ${response.statusText}`)
    }
}
function useLogout(opts?: { key?: unknown[] }) {
    return useMutation({
        mutationKey: ['auth.logout', ...(opts?.key ?? [])],
        mutationFn: logout,
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ['auth.whoami'] })
        },
        onError(error) {
            console.error(error)
        }
    })
}

async function whoami() {
    const response = await fetch(`${serverOrigin}/auth/whoami`, {
        credentials: 'include'
    })

    if (response.status === 401) {
        return {
            status: 'unauthenticated'
        } as const
    }

    if (!response.ok) {
        throw new Error(`Auth status check failed with status ${response.status} ${response.statusText}`)
    }

    const body = z
        .object({
            username: z.string()
        })
        .parse(await response.json())

    return {
        status: 'authenticated',
        username: body.username
    } as const
}
function whoamiQueryOptions() {
    return queryOptions({
        queryKey: ['auth.whoami'],
        queryFn: whoami
    })
}

export const authApi = {
    useLogin,
    useLogout,
    whoamiQueryOptions,
    raw: {
        login,
        logout,
        whoami
    }
}
