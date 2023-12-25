export function stripColor(input: string) {
    // eslint-disable-next-line no-control-regex
    return ('' + input).replaceAll(/\u001B\[\d+m/g, '')
}
