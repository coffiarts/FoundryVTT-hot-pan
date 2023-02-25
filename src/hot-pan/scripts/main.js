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

        ready2play = true;
        Logger.infoGreen(`Ready to play! Version: ${game.modules.get(Config.data.modID).version}`);
        Logger.info(Config.data.modDescription);
        if (Config.setting('isActive')) {
            HotPan.switchOn();
            HotPan.stateChangeUIMessage();
        } else {
            HotPan.switchOff();
        }
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
    socket.register("pushSilentModeToClients", pushSilentModeToClients);
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
 * A socketlib callback for propagating silentMode (=suppress UI message) to the clients
 * @param data - silentMode, username
 * @returns {Promise<void>}
 */
async function pushSilentModeToClients(data) {
    Logger.debug("pushSilentModeToClients from", data.username, "to", game.user.name, data.silentMode);
    HotPan.setSilentMode(data.silentMode);
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
    static switchOn(silentMode = false) {
        this.#switch(true, silentMode);
    }

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

    static switchBack(silentMode = false) {
        this.#switch(this.#previousState, silentMode);
    }

    static toggle(silentMode = false) {
        this.#switch(!this.#isActive, silentMode);
    }

    static isOn() {
        return this.#isActive;
    }

    static isOff() {
        return !this.#isActive;
    }

    static setSilentMode(newValue) {
        this.#isSilentMode = newValue;
        Logger.info(`this.#isSilentMode: ${this.#isSilentMode}`);
    }

    static async #switch(newState, silentMode = false) {
        if (this.#isSilentMode !== silentMode) {
            this.setSilentMode(silentMode);
            // if (game.user.isGM) {
            //     Logger.debug("pushSilentModeToClients from ", game.user.name, "to ALL.", data.silentMode);
            //     socket.executeForOthers("pushSilentModeToClients", { silentMode: silentMode, username: game.user.name });
            // }
        }
        this.#previousState = this.#isActive;
        // propagate change to the game settings, and wait for it to complete
        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        await Config.modifySetting('isActive', newState);
    }

    static onGameSettingChanged() {
        this.#isActive = Config.setting('isActive');
        this.stateChangeUIMessage();
    }

    static stateChangeUIMessage() {
        if (this.#isSilentMode) {
            this.setSilentMode(false);
            return;
        }
        let message =
            (this.#isActive ? Config.localize('onOffUIMessage.whenON') : Config.localize('onOffUIMessage.whenOFF'));

        if (this.#isActive && Config.setting('warnWhenON') ||
            !this.#isActive && Config.setting('warnWhenOFF')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.warn(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.warn(true, message);
        } else {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.info(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.info(message);
        }
    }
}
