import { Client, Events, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import 'dotenv/config'
import db from './db.mjs';
import cron from 'node-cron'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

import { handleOut } from './handlers/commands/out.mjs'
import { handleProfile } from './handlers/commands/profile.mjs'
import { handleBank } from './handlers/commands/bank.mjs'
import { handleDaily } from './handlers/commands/daily.mjs'
import { handleFamily, handleAutocomplete } from './handlers/commands/family.mjs'
import { handleBinaryOption } from './handlers/commands/binary-option.mjs'

import { handleButtonInteraction } from './handlers/interactions/buttons.mjs'
import { handleSelectMenuInteraction } from './handlers/interactions/selectMenu.mjs'

client.on(Events.ClientReady, readyClient => {
  console.log(`[CLIENT] Бот авторизировался как ${readyClient.user.tag}!`);
});

client.on(Events.GuildMemberAdd, async member => {
  const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [member.id])
  if(rows.length === 0){
    await db.query('INSERT INTO discord_profiles (user_id, username) VALUES (?, ?)', [member.id, member.displayname])
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if(interaction.isChatInputCommand()){
    if(interaction.commandName === 'bank') return await handleBank(interaction)
    if(interaction.commandName === 'daily') return await handleDaily(interaction)
    if(interaction.commandName === 'out') return await handleOut(interaction)
    if(interaction.commandName === 'profile') return await handleProfile(interaction)
    if(interaction.commandName === 'family') return await handleFamily(interaction)
    if(interaction.commandName === 'binary-option') return await handleBinaryOption(interaction)
  } else if(interaction.isButton()){
    await handleButtonInteraction(interaction)
  } else if(interaction.isStringSelectMenu()){
    await handleSelectMenuInteraction(interaction)
  } else if(interaction.isAutocomplete()) return await handleAutocomplete(interaction)
  else {
    await interaction.reply({ embeds: [new EmbedBuilder().setDescription('Неизвестный вид интеракции!').setColor('#ff0000')], ephemeral: true })
  }
})

client.on(Events.MessageCreate, async message => {
   if (message.content === 'crm' && message.channel.id === process.env.MESSAGE_REQUEST_CHANNEL) {
      await message.delete()
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('request_role')
            .setLabel('Запросить роль')
            .setStyle(ButtonStyle.Primary)
        );
      const embedRequestInfo = new EmbedBuilder()
         .setDescription("✌️ Добро пожаловать в канал запроса ролей!\nДля того чтобы запросить роль, требуется сделать ник по форме и нажать на кнопку \"Запросить роль\".")
         .addFields(
            {
               name: "🤵 Как сделать ник по форме?",
               value: "[`📌`] Для получения роли организации в которой Вы состоите, Вам нужно сделать ник-нейм по форме: `[фракция] Nick_Name [ранг]`\n\n[`📍`] Ник-нейм обязательно должен состоять только из стандартного шрифта, а также написан только на английском языке.\n[`📟`] Для смены ник-нейма используйте команду `/nick`\n\n[`🖍️`] После смены ник-нейма под сообщением выше нажмите кнопку \"`Получить роль`\".\n[`📚`] Узнать список доступных тегов вы можете справа, в данном сообщении",
               inline: true
            },
            {
               name: "» Список доступных тегов",
               value: "<@&1321555638005796947> - [T1]\n<@&1321555656083374080> - [T2]",
               inline: true
            },
         )
         .setColor("#7a52a3");

      message.channel.send({ embeds: [embedRequestInfo], components: [buttons] })
   } else if(message.content === 'ctm' && message.channel.id === process.env.MESSAGE_TICKET_CHANNEL){
    await message.delete()

    const [rows] = await db.query('SELECT * FROM discord_statistic');
    const statistic = rows[0] 
    const menuTickets = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_reason')
          .setPlaceholder('Суть обращения')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Жалоба на пользователя')
              .setValue('ticket_appeal_user'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Помощь по системам сервера')
              .setValue('ticket_help_server'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Сообщение о баге')
              .setValue('ticket_report_bug'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Другое')
              .setValue('ticket_other')
          )
      )
      const value = '[``📌``] - Количество обращений за всё время: ``' + statistic.tickets_all + '``\n' +
              '[``👀``] - На рассмотрении: ``' + statistic.tickets_pending + '``\n' +
              '[``🔒``] - Закрытых: ``' + statistic.tickets_closed + '``';
      const embedTickets = new EmbedBuilder()
        .setTitle("Система обращений")
        .setDescription("[`👋`] Добро пожаловать! Вы попали в канал поддержки Discord проекта New Project!\n\n[`📃`] Выберите суть Вашей проблемы, и мы обязателельно постараемся Вам помочь!")
        .addFields(
          {
            name: "Статистика Системы Обращений",
            value: value,
            inline: false
          },
        )
        .setColor("#00b0f4")
        .setFooter({ text: "Состав модерации сервера" });

      message.channel.send({ embeds: [embedTickets], components: [menuTickets] });
   } else if (message.content === '/close' && message.channel.parentId === process.env.TICKET_CATEGORY) {
    const [rows] = await db.query('SELECT * FROM discord_statistic');
    const [rows1] = await db.query('SELECT * FROM discord_tickets WHERE channel_id = ?', [message.channel.id]);
    const statistic = rows[0];
    const ticketData = rows1[0];
    const closedTicketCategory = message.guild.channels.cache.find(c => c.id === process.env.CLOSED_TICKET_CATEGORY);
    const member = await message.guild.members.fetch(ticketData.user_id);
    const ticketChannelInfo = await message.guild.channels.cache.get(process.env.MESSAGE_TICKET_CHANNEL)
    const ticketChannelMessage = await ticketChannelInfo.messages.fetch(process.env.MESSAGE_TICKET_CHANNEL_ID)

    if (!closedTicketCategory) return console.log('Категория для закрытых тикетов не найдена.');

    const valueEmbed = '[``📌``] - Количество обращений за всё время: ``' + statistic.tickets_all + '``\n' +
                  '[``👀``] - На рассмотрении: ``' + (statistic.tickets_pending - 1) + '``\n' +
                  '[``🔒``] - Закрытых: ``' + (statistic.tickets_closed + 1) + '``';
    const embedTickets = new EmbedBuilder()
      .setTitle("Система обращений")
      .setDescription("[`👋`] Добро пожаловать! Вы попали в канал поддержки Discord проекта New Project!\n\n[`📃`] Выберите суть Вашей проблемы, и мы обязателельно постараемся Вам помочь!")
      .addFields(
        {
          name: "Статистика Системы Обращений",
          value: valueEmbed,
          inline: false
        },
      )
      .setColor("#00b0f4")
      .setFooter({ text: "Состав модерации сервера" });

    await message.delete();
    await db.query("UPDATE discord_statistic SET tickets_pending = ?, tickets_closed = ?", [ statistic.tickets_pending - 1, statistic.tickets_closed + 1 ]);
    await message.channel.send({ embeds: [new EmbedBuilder().setDescription(`<@${ticketData.user_id}>, модератор ${message.author} установил вашему обращению статус "Закрыто".`).setColor("#00b0f4")] });
    await db.query("UPDATE discord_tickets SET status = ? WHERE channel_id = ?", ['closed', message.channel.id]);
    await message.channel.setParent(closedTicketCategory);
    await message.channel.permissionOverwrites.edit(member, { SendMessages: false });
    await ticketChannelMessage.edit({ embeds: [embedTickets] })
  }
});

cron.schedule('0 0 * * * *', async () => {
  const [rows] = await db.query('SELECT user_id, dp_bank FROM discord_profiles WHERE dp_bank > 0');

  for (const user of rows) {
    const newDeposit = Math.floor(user.dp_bank * 1.025)
    await db.query('UPDATE discord_profiles SET dp_bank = ? WHERE user_id = ?', [newDeposit, user.user_id]);
    console.log(`[ECONOMY] Депозиты обновлены!`)
  }
});

client.login(process.env.TOKEN);
