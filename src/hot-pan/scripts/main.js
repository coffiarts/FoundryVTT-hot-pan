import {logger} from './logger.js';
import {MODULE} from './module.js'

const SUB_MODULES = {
    MODULE,
    logger
}

let socket;

/*
  Initialize Anything
 */
(async () => {
    console.log("Hot Pan | Initializing Module");
    await preRequisitesReady();
    logger.info("Ready to play!")
})();

async function preRequisitesReady() {
    return Promise.all([
        areSubmodulesReady(),
        isSocketlibRegistered(),
        isCanvasReady()]);
}

async function areSubmodulesReady() {
    return new Promise(resolve => {
        Hooks.once('setup', () => {
            resolve(registerSubmodules());
        });
    });
}

async function isSocketlibRegistered() {
    return new Promise(resolve => {
        Hooks.once('socketlib.ready', () => {
            resolve(registerToSocketlib());
        });
    });
}

async function isCanvasReady() {
    return new Promise(resolve => {
        Hooks.once('canvasReady', () => {
            resolve(registerCanvasListeners());
            logger.info("Canvas is ready (listeners registered)");
        });
    });
}

async function registerSubmodules() {
    Object.values(SUB_MODULES).forEach(function(cl) {
        cl.register(); // includes loading each module's settings
        logger.info("Submodule registered:", cl.name);
    });
}

async function registerToSocketlib() {
    socket = socketlib.registerModule(MODULE.data.name);
    socket.register("pushPanToClients", pushPanToClients);
    logger.info(`Module ${MODULE.data.name} registered in socketlib.`);
}

async function registerCanvasListeners() {
    Hooks.on("canvasPan", function (canvas) {
        // logger.debug("game.user.isGM: ", game.user.isGM);
        if (!game.user.isGM) return;
        logger.debug("Pushing new Canvas.canvasPan event to players' clients.");
        socket.executeAsGM("pushPanToClients", {canvasPosition: canvas.position, username: game.user.name});
    });
}

function pushPanToClients(data) {
    // ignore for the GM
    // logger.debug("game.user.isGM: ", game.user.isGM);
    //if (game.user.isGM) return;

    // const isResponsibleGM = game.users
    //     .filter(user => user.isGM && user.isActive)
    //     .some(other => other.data._id < game.user.data._id);
    // logger.debug("isResponsibleGM: ", isResponsibleGM);
    // if (!isResponsibleGM) return;
    logger.debug("pushPanToClients from", data.username, "to", data.canvasPosition);
    //canvas.animatePan(data.canvasPosition);
}

