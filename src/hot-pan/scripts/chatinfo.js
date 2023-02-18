import {Logger} from './logger.js';
import {Config} from './config.js'

export class ChatInfo {
    static contentCardHTML = `
    <div class="div-styled" style= "padding: 5px;">
        <div style="text-align: justify; color: #E7E7E7; padding: 10px; background-color: #212121; border: 3px solid #FFBA00; border-radius: 10px;">
            <div>
                <p style="text-align: justify;">chatInfoContent.title</p>
            </div>
            <hr>
            <div>
                <p>chatInfoContent.text</p>
                <p style="text-align: center;"><a href="https://github.com/coffiarts/FoundryVTT-hot-pan">chatInfoContent.link</a></p>
            </div>
            <hr>
            <div class="div-styled" style="font-style:italic;">
                <p style="text-align: justify;">chatInfoContent.footer</p>
            </div>

        </div>
    </div>`;

    static init() {
        // Here is the space for registering any game settings relevant for this very component (i.e. Logger)
        const settingsData = {
            hideChatInfo: {
                scope: 'world', config: true, type: Boolean, default: false,
            }
        };
        Config.registerSettings(settingsData);

        Hooks.once('ready', async function () {
            if (game.user.isGM) {
                if (Config.setting('hideChatInfo') === false) {
                    // Create Chat Message
                    await ChatMessage.create({
                        user: game.user.id ?? game.user._id,
                        speaker: ChatMessage.getSpeaker(),
                        content: ChatInfo.contentCardHTML
                            .replace('chatInfoContent.title', Config.localize('chatInfoContent.title'))
                            .replace('chatInfoContent.text', Config.localize('chatInfoContent.text'))
                            .replace('chatInfoContent.link', Config.localize('chatInfoContent.link'))
                            .replace('chatInfoContent.footer', Config.localize('chatInfoContent.footer'))
                        ,
                    }, {});
                    Logger.debug("Chat message created");

                    await Config.modifySetting('hideChatInfo', true);
                }
            }
        })

    }

}
