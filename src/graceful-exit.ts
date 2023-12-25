export type ExitHandler = (exitCode?: number) => Promise<void>

const exitTasks = new Set<[handler: ExitHandler, maxWaitTime: number]>()

export function addExitHandler(handler: ExitHandler, maxWaitTime = 3000) {
    exitTasks.add([handler, maxWaitTime])

    return () => {
        exitTasks.delete([handler, maxWaitTime])
    }
}

let _isExiting = false

export function isExiting() {
    return _isExiting
}

export function gracefulExit(exitCode = 0, maxWaitTime = 3000) {
    if (isExiting()) {
        return
    }

    _isExiting = true

    function done() {
        _isExiting = false
        process.exit(exitCode)
    }

    if (exitTasks.size === 0) {
        return done()
    }

    const promises: Array<Promise<void>> = []

    for (const [handler, wait] of exitTasks) {
        promises.push(handler(exitCode))
        maxWaitTime = Math.max(maxWaitTime, wait)
    }

    const timeout = setTimeout(done, maxWaitTime)

    Promise.all(promises).finally(() => {
        clearTimeout(timeout)
        done()
    })
}
