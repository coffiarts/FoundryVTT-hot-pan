import {Logger} from './logger.js';
import {Config} from './config.js'
import {ChatInfo} from "./chatinfo.js";

const SUBMODULES = {
    MODULE: Config,
    logger: Logger,
    chatinfo: ChatInfo
};

let ready2play;
let socket;

/**
 * Global initializer block:
 * First of all, we need to initialize a lot of stuff in correct order:
 */
(async () => {
        console.log("Hot Pan & Zoom! | Initializing Module");

        await allPrerequisitesReady();

        Hooks.once("ready", () =>  {
            ready2play = true;
            Logger.infoGreen(`Ready to play! Version: ${game.modules.get(Config.data.modID).version}`);
            Logger.info(Config.data.modDescription);
            if (Config.setting('isActive')) {
                HotPan.switchOn();
                HotPan.stateChangeUIMessage();
            } else {
                HotPan.switchOff();
            }
        });
    }
)
();

async function allPrerequisitesReady() {
    return Promise.all([
        areDependenciesReady(),
        isSocketlibReady(),
        areCanvasListenersReady()
    ]);
}

async function areDependenciesReady() {
    return new Promise(resolve => {
        Hooks.once('setup', () => {
            resolve(initDependencies());
            resolve(initExposedClasses());
        });
    });
}

async function isSocketlibReady() {
    return new Promise(resolve => {
        Hooks.once('socketlib.ready', () => {
            resolve(initSocketlib());
        });
    });
}

async function areCanvasListenersReady() {
    return new Promise(resolve => {
        Hooks.once('canvasReady', () => {
            resolve(initCanvasListeners());
        });
    });
}

async function initDependencies() {
    Object.values(SUBMODULES).forEach(function (cl) {
        cl.init(); // includes loading each module's settings
        Logger.debug("Submodule loaded:", cl.name);
    });
}

async function initExposedClasses() {
    window.HotPan = HotPan;
    Hooks.on("updateSetting", async function (setting) {
        if (setting.key.startsWith(Config.data.modID)) {
            HotPan.onGameSettingChanged();
        }
    });
    Logger.debug("Exposed classes are ready");
}

async function initSocketlib() {
    socket = socketlib.registerModule(Config.data.modID);
    socket.register("pushCanvasPositionToClients", pushCanvasPositionToClients);
    socket.register("stateChangeUIMessage", HotPan.stateChangeUIMessage);
    Logger.debug(`Module ${Config.data.modID} registered in socketlib.`);
}

async function initCanvasListeners() {
    Hooks.on("canvasPan", async function (canvas, position) {
        if (!game.user.isGM) return; // Only the GM shall be allowed to force canvas position on others!
        if (!Config.setting('isActive')) return;
        socket.executeForOthers("pushCanvasPositionToClients", {position: position, username: game.user.name});
    });
    Logger.debug("Canvas is ready (listeners registered)");
}

/**
 * And then, finally...
 * HERE is our core function doing all the work while in game!
 * Nice and nifty...
 * @param data
 * @returns {Promise<void>}
 */
async function pushCanvasPositionToClients(data) {
    Logger.debug("pushCanvasPositionToClients from", data.username, "to", game.user.name, "canvasPosition", data.position);
    canvas.animatePan(data.position);
}

/**
 * Public class for accessing this module through macro code
 */
export class HotPan {
    static #isActive = false;
    static #previousState;
    static #isSilentMode;

    static healthCheck() {
        alert(`Module '${Config.data.modTitle}' says: '${ready2play ? `I am alive!` : `I am NOT ready - something went wrong:(`}'` );
    }

    /**
     * 
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     */
    static switchOn(silentMode = false) {
        this.#switch(true, silentMode);
    }

    /**
     * 
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     */
    static switchOff(silentMode = false) {
        this.#switch(false, silentMode);
    }

    /**
     * @deprecated - Parameter restoreStateBefore is deprecated. Please use switchBack() for restoring previous state.
     */
    static switchOff(restoreStateBefore = false) {
        this.#switch(
            restoreStateBefore ? this.#previousState : false);
    }

    /**
     * 
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     */
    static switchBack(silentMode = false) {
        this.#switch(this.#previousState, silentMode);
    }

    /**
     * 
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     */
    static toggle(silentMode = false) {
        this.#switch(!this.#isActive, silentMode);
    }

    static isOn() {
        return this.#isActive;
    }

    static isOff() {
        return !this.#isActive;
    }

    /**
     * 
     * @param newState
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     * @returns {Promise<void>}
     */
    static async #switch(newState, silentMode = false) {
        this.#isSilentMode = silentMode;
        this.#previousState = this.#isActive;
        // propagate change to the game settings, and wait for it to complete
        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        await Config.modifySetting('isActive', newState);
    }

    static onGameSettingChanged() {
        this.#isActive = Config.setting('isActive');

        if (game.user.isGM && Config.setting('notifyOnChange')) {
            // UI messages should only be triggered by the GM via sockets.
            // This seems to be the only way to suppress them if needed.
            if (!this.#isSilentMode) {
                socket.executeForEveryone("stateChangeUIMessage");
            } else {
                this.#isSilentMode = false;
            }
        }
    }

    static stateChangeUIMessage() {
        let message =
            (HotPan.#isActive ? Config.localize('onOffUIMessage.whenON') : Config.localize('onOffUIMessage.whenOFF'));

        if (HotPan.#isActive && Config.setting('warnWhenON') ||
            !HotPan.#isActive && Config.setting('warnWhenOFF')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.warn(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.warn(true, message);
        } else {
            ui.notifications.info(Config.data.modTitle + " " + message, {
                permanent: false,
                localize: false,
                console: false
            });
            Logger.info(message);
        }
    }
}
