const { query } = require('../mysql.js');

module.exports = {
    name: 'togglekillfeed',
    aliases: ['setkillfeed', 'setkillchan', 'togglekillchan'],
    description: 'Toggles the channel its used in as the kill feed for the server.',
    hasArgs: false,
    worksInDM: false,
    requiresAcc: true,
    guildModsOnly: true,
    modOnly: false,
    adminOnly: false,
    
    execute(message, args, lang, prefix){
        query(`SELECT * FROM guildInfo WHERE guildId ="${message.guild.id}"`).then(guildRow => {
            if(!guildRow.length) query("INSERT INTO guildInfo (guildId, killChan, levelChan, dropChan, dropItem, randomOnly) VALUES (?, ?, ?, ?, ?, ?)", [message.guild.id, "", "", "", "", 0]);

            if(guildRow[0].killChan == 0){
                query(`UPDATE guildInfo SET killChan = ${message.channel.id} WHERE guildId = ${message.guild.id}`);

                message.reply(lang.setkillfeed[0]);
            }
            else{
                query(`UPDATE guildInfo SET killChan = 0 WHERE guildId = "${message.guild.id}"`);

                message.reply(lang.disablekillfeed[0]);
            }
        });
    },
}