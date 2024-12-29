import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import db from '../../db.mjs';

export async function handleFamily(interaction) {
  const subCommand = interaction.options.getSubcommand();

  if (subCommand === 'list') {
    const [rows] = await db.query('SELECT * FROM discord_families');
    const familyList = rows.length 
      ? rows.map(fam => `**<@&${fam.role_id}> [${fam.id}]**`).join("\n")
      : 'Семьи на данном сервере отсутствуют!';

    const embedFamilyList = new EmbedBuilder()
      .setTitle("📄 Список семей сервера")
      .setDescription(familyList)
      .setColor("#00b0f4");

    await interaction.reply({ embeds: [embedFamilyList], ephemeral: true });

  } else if (subCommand === 'info') {
    const familyName = interaction.options.getString('fam');
    const [rows] = await db.query('SELECT * FROM discord_families WHERE name = ?', [familyName]);
    
    if (!rows.length) {
      const embedNotFound = new EmbedBuilder()
        .setTitle('❌ Ошибка')
        .setDescription('Семья не найдена!')
        .setColor('#ff0000');
      return await interaction.reply({ embeds: [embedNotFound], ephemeral: true });
    }

    const familyData = rows[0];
    const createdAt = new Date(familyData.created_at);
    const [familyMembers] = await db.query('SELECT user_id FROM discord_family_members WHERE family_id = ?', [familyData.id]);
    const memberList = familyMembers.length
      ? await Promise.all(familyMembers.map(async (member) => {
        if (member.user_id && !isNaN(member.user_id)) return `<@${member.user_id}>`;
        return null;
      })).then(users => users.filter(user => user !== null).join("\n"))
      : 'Нет участников';

    const embedFamilyInfo = new EmbedBuilder()
      .setTitle(`Информация о семье: ${familyData.name} [${familyData.id}]`)
      .setDescription(`${familyData.description || 'Описание отсутствует!'}\n\n**Лидер семьи:** <@${familyData.owner_id}>\n**Репутация семьи:** ${familyData.reputation} RP\n**Список участников:**\n${memberList}`)
      .setColor("#00b0f4")
      .setFooter({ text: `Дата создания семьи:` })
      .setTimestamp(createdAt);

    await interaction.reply({ embeds: [embedFamilyInfo], ephemeral: true });

  } else if (subCommand === 'invite') {
    const familyName = interaction.options.getString('fam');
    const user = interaction.options.getUser('user');
    const [rows] = await db.query('SELECT * FROM discord_families WHERE name = ?', [familyName]);
    
    if (!rows.length) {
      const embedNotFound = new EmbedBuilder()
        .setTitle('❌ Ошибка')
        .setDescription('Семья не найдена!')
        .setColor('#ff0000');
      return await interaction.reply({ embeds: [embedNotFound], ephemeral: true });
    }

    const familyData = rows[0];
    const [existingMember] = await db.query('SELECT * FROM discord_family_members WHERE user_id = ? AND family_id = ?', [user.id, familyData.id]);

    if (interaction.user.id !== familyData.owner_id) {
      const embedNotOwner = new EmbedBuilder()
        .setTitle('❌ Ошибка')
        .setDescription('Вы не являетесь лидером этой семьи!')
        .setColor('#ff0000');
      return await interaction.reply({ embeds: [embedNotOwner], ephemeral: true });
    }

    if (existingMember.length) {
      const embedAlreadyMember = new EmbedBuilder()
        .setTitle('❌ Ошибка')
        .setDescription(`<@${user.id}> уже является членом этой семьи!`)
        .setColor('#ff0000');
      return await interaction.reply({ embeds: [embedAlreadyMember], ephemeral: true });
    }

    const embedInvite = new EmbedBuilder()
      .setTitle(`Приглашение в семью ${familyData.name}`)
      .setDescription(`<@${user.id}>, вы были приглашены в семью **${familyData.name}**.`)
      .setColor('#00b0f4');
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('accept_invite').setLabel('Принять').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('decline_invite').setLabel('Отказаться').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embedInvite], ephemeral: true });
    const inviteMessage = await interaction.channel.send({
      content: `<@${user.id}>`,
      embeds: [embedInvite],
      components: [buttons],
    });

    const filter = (i) => i.user.id === user.id;
    const collector = inviteMessage.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'accept_invite') {
        await db.query('INSERT INTO discord_family_members (user_id, family_id) VALUES (?, ?)', [user.id, familyData.id]);
        const role = interaction.guild.roles.cache.find((r) => r.name === familyData.name);
        if (role) {
          const member = await interaction.guild.members.fetch(user.id);
          await member.roles.add(role);
        }
        embedInvite.setDescription(`${user.tag} принял приглашение! Добро пожаловать в семью **${familyData.name}**!`).setColor('#00ff00');
        await i.update({ embeds: [embedInvite], components: [] });
      } else if (i.customId === 'decline_invite') {
        embedInvite.setDescription(`${user.tag} отклонил приглашение в семью **${familyData.name}**.`).setColor('#ff0000');
        await i.update({ embeds: [embedInvite], components: [] });
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        embedInvite.setDescription(`Время для ответа ${user.tag} истекло.`).setColor('#808080');
        await inviteMessage.edit({ embeds: [embedInvite], components: [] });
      }
    });
  }
}

export async function handleAutocomplete(interaction) {
  if (!interaction.isAutocomplete()) return;

  const focusedValue = interaction.options.getFocused(); // Получаем текущий ввод
  const [rows] = await db.query('SELECT * FROM discord_families');

  const filtered = rows
    .filter(familyData => familyData.name.toLowerCase().includes(focusedValue.toLowerCase())) // Фильтруем по вводу
    .map(familyData => ({ name: `${familyData.name} [${familyData.id}]`, value: familyData.name })); // Преобразуем в формат для autocomplete

  await interaction.respond(filtered.slice(0, 25)); // Возвращаем максимум 25 результатов
}
