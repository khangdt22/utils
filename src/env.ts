export const isInMode = (key: string) => process.env.NODE_ENV === key

export const isInDevelopment = () => isInMode('development') || isInMode('dev')

export const isInProduction = () => isInMode('production') || isInMode('prod')

export const isInStaging = () => isInMode('staging') || isInMode('stage')
