export type Nullable<T> = T | null | undefined

export type ContainsType<T, U> = Extract<T, U> extends never ? false : true
