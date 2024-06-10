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
let lockViewStatus;

/**
 * Global initializer block:
 * First of all, we need to initialize a lot of stuff in correct order:
 */
(async () => {
        console.log("Hot Pan & Zoom! | Initializing Module");

        await allPrerequisitesReady();

        Hooks.once("ready", () => {
            ready2play = true;
            Logger.infoGreen(`Ready to play! Version: ${game.modules.get(Config.data.modID).version}`);
            Logger.infoGreen(Config.data.modDescription);
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
        isSocketlibReady(),
        areDependenciesReady(),
        areListenersReady()
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

async function areListenersReady() {
    return new Promise(resolve => {
        Hooks.once('canvasReady', () => {
            initAutoFocusListeners();
            resolve(initCanvasListener());
        });
    });
}

async function initDependencies() {
    Object.values(SUBMODULES).forEach(function (cl) {
        cl.init(); // includes loading each module's settings
        Logger.debug("(initDependencies) Submodule loaded:", cl.name);
    });
}

async function initExposedClasses() {
    window.HotPan = HotPan;
    Logger.debug("(initExposedClasses) Exposed classes are ready");
}

async function initSocketlib() {
    socket = socketlib.registerModule(Config.data.modID);
    socket.register("pushCanvasPositionToClients", pushCanvasPositionToClients);
    socket.register("stateChangeUIMessage", HotPan.stateChangeUIMessage);
    socket.register("afStateChangeUIMessage", HotPan.afStateChangeUIMessage);
    Logger.debug(`(initSocketlib) Module ${Config.data.modID} registered in socketlib.`);
}

async function initCanvasListener() {
    Hooks.on("canvasPan", async function (canvas, position) {
        if (!game.user.isGM) return; // Only the GM shall be allowed to force canvas position on others!
        if (!Config.setting('isActive')) return;
        socket.executeForOthers("pushCanvasPositionToClients", {sceneId: game.scenes.current.id, position: position, username: game.user.name});
    });
    Logger.debug("(initCanvasListener) Canvas is ready (listeners registered)");
}

async function initAutoFocusListeners() {
    Hooks.on('updateToken', async (token) => {
        await autoFocus(token)
    });
    game.socket.on(`module.${Config.data.modID}`, (data) => afGMControl(data));
    Logger.debug("(initAutoFocusListeners) Always Centred is ready (listeners registered)");
}

/**
 * And then, finally...
 * HERE is one of our two core functions doing all the work while in game!
 * Nice and nifty...
 * @param data
 * @returns {Promise<void>}
 */
async function pushCanvasPositionToClients(data) {
    Logger.debug(`(pushCanvasPositionToClients) for scene '${game.scenes.get(data.sceneId).name}' (${data.sceneId}) from ${data.username} to ${game.user.name}, canvasPosition:`, data.position);
    if (game.scenes.current.id === data.sceneId) {
        canvas.animatePan(data.position);
    }
}

/**
 * And a second one, which found its way here with the integration of SDoehren's famous 'Always Centred' mod...
 * @param token the token to focus and zoom onto
 * @returns {Promise<void>}
 */
async function autoFocus(token) {
    Logger.debug(`(autoFocus), token:`, token);
    if (Config.setting('afMode') === "disabled") {
        return false;
    }
    let boundingBox = afGetBoundingBox(token);

    if (boundingBox === undefined) {
        return;
    }

    let zoom = afCalculateZoom(boundingBox);

    let panSpeed;

    if (game.user.isGM) {
        Logger.debug("boundingBox emitted");
        game.socket.emit(`module.${Config.data.modID}`, {
            boundingBox: boundingBox,
            zoom: zoom,
            panSpeed: panSpeed,
            mode: Config.setting('afMode'),
            token: token
        });
    }

    await afPanAndZoom(boundingBox, panSpeed,zoom)
}

function afGetBoundingBox(token){
    let boundingBox;
    let tokens;
    if (Config.setting('afMode') === "selectedToken") {
        //get list of controlled tokens ids; if not selected by player exit early
        let controlledIds = canvas.tokens.controlled.map(c => c.id);
        if (!(controlledIds.includes(token.id))) {return;}

        tokens = canvas.tokens.controlled

    } else if (Config.setting('afMode') === "partyView") {

        //if token not owned by player exit early
        let allChars = canvas.tokens.placeables.filter(c => c.actor !== null);
        let pcs = allChars.filter(c => c.actor.hasPlayerOwner);
        let pcIds = pcs.map(c => c.actor.id);


        if (!(pcIds.includes(token.actor.id))) {return;}

        tokens = canvas.tokens.placeables.filter(c => c.actor !== null);
        if (!(Config.setting('afIncludeInvisible'))){
            tokens = tokens.filter(x=>x.worldVisible);
        }
        tokens = tokens.filter(c => c.actor.hasPlayerOwner);

        Logger.debug('boundingBox', boundingBox)
    }

    let leftBox = tokens.map(c => c.bounds.left)
    leftBox = Math.min(...leftBox)

    let topBox = tokens.map(c => c.bounds.top)
    topBox = Math.min(...topBox)

    let rightBox = tokens.map(c => c.bounds.right)
    rightBox = Math.max(...rightBox)

    let bottomBox = tokens.map(c => c.bounds.bottom)
    bottomBox = Math.max(...bottomBox)

    let topLeft = {x:leftBox,y:topBox};
    let bottomRight = {x:rightBox,y:bottomBox};

    boundingBox = {
        topleft: topLeft,
        bottomright: bottomRight,
    };

    return boundingBox
}

function afCalculateZoom(boundingBox) {
    //get the view port; minus 298 to account for the sidebar

    let sideBar = document.getElementById('sidebar');
    let sideBarWidth = sideBar.offsetWidth;
    let visW = window.innerWidth - sideBarWidth;
    let visH = window.innerHeight;

    // set default zoom to the current zoom level
    let zoom = canvas.stage.scale.x;

    let nonFit = false;

    if (!(Config.setting('afAutoZoom')) && Config.setting('afMitigateBounce')) {
        let bareMinimumX = (window.innerWidth - document.getElementById('sidebar').offsetWidth) / ((boundingBox.bottomright.x - boundingBox.topleft.x) + canvas.grid.sizeX * 2.5);
        let bareMinimumY = window.innerHeight / ((boundingBox.bottomright.y - boundingBox.topleft.y) + canvas.grid.sizeY * 2.5);
        if ((canvas.stage.scale.x > bareMinimumX) || (canvas.stage.scale.x > bareMinimumY)) {
            ui.notifications.info("Always Centred | Tokens do not fit - auto zooming");
            nonFit = true;
        }
    }

    if (Config.setting('afAutoZoom') || (nonFit && Config.setting('afMitigateBounce'))) {
        //get box width
        let boxWidth = (boundingBox.bottomright.x - boundingBox.topleft.x);
        //add square padding to box width
        let boxWidthPerPadded = boxWidth * (1 + Config.setting('afPaddingPer') / 100);
        //add percentage padding to box width
        let boxwidthpadded = (boxWidth + canvas.grid.sizeX * Config.setting('afPaddingSq') * 2);
        //calculate the zoom based on the box+padding widths and the view port area
        let zoomWperpadded = visW / boxWidthPerPadded;
        let zoomWpadded = visW / boxwidthpadded;

        //repeat the above but for the height
        let boxHeight = (boundingBox.bottomright.y - boundingBox.topleft.y);
        let boxHeightPerPadded = boxHeight * (1 + Config.setting('afPaddingPer',) / 100);
        let boxHeightPadded = (boxHeight + canvas.grid.sizeX * Config.setting('afPaddingSq',) * 2);
        let zoomHPerPadded = visH / boxHeightPerPadded;
        let zoomHPadded = visH / boxHeightPadded;

        //this pad prevents nudging of the screen
        let boxWidthForcedPadded = (boxWidth + canvas.grid.sizeX * 2 + 150 / zoom);
        let boxHeightForcedPadded = (boxHeight + canvas.grid.sizeY * 2 + 150 / zoom);

        if (nonFit && Config.setting('afMitigateBounce')) {
            boxWidthForcedPadded = (boxWidth + canvas.grid.sizeX * 5);
            boxHeightForcedPadded = (boxHeight + canvas.grid.sizeY * 5);
        }

        let zoomWForcedPadded = visW / boxWidthForcedPadded;
        let zoomHForcedPadded = visH / boxHeightForcedPadded;

        //find the smallest (farthest away) of the zooms
        //if all the zooms are closer than the minimum, set to minimum
        let mZoom = Config.setting('afMaxZoom');
        if (mZoom < 0.1) {
            mZoom = 0.1
        }
        let zoomOpts = [zoomWForcedPadded, zoomHForcedPadded, zoomWperpadded, zoomWpadded, zoomHPerPadded, zoomHPadded, mZoom];
        zoom = Math.min.apply(Math, zoomOpts);
    }
    return zoom;
}

async function afPanAndZoom(boundingBox, panSpeed, zoom){

    Logger.debug('(afPanAndZoom)', 'boundingBox', boundingBox, 'panSpeed', panSpeed, 'zoom', zoom);

    //get the view port; minus 298 to account for the sidebar
    let sideBar = document.getElementById('sidebar');
    let sideBarWidth = sideBar.offsetWidth;

    //calculate centre of the bounding box
    //calculate the zoom required to see all play controlled tokens
    let xMid = (boundingBox.topleft.x+boundingBox.bottomright.x)/2;
    let yMid = (boundingBox.topleft.y+boundingBox.bottomright.y)/2;


    //the maths assumes the sidebar is half on the left and half on the right, this corrects for that.
    let xMidSideBarAdjust = xMid+(sideBarWidth/zoom)/2;

    //move camera

    if (zoom===undefined) {
        // set default zoom to the current zoom level
        zoom = canvas.stage.scale.x;
    }

    if (panSpeed===undefined) {
        canvas.animatePan({
            x: xMidSideBarAdjust,
            y: yMid,
            scale: zoom,
            duration: Config.setting('afUpdateSpeed')
        });
        Logger.debug('panSpeed===undefined x: ' + xMidSideBarAdjust + '| y :' + yMid + '| zoom: ' + zoom + ' | speed: '+Config.setting('afUpdateSpeed'));

    } else {
        canvas.animatePan({
            x: xMidSideBarAdjust,
            y: yMid,
            scale: zoom,
            duration: panSpeed
        });
        Logger.debug('panSpeed!==undefined x: ' + xMidSideBarAdjust + ' | y: ' + yMid + '| zoom: ' + zoom + ' | speed: '+panSpeed);
    }
    //Pings src for debug only (https://gitlab.com/foundry-azzurite/pings/-/blob/master/README.md)
    //window.Azzu.Pings.perform({x:xMid ,y:yMid})
}

function afGMControl(data){
    Logger.debug('(afGMControl)', 'data', data);

    if ('infonote' in data){
        ui.notifications.info(data.infonote);
    }

    if ('boundingBox' in data){
        let allChars = canvas.tokens.placeables.filter(c => c.actor !== null);

        let visIds;
        if (!(Config.setting('afIncludeinvisible'))){
            let visChars = allChars.filter(x=>x.worldVisible);
            visIds = visChars.map(c => c.id);
        } else {
            visIds = allChars.map(c => c.id);
        }


        if (visIds.includes(data.token._id)) {
            afPanAndZoom(data.boundingBox, data.panSpeed, data.zoom)
        } else {
            autoFocus(data.token,true)
        }
    }

}



/**
 * Public class for accessing this module through macro code
 */
export class HotPan {
    static #isActive = false;
    static #previousState;
    static #isSilentMode;

    static #afMode;
    static #previousAfMode;

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
        this.#switch(!Config.setting('isActive'), silentMode);
    }

    static isOn() {
        return this.#isActive;
    }

    static isOff() {
        return !this.#isActive;
    }

    /**
     * 
     * @param newStateIsON
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     * @returns {Promise<void>}
     */
    static async #switch(newStateIsON, silentMode = false) {

        // first of all, handle lockView, if this 3rd-party module is present (see https://github.com/MaterialFoundry/LockView)
        if (game.modules.get("LockView")?.active) {
            if (newStateIsON) {
                // when switching HotPan ON, remember LockView's current state, then disable it
                lockViewStatus = {
                    panLock: canvas.scene.getFlag('LockView', 'lockPan'),
                    zoomLock: canvas.scene.getFlag('LockView', 'lockZoom')
                };
                await Hooks.call('setLockView', {
                    "panLock": false,
                    "zoomLock": false
                });
                Logger.debug("(HotPan.#switch) Grabbing current LockView state: ", lockViewStatus);
            } else { // switching OFF
                // otherwise (when switching OFF), restore LockView's previous state (given that it's known)
                if (lockViewStatus) {
                    Logger.debug("(HotPan.#switch) Restoring previous LockView state: ", lockViewStatus);
                    await Hooks.call('setLockView', {
                        "panLock": lockViewStatus.panLock,
                        "zoomLock": lockViewStatus.zoomLock
                    });
                    // if LockView has been active before, we automatically switch to silent mode, preventing that
                    // the clients receive a misleading message stating that canvas control has been released (because
                    // this isn't the case, as it is still locked by LockView)
                    silentMode = (lockViewStatus.panLock || lockViewStatus.zoomLock);
                    lockViewStatus = null;
                }
            }
        }
        this.#isSilentMode = silentMode;
        this.#previousState = this.#isActive;
        // propagate change to the game settings, and wait for it to complete
        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        await Config.modifySetting('isActive', newStateIsON);
    }

    static async toggleAutoFocus(silentMode = false) {
        const newMode =  (Config.setting('afMode') === "disabled") ? 'selectedToken' : 'disabled';
        this.switchAutoFocus(newMode, silentMode);
    }

    /**
     * @param newModeInput allowed values: disabled, partyView or selectedToken (case-insensitive)
     * @param silentMode if true, any UI messages related to this switch action will be suppressed (overriding game settings)
     */
    static async switchAutoFocus(newModeInput, silentMode = false) {

        const allowedModes = {
            disabled: Config.localize("setting.afMode.options.disabled"),
            partyView: Config.localize("setting.afMode.options.partyView"),
            selectedToken: Config.localize("setting.afMode.options.selectedToken")
        }

        let newMode = Object.keys(allowedModes).find(mode => mode.toLowerCase() === newModeInput.toLowerCase());

        if (newMode === undefined) {
            Logger.error(false, `${Config.localize("autoFocus.msg.invalidMode")} ${newModeInput}`);
            return;
        }

        // first of all, handle lockView, if this 3rd-party module is present (see https://github.com/MaterialFoundry/LockView)
        if (game.modules.get("LockView")?.active) {
            if (newMode !== "disabled") {
                // when switching Auto-focus ON, remember LockView's current state, then disable it
                lockViewStatus = {
                    panLock: canvas.scene.getFlag('LockView', 'lockPan'),
                    zoomLock: canvas.scene.getFlag('LockView', 'lockZoom')
                };
                await Hooks.call('setLockView', {
                    "panLock": false,
                    "zoomLock": false
                });
                Logger.debug("(AutoFocus.switch) Grabbing current LockView state: ", lockViewStatus);
            } else { // switching OFF
                // otherwise (when switching OFF), restore LockView's previous state (given that it's known)
                if (lockViewStatus) {
                    Logger.debug("(AutoFocus.switch) Restoring previous LockView state: ", lockViewStatus);
                    await Hooks.call('setLockView', {
                        "panLock": lockViewStatus.panLock,
                        "zoomLock": lockViewStatus.zoomLock
                    });
                    // if LockView has been active before, we automatically switch to silent mode, preventing that
                    // the clients receive a misleading message stating that canvas control has been released (because
                    // this isn't the case, as it is still locked by LockView)
                    silentMode = (lockViewStatus.panLock || lockViewStatus.zoomLock);
                    lockViewStatus = null;
                }
            }
        }
        this.#isSilentMode = silentMode;
        this.#previousAfMode = this.#afMode
        this.#afMode = newMode;
        // propagate change to the game settings, and wait for it to complete
        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        await Config.modifySetting('afMode', newMode);
    }

    static onActiveStateChanged(newValue) {
        Logger.debug("(onActiveStateChanged) newValue: ", newValue);

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

    static onAFActiveStateChanged(newValue) {
        Logger.debug("(onAFActiveStateChanged) newValue: ", newValue);

        this.#afMode = Config.setting('afMode');

        if (game.user.isGM && Config.setting('notifyOnChange')) {
            // UI messages should only be triggered by the GM via sockets.
            // This seems to be the only way to suppress them if needed.
            if (!this.#isSilentMode) {
                socket.executeForEveryone("afStateChangeUIMessage");
            } else {
                this.#isSilentMode = false;
            }
        }
    }

    static stateChangeUIMessage() {
        let message =
            (HotPan.#isActive ? Config.localize('onOffUIMessage.whenON') : Config.localize('onOffUIMessage.whenOFF'));

        if (HotPan.#isActive && Config.setting('warnWhenON')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.warn(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.warn(true, message);
        } else if (!HotPan.#isActive && Config.setting('warnWhenOFF')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.info(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.info(true, message);
        } else {
            ui.notifications.info(Config.data.modTitle + " " + message, {
                permanent: false,
                localize: false,
                console: false
            });
            Logger.info(message);
        }
    }
    static afStateChangeUIMessage() {
        let message =
            (HotPan.#afMode !== "disabled")
                ? Config.localize('autoFocus.msg.whenON').replace('{mode}', Config.localize("setting.afMode.options." + Config.setting('afMode')))
                : Config.localize('autoFocus.msg.whenOFF');

        if (HotPan.#afMode !== "disabled" && Config.setting('warnWhenON')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.warn(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.warn(true, message);
        } else if (!(HotPan.#afMode !== "disabled") && Config.setting('warnWhenOFF')) {
            if (Config.setting('notifyOnChange')) {
                ui.notifications.info(Config.data.modTitle + " " + message, {
                    permanent: false,
                    localize: false,
                    console: false
                });
            }
            Logger.info(true, message);
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
