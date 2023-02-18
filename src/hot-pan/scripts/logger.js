import { Config } from './config.js'

export class Logger {

    static init(){
        // Here is the space for registering any game settings relevant for this very component (i.e. Logger)
        const settingsData = {
            debug : {
                scope: "client", config: true, type: Boolean, default: false,
            },
        };
        Config.registerSettings(settingsData);
    }
    static info(...args) {
        console.log(`${Config?.data?.modTitle ?? "" }  | `, ...args);
    }
    static debug(...args) {
        // During initialization, Config settings might not yet be present.
        // We can't rely on them here, so we need a fallback.
        let isDebugMode = false;
        try {
            isDebugMode = Config.setting('debug');
        } catch {}
        if (isDebugMode)
            console.debug(`${Config?.data?.modTitle ?? "" }  | DEBUG | `, ...args);
    }

    static warn(...args) {
        console.warn(`${Config?.data?.modTitle ?? "" } | WARNING | `, ...args);
        ui.notifications.warn(`${Config?.data?.modTitle ?? "" } | WARNING | ${args[0]}`);
    }

    static error(...args) {
        console.error(`${Config?.data?.modTitle ?? "" } | ERROR | `, ...args);
        ui.notifications.error(`${Config?.data?.modTitle ?? "" } | ERROR | ${args[0]}`);
    }

    static catchThrow(thrown, toastMsg = undefined) {
        console.warn(thrown);
        if(toastMsg) Logger.error(toastMsg);
    }
}
