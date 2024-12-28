import db from '../../db.mjs';

export async function handleDaily(interaction) {
  const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.user.id]);
  const profile = rows[0];
  const now = new Date();
  const lastDaily = profile.last_daily ? new Date(profile.last_daily) : null;
  const reward = Math.floor(Math.random() * 10) + 1;

  if (rows.length === 0) return await interaction.reply({ content: 'Профиль не найден. Обратитесь к разработчикам для сообщения проблемы!', ephemeral: true});
  if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
    const hoursLeft = Math.floor((24 * 60 * 60 * 1000 - (now - lastDaily)) / (60 * 60 * 1000));
    return await interaction.reply({ content: `Cледующий ежедневный бонус будет доступен через ${hoursLeft} час(ов).`, ephemeral: true });
  }

  await db.query('UPDATE discord_profiles SET dp = ?, last_daily = ? WHERE user_id = ?', [profile.dp + reward, now, interaction.user.id]);
  await interaction.reply({ content: `Вы получили ${reward} DP! Возвращайтесь завтра за новой наградой.`, ephemeral: true });
}