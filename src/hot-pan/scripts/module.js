import { logger } from './3rd-party/logger.js';
const NAME = "hot-pan";
const PATH = `/modules/${NAME}`;

export class MODULE {
    static data = {
        name: NAME,
        path: PATH,
        title: "Hot Pan"
    };

    static async register() {
        logger.info("Initializing Module");
        MODULE.settings();
    }

    static async build() {
        //logger.info("Module Data Built");
    }

    static settings() {
        const data = {
            // disablePermCheck: {
            //     config: true, scope: 'world', type: Boolean, default: false,
            // }
        };

        MODULE.registerSettings(data);
    }

    static registerSettings(settingsData) {
        Object.entries(settingsData).forEach(([key, data]) => {
            let name = MODULE.localize(`setting.${key}.name`);
            let hint = MODULE.localize(`setting.${key}.hint`);
            game.settings.register(
                MODULE.data.name, key, {
                    name: name,
                    hint: hint,
                    ...data
                }
            );
            logger.debug("Game Setting registered: ", name);
        });
    }

    static setting(key) {
        return game.settings.get(MODULE.data.name, key);
    }

    /**
     * Returns the localized string for a given warpgate scoped i18n key
     *
     * @ignore
     * @static
     * @param {*} key
     * @returns {string}
     * @memberof MODULE
     */
    static localize(key) {
        return game.i18n.localize(`warpgate.${key}`);
    }

    static format(key, data) {
        return game.i18n.format(`warpgate.${key}`, data);
    }



}
