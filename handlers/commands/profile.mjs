import { EmbedBuilder } from 'discord.js'
import db from '../../db.mjs';

export async function handleProfile(interaction) {
  const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.user.id]);
  const profile = rows[0];
  const embedProfile = new EmbedBuilder()
    .setAuthor({
      name: "Ваш профиль",
      iconURL: interaction.user.avatarURL(),
    })
    .setDescription(`💰 Баланс: **${profile.dp}** DP\n💳 Банк: **${profile.dp_bank}** DP`)
    .setColor("#00b0f4");

  if (rows.length === 0) return await interaction.reply({ content: 'Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!', ephemeral: true });
  await interaction.reply({ embeds: [embedProfile], ephemeral: true })
}
