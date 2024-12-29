import { EmbedBuilder } from 'discord.js';
import db from '../../db.mjs';

export async function handleDaily(interaction) {
  const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.user.id]);
  const profile = rows[0];
  const now = new Date();
  const lastDaily = profile?.last_daily ? new Date(profile.last_daily) : null;
  const reward = (Math.random() * 24.99) + 1

  const embedError = (description) => 
    new EmbedBuilder()
      .setTitle('❌ Ошибка')
      .setDescription(description)
      .setColor('#ff0000');

  const embedSuccess = (title, description) => 
    new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#00ff00');

  if (rows.length === 0) {
    const embed = embedError('Профиль не найден. Обратитесь к разработчикам для сообщения проблемы!');
    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
    const hoursLeft = Math.floor((24 * 60 * 60 * 1000 - (now - lastDaily)) / (60 * 60 * 1000));
    const embed = embedError(`Следующий ежедневный бонус будет доступен через ${hoursLeft} час(ов).`);
    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const roundedReward = reward.toFixed(2);

  await db.query('UPDATE discord_profiles SET dp = ?, last_daily = ? WHERE user_id = ?', [parseFloat(profile.dp) + parseFloat(roundedReward), now, interaction.user.id]);

  const embed = embedSuccess('🎉 Ежедневный бонус', `Вы получили ${roundedReward} DP! Возвращайтесь завтра за новой наградой.`);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
