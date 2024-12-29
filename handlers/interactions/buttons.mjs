import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import db from '../../db.mjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

const role_list = {
  '1321555638005796947': {
    role_name: ['test1'],
    role_id: `1321555638005796947`,
    words: ['[T1]', '[Т1]'],
  },
  '1321555656083374080': {
    role_name: ['test2'],
    role_id: `1321555656083374080`,
    words: ['[T2]', '[Т2]'],
  },
};

export async function handleButtonInteraction(interaction) {
  let requestedRole = null;
  const requestedChannel = interaction.guild.channels.cache.get(process.env.REQUEST_CHANNEL);
  const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [interaction.member.id]);
  
  for (let [roleId, roleData] of Object.entries(role_list)) {
    for (let word of roleData.words) {
      if (interaction.member.displayName.toLowerCase().includes(word.toLowerCase())) {
        requestedRole = roleData;
        break;
      }
    }
    if (requestedRole) break;
  }

  if (interaction.customId === 'request_role') {
    const embed = new EmbedBuilder()
      .setTitle("⏰ | Запрос на выдачу роли")
      .setDescription(`**Запросил: ${interaction.member}**\n**Роль: <@&${requestedRole.role_id}>**`)
      .addFields(
        {
          name: "Информация по кнопкам",
          value: "**`[✅] - выдать роль`**\n**`[📜] - запросить статистику`**\n**`[❎] - отказать выдачу`**",
          inline: false
        },
      )
      .setColor("#00b0f4")
      .setTimestamp();

    if (!requestedRole) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Невозможно определить фракцию по вашему нику!')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (requestedChannel) {
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_req_role_${interaction.member.id}`)
            .setLabel('Выдать')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`reject_req_role_${interaction.member.id}`)
            .setLabel('Отказать')
            .setEmoji('❎')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`reqstats_req_role_${interaction.member.id}`)
            .setLabel('Запросить статистику')
            .setEmoji('📜')
            .setStyle(ButtonStyle.Secondary)
        )

      await requestedChannel.send({ embeds: [embed], components: [buttons] });
      await db.query("INSERT INTO discord_role_requests (user_id, role_id) VALUES (?, ?)", [interaction.member.id, requestedRole.role_id]);
    }

    const successEmbed = new EmbedBuilder()
      .setTitle("✅ | Запрос отправлен")
      .setDescription('Запрос на роль отправлен, ожидайте!')
      .setColor("#00b0f4");
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  } else if (interaction.customId.startsWith('accept_req_role_')) {
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3]);
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id);

    if (rows.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Этот запрос не найден или уже был обработан.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!request.role_id) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Роль, запрашиваемая пользователем, не найдена в системе.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Пользователь не найден на сервере или покинул его.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await member.roles.add(interaction.guild.roles.cache.get(request.role_id));
    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Роль выдана")
          .setDescription(`Роль ${interaction.guild.roles.cache.get(request.role_id).name} по вашему запросу была выдана`)
          .setColor("#00b0f4")
      ]
    });
    await db.query("DELETE FROM discord_role_requests WHERE user_id = ? AND role_id = ?", [member.id, request.role_id]);

    const successEmbed = new EmbedBuilder()
      .setTitle("✅ | Роль выдана")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#00b0f4")
      .setFooter({ text: `Одобрил: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    await interaction.message.edit({ embeds: [successEmbed], components: [] });
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  } else if (interaction.customId.startsWith('reject_req_role_')) {
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3]);
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id);

    if (rows.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Этот запрос не найден или уже был обработан.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!request.role_id) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Роль, запрашиваемая пользователем, не найдена в системе.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Пользователь не найден на сервере или покинул его.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("❌ Роль отклонена")
          .setDescription(`Роль ${interaction.guild.roles.cache.get(request.role_id).name} по вашему запросу была отклонена`)
          .setColor("#FF0000")
      ]
    });
    await db.query("DELETE FROM discord_role_requests WHERE user_id = ? AND role_id = ?", [member.id, request.role_id]);

    const rejectEmbed = new EmbedBuilder()
      .setTitle("❌ | Запрос отклонен")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#FF0000")
      .setFooter({ text: `Отклонил: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    await interaction.message.edit({ embeds: [rejectEmbed], components: [] });
    await interaction.reply({ embeds: [rejectEmbed], ephemeral: true });
  } else if (interaction.customId.startsWith('reqstats_req_role_')) {
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3]);
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id);
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_req_role_${interaction.member.id}`)
          .setLabel('Выдать')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_req_role_${interaction.member.id}`)
          .setLabel('Отказать')
          .setEmoji('❎')
          .setStyle(ButtonStyle.Danger)
      );

    if (rows.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Этот запрос не найден или уже был обработан.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!request.role_id) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Роль, запрашиваемая пользователем, не найдена в системе.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Ошибка")
        .setDescription('Пользователь не найден на сервере или покинул его.')
        .setColor("#FF0000");
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Статистика")
          .setDescription(`Модератор ${interaction.user} запросил у вас статистику`)
          .setColor("#00b0f4")
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("📜 | Запрос статистики")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#00b0f4")
      .setFooter({ text: `Запросил статистику: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    await interaction.message.edit({ embeds: [embed], components: [buttons] });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
