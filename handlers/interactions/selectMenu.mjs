import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import db from '../../db.mjs';
import 'dotenv/config'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

export async function handleSelectMenuInteraction(interaction) {
  if(interaction.customId === 'ticket_reason'){
    const [rows] = await db.query("SELECT * FROM discord_statistic");
    const [rows1] = await db.query("SELECT * FROM discord_tickets WHERE user_id = ?", [interaction.member.id])
    const statistic = rows[0]
    const ticketData = rows1[0]
    const value = interaction.values[0]
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${statistic.tickets_all + 1}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.member.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        },
        {
          id: process.env.ROLE_MOD_TICKET,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        }
      ]
    })
    const components = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Перейти в чат')
          .setURL(ticketChannel.url)
          .setStyle(ButtonStyle.Link)
      )
    const ticketChannelInfo = await interaction.guild.channels.cache.get(process.env.MESSAGE_TICKET_CHANNEL)
    const ticketChannelMessage = await interaction.channel.messages.fetch(process.env.MESSAGE_TICKET_CHANNEL_ID)
    const valueEmbed = '[``📌``] - Количество обращений за всё время: ``' + (statistic.tickets_all + 1) + '``\n' +
                  '[``👀``] - На рассмотрении: ``' + (statistic.tickets_pending + 1) + '``\n' +
                  '[``🔒``] - Закрытых: ``' + statistic.tickets_closed + '``';
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
    await ticketChannel.send({ content: `${interaction.user}, **\`\`Для службы поддержки\`\`** <@&1321555656083374080>` })
    await db.query(`UPDATE discord_statistic SET tickets_all = ?, tickets_pending = ?`, [statistic.tickets_all + 1, statistic.tickets_pending + 1])
    await db.query(`INSERT INTO discord_tickets (channel_id, user_id) VALUES (?, ?)`, [ticketChannel.id, interaction.member.id])
    await interaction.reply({ content: 'Ваше обращение было успешно создано. Нажмите на кнопку ниже!', components: [components], ephemeral: true })
    await ticketChannelMessage.edit({ embeds: [embedTickets] })    
  }
}
