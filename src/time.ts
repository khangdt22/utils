export enum Duration {
    Millisecond = 1,
    Second = 1000,
    Minute = 60_000,
    Hour = 3_600_000,
    Day = 86_400_000,
    Week = 604_800_000,
    Year = 31_536_000_000,
}

export const isDate = (value: unknown): value is Date => value instanceof Date

export const sleep = async (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const timestamp = () => Math.floor(Date.now() / 1000)

export const ms = (value: number, duration: number) => value * duration

export function countdown(date: Date) {
    const diff = date.getTime() - Date.now()

    const days = Math.max(Math.floor(diff / Duration.Day), 0)
    const hours = Math.max(Math.floor((diff % Duration.Day) / Duration.Hour), 0)
    const minutes = Math.max(Math.floor((diff % Duration.Hour) / Duration.Minute), 0)
    const seconds = Math.max(Math.floor((diff % Duration.Minute) / Duration.Second), 0)

    return { days, hours, minutes, seconds }
}
