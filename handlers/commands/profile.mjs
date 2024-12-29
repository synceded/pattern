import { EmbedBuilder } from 'discord.js';
import db from '../../db.mjs';

export async function handleProfile(interaction) {
  const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.user.id]);
  const profile = rows[0];

  if (rows.length === 0) {
    const embedError = new EmbedBuilder()
      .setAuthor({
        name: "Ошибка",
        iconURL: interaction.user.avatarURL(),
      })
      .setDescription("Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!")
      .setColor("#ff0000");

    return await interaction.reply({ embeds: [embedError], ephemeral: true });
  }

  // Форматирование dp и dp_bank
  const formattedDp = parseFloat(profile.dp).toFixed(2);
  const formattedDpBank = parseFloat(profile.dp_bank).toFixed(2);

  const embedProfile = new EmbedBuilder()
    .setAuthor({
      name: "Ваш профиль",
      iconURL: interaction.user.avatarURL(),
    })
    .setDescription(`💰 Баланс: **${formattedDp}** DP\n💳 Банк: **${formattedDpBank}** DP`)
    .setColor("#00b0f4");

  await interaction.reply({ embeds: [embedProfile], ephemeral: true });
}
