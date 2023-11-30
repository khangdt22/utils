export function resolveNestedOptions<T>(options: T | true): T {
    if (options === true) {
        return {} as T
    }

    return options
}
