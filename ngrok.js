const ngrok = require("ngrok");
const config = require("./config.json");

module.exports = async function () {
    try {
        const url = await ngrok.connect({
            addr: 3000,
            authtoken: config.authtoken,
        });
        console.log("[🌐] Ngrok URL :", url);
    } catch (error) {
        console.error("[❌] Échec de la connexion Ngrok :", error.message);
    }
};