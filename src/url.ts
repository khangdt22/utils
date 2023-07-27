export const isValidUrl = (url: string, protocols?: string[]) => {
    try {
        const { protocol } = new URL(url)

        if (protocols) {
            return protocols.map((x) => `${x.toLowerCase()}:`).includes(protocol)
        }

        return true
    } catch {
        return false
    }
}

export const isWebSocketUrl = (url: string) => {
    return isValidUrl(url, ['ws', 'wss'])
}

export const isHttpUrl = (url: string) => {
    return isValidUrl(url, ['http', 'https'])
}
