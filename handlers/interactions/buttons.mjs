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
    '1321092832823607306': {
        role_name: ['⋆ The Board of State ⋆'],
        role_id: `1321092832823607306`,
        words: ['[GOV]', '[ПРА-ВО]'],
    },
    '1321092834010595348': {
        role_name: ['⋆ Federal Bureau of Investigation ⋆'],
        role_id: `1321092834010595348`,
        words: ['[FBI]', '[ФБР]'],
    },
    '1321092835528933476': {
        role_name: ['⋆ Department of Justice ⋆'],
        role_id: `1321092835528933476`,
        words: ['[LSPD]', '[ЛСПД]', '[LSSD]', '[RCSD]', '[ЛССД]', '[РКШД]', '[SFPD]', '[СФПД]', '[LVMPD]', '[ЛВМПД]'],
    },
    '1321092837445468180': {
        role_name: ['⋆ Department of Defence ⋆'],
        role_id: `1321092837445468180`,
        words: ['[ФИК]', '[АНГ]', '[ANG]', '[VNG]', '[ВНГ]'],
    },
    '1321092839295422547': {
        role_name: ['⋆ Fire Department ⋆'],
        role_id: `1321092839295422547`,
        words: ['[FD]', '[ПД]'],
    },
    '1321092840813498378': {
        role_name: ['⋆ Department of Health ⋆'],
        role_id: `1321092840813498378`,
        words: ['[LSMC]', '[SFMC]', '[LVMC]', '[TC]', '[ЛСМЦ]', '[СФМЦ]', '[ЛВМЦ]', '[ТС]'],
    },
    '1321092842021589063': {
        role_name: ['⋆ Department of Health ⋆'],
        role_id: `1321092842021589063`,
        words: ['[CNN LS]', '[RLS]', '[R-LS]', '[CNN LV]', '[RLV]', '[R-LV]', '[CNN SF]', '[RSF]', '[R-SF]', '[РЛС]', '[Р-ЛС]', '[РЛВ]', '[Р-ЛВ]', '[РСФ]', '[Р-СФ]']
    },
    '1321092843389059145': {
        role_name: ['⋆ Russian Mafia ⋆'],
        role_id: `1321092843389059145`,
        words: ['[RM]', '[РМ]'],
    },
    '1321092844714201208': {
        role_name: ['⋆ Warlock MC ⋆'],
        role_id: `1321092844714201208`,
        words: ['[WMC]', '[ВМС]'],
    },
    '1321092845758582824': {
        role_name: ['⋆ La Cosa Nostra ⋆'],
        role_id: `1321092845758582824`,
        words: ['[LCN]', '[ЛКН]'],
    },
    '1321092846966538312': {
        role_name: ['⋆ Yakuza ⋆'],
        role_id: `1321092846966538312`,
        words: ['[YAKUZA]', '[ЯКУДЗА]'],
    },
    '1321092848287744020': {
        role_name: ['⋆ Tierra Robada Bikers ⋆'],
        role_id: `1321092848287744020`,
        words: ['[TRB]', '[ТРБ]'],
    },
    '1321092849764270151': {
        role_name: ['⋆ Grove Street ⋆'],
        role_id: `1321092849764270151`,
        words: ['[GROVE]', '[ГРУВ]'],
    },
    '1321092851186274317': {
        role_name: ['⋆ East Side Ballas ⋆'],
        role_id: `1321092851186274317`,
        words: ['[BALLAS]', '[БАЛЛАС]'],
    },
    '1321092852486508604': {
        role_name: ['⋆ Los Santos Vagos ⋆'],
        role_id: `1321092852486508604`,
        words: ['[VAGOS]', '[ВАГОС]'],
    },
    '1321092853669040209': {
        role_name: ['⋆ Varios Los Aztecas ⋆'],
        role_id: `1321092853669040209`,
        words: ['[AZTEC]', '[АЦТЕК]'],
    },
    '1321092856634671154': {
        role_name: ['⋆ The Rifa ⋆'],
        role_id: `1321092856634671154`,
        words: ['[RIFA]', '[РИФА]'],
    },
    '1321092855002828810': {
        role_name: ['⋆ Night Wolves ⋆'],
        role_id: `1321092855002828810`,
        words: ['[NW]', '[НВ]'],
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

    if (!requestedRole) return await interaction.reply({ content: 'Невозможно определить фракцию по вашему нику!', ephemeral: true });
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
    await interaction.reply({ content: 'Запрос на роль отправлен, ожидайте!', ephemeral: true });
  } else if (interaction.customId.startsWith('accept_req_role_')) {
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3])
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id)
    const embed = new EmbedBuilder()
      .setTitle("✅ | Запрос на выдачу роли")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#00b0f4")
      .setFooter({ text: `Одобрил: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    if (rows.length === 0) return await interaction.reply({ content: 'Этот запрос не найден или уже был обработан.', ephemeral: true });
    if (!request.role_id) return await interaction.reply({ content: 'Роль, запрашиваемая пользователем, не найдена в системе.', ephemeral: true });
    if (!member) return await interaction.reply({ content: 'Пользователь не найден на сервере или покинул его.', ephemeral: true });

    await member.roles.add(interaction.guild.roles.cache.get(request.role_id));
    await user.send({ content: `Роль ${interaction.guild.roles.cache.get(request.role_id).name} по вашему запросу была выдана` });
    await db.query("DELETE FROM discord_role_requests WHERE user_id = ? AND role_id = ?", [member.id, request.role_id]);
    await interaction.message.edit({ embeds: [embed], components: [] });
    await interaction.reply({ content: 'Роль была выдана пользователю, запрос удалён.', ephemeral: true });
  } else if(interaction.customId.startsWith('reject_req_role_')){
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3])
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id)
    const embed = new EmbedBuilder()
      .setTitle("❎ | Запрос на выдачу роли")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#00b0f4")
      .setFooter({ text: `Отклонил: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    if (rows.length === 0) return await interaction.reply({ content: 'Этот запрос не найден или уже был обработан.', ephemeral: true });
    if (!request.role_id) return await interaction.reply({ content: 'Роль, запрашиваемая пользователем, не найдена в системе.', ephemeral: true });
    if (!member) return await interaction.reply({ content: 'Пользователь не найден на сервере или покинул его.', ephemeral: true });

    await user.send({ content: `Роль ${interaction.guild.roles.cache.get(request.role_id).name} по вашему запросу была отклонена` });
    await db.query("DELETE FROM discord_role_requests WHERE user_id = ? AND role_id = ?", [member.id, request.role_id]);
    await interaction.message.edit({ embeds: [embed], components: [] });
    await interaction.reply({ content: 'Запрос на роль пользователю была отклонена, запрос удалён.', ephemeral: true });
  } else if(interaction.customId.startsWith('reqstats_req_role_')){
    const member = await interaction.guild.members.fetch(interaction.customId.split('_')[3])
    const [rows] = await db.query("SELECT * FROM discord_role_requests WHERE user_id = ?", [member.id]);
    const request = rows[0];
    const user = await interaction.client.users.cache.get(member.id)
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
      )
    const embed = new EmbedBuilder()
      .setTitle("📜 | Запрос на выдачу роли")
      .setDescription(`**Запросил: <@${member.id}>**\n**Роль: <@&${request.role_id}>**`)
      .setColor("#00b0f4")
      .setFooter({ text: `Запросил статистику: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setTimestamp();

    if (rows.length === 0) return await interaction.reply({ content: 'Этот запрос не найден или уже был обработан.', ephemeral: true });
    if (!request.role_id) return await interaction.reply({ content: 'Роль, запрашиваемая пользователем, не найдена в системе.', ephemeral: true });
    if (!member) return await interaction.reply({ content: 'Пользователь не найден на сервере или покинул его.', ephemeral: true })
  
    await user.send({ content: `Модератор ${interaction.user} запросил у вас статистику` });
    await interaction.message.edit({ embeds: [embed], components: [buttons] });
    await interaction.reply({ content: 'Вы запросили статистику у пользователя, ожидайте!', ephemeral: true });
  }
}
