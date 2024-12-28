import db from '../../db.mjs';

export async function handleBank(interaction) {
  const amount = interaction.options.getInteger('amount')

  if (interaction.subCommand === 'put') {
    const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.member.id]);
    const profile = rows[0]
    if (rows.length === 0) return await interaction.reply({ content: 'Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!', ephemeral: true });
    if (amount > profile.dp) return await interaction.reply({ content: 'Недостаточно DP для того, чтобы положить их в банк!', ephemeral: true })

    await db.query('UPDATE discord_profiles SET dp_bank = ? WHERE user_id = ?', [amount+profile.dp_bank, interaction.member.id])
    await interaction.reply({ content: `Вы положили в банк ${amount} DP!`, ephemeral: true })
  } else if (interaction.subCommand === 'take') {
    const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.member.id]);
    const profile = rows[0]
    if (rows.length === 0) return await interaction.reply({ content: 'Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!', ephemeral: true });
    if (amount > profile.dp_bank) return await interaction.reply({ content: 'Недостаточно DP для того, чтобы снять их с банка!', ephemeral: true })

    await db.query('UPDATE discord_profiles SET dp_bank = ? WHERE user_id = ?', [amount-profile.dp_bank, interaction.member.id])
    await interaction.reply({ content: `Вы положили в банк ${amount} DP!`, ephemeral: true })
  } else {
    await interaction.reply({ content: 'Неизвестная подкоманда!', ephemeral: true });
  }
}