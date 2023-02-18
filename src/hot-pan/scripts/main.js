import {Logger} from './logger.js';
import {Config} from './config.js'

const DEPENDENCIES = {
    MODULE: Config,
    logger: Logger
}

let socket;

/*
  Global initializer:
  First of all, we need to initialize a lot of stuff in correct order:
 */
(async () => {
    console.log("Hot Pan & Zoom! | Initializing Module");
    await allPrerequisitesReady();
    Logger.info("Ready to play!");
    Logger.info(Config.data.modDescription);
    Logger.info("Module Status is", Config.setting('isActive') ? "ON" : "OFF")
})();

async function allPrerequisitesReady() {
    return Promise.all([
        areDependenciesReady(),
        isSocketlibReady(),
        areCanvasListenersReady()]);
}

async function areDependenciesReady() {
    return new Promise(resolve => {
        Hooks.once('setup', () => {
            resolve(initDependencies());
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
            Logger.info("Canvas is ready (listeners registered)");
        });
    });
}

async function initDependencies() {
    Object.values(DEPENDENCIES).forEach(function(cl) {
        cl.init(); // includes loading each module's settings
        Logger.info("Submodule registered:", cl.name);
    });
}

async function initSocketlib() {
    socket = socketlib.registerModule(Config.data.modName);
    socket.register("pushPanToClients", pushPanToClients);
    Logger.info(`Module ${Config.data.modName} registered in socketlib.`);
}

async function initCanvasListeners() {
    Hooks.on("canvasPan", async function (canvas, position) {
        if (!game.user.isGM) return; // Only the GM shall be allowed to force canvas position on others!
        if (!Config.setting('isActive')) return;
        Logger.debug("Pushing canvas position from GM to clients.");
        socket.executeForOthers("pushPanToClients", {position: position, username: game.user.name});
    });
}

/*
And then, finally...
HERE is our core function doing all the work while in game!
Nice and nifty...
*/
async function pushPanToClients(data) {
    Logger.debug("pushPanToClients from", data.username, "to", game.user.name, "canvasPosition", data.position);
    canvas.animatePan(data.position);
}

