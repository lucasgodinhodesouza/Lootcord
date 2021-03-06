const Discord = require('discord.js');
const { query } = require('../../mysql.js');
const clans = require('../../methods/clan_methods.js');
const clan_ranks = require('../../json/clan_ranks');
//const itemdata = require('../json/completeItemList.json');

module.exports = {
    name: 'leave',
    aliases: [''],
    description: 'Leave your current clan.',
    minimumRank: 0,
    requiresClan: true,
    
    async execute(message, args, lang, prefix){
        const scoreRow = (await query(`SELECT * FROM scores WHERE userId = ${message.author.id}`))[0];
        const clanRow = (await query(`SELECT * FROM clans WHERE clanId = ${scoreRow.clanId}`))[0];

        var isLeader = false;
        var leaveMsg = lang.clans.leave[1].replace('{0}', clanRow.name);

        if(clan_ranks[scoreRow.clanRank].title == 'Leader'){
            leaveMsg = lang.clans.leave[2].replace('{0}', clanRow.name);
        }

        message.reply(leaveMsg).then(botMessage => {
            botMessage.react('✅').then(() => botMessage.react('❌'));
            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
            };
            botMessage.awaitReactions(filter, {max: 1, time: 15000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first();

                if(reaction.emoji.name === '✅'){
                    botMessage.delete();

                    const scoreRow2 = (await query(`SELECT * FROM scores WHERE userId = ${message.author.id}`))[0];
                    if(scoreRow2.clanId == 0 || scoreRow2.clanId !== scoreRow.clanId){
                        return message.reply(lang.clans.leave[0]);
                    }
                    if(clan_ranks[scoreRow.clanRank].title == 'Leader'){
                        isLeader = true;
                    }

                    leaveClan(message.author.id, scoreRow.clanId, isLeader);
                    clans.addLog(scoreRow.clanId, `${message.author.tag} left`);
                    message.reply(lang.clans.leave[3].replace('{0}', clanRow.name));
                }
                else{
                    botMessage.delete();
                }
            }).catch(collected => {
                botMessage.delete();
                message.reply(lang.errors[3]);
            });
        });
    },
}

async function leaveClan(userId, clanId, isLeader){
    query(`UPDATE scores SET clanId = 0 WHERE userId = ${userId}`);
    query(`UPDATE scores SET clanRank = 0 WHERE userId = ${userId}`);

    if(isLeader){
        clans.disbandClan(clanId)
    }
}