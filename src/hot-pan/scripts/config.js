import {Logger} from './logger.js';

const MOD_NAME = "hot-pan";
const MOD_PATH = `/modules/${MOD_NAME}`;

export class Config {
    static data = {
        // keep these values in sync with your module.json!
        modName: MOD_NAME,
        modPath: MOD_PATH,
        modTitle: "Hot Pan & Zoom!",
        modDescription: "One Mod to Pan Them! One Mod to Zoom Them! One Mod to Find them and to the GM's Canvas Bind Them!"
    };

    static async init() {
        // Here is the space for registering any game settings relevant for this very component (i.e. Config)
        const data = {
            isActive: {
                scope: 'world', config: true, type: Boolean, default: false,
            }
        };
        Config.registerSettings(data);
    }

    static registerSettings(settingsData) {
        Object.entries(settingsData).forEach(([key, data]) => {
            let name = Config.localize(`setting.${key}.name`);
            let hint = Config.localize(`setting.${key}.hint`);
            game.settings.register(
                Config.data.modName, key, {
                    name: name,
                    hint: hint,
                    ...data
                }
            );
            Logger.info("Game Setting registered:", name);
        });
    }

    static setting(key) {
        return game.settings.get(Config.data.modName, key);
    }

    /**
     * Returns the localized string for a given module scoped i18n key
     *
     * @ignore
     * @static
     * @param {*} key
     * @returns {string}
     * @memberof Config
     */
    static localize(key) {
        return game.i18n.localize(`${Config.data.modName}.${key}`);
    }

    static format(key, data) {
        return game.i18n.format(`${Config.data.modName}.${key}`, data);
    }


}
