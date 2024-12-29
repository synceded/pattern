import { EmbedBuilder } from 'discord.js';
import db from '../../db.mjs';

export async function handleBank(interaction) {
  const amount = interaction.options.getInteger('amount');
  
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

  if (interaction.options.getSubcommand() === 'put') {
    const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.member.id]);
    const profile = rows[0];
    
    if (rows.length === 0) {
      const embed = embedError('Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!');
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (amount > profile.dp) {
      const embed = embedError('Недостаточно DP для того, чтобы положить их в банк!');
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await db.query('UPDATE discord_profiles SET dp_bank = ?, dp = ? WHERE user_id = ?', [amount + profile.dp_bank, profile.dp - amount, interaction.member.id]);
    const embed = embedSuccess('✅ Успешно', `Вы положили в банк ${amount} DP!`);
    await interaction.reply({ embeds: [embed], ephemeral: true });

  } else if (interaction.options.getSubcommand() === 'take') {
    const [rows] = await db.query('SELECT * FROM discord_profiles WHERE user_id = ?', [interaction.member.id]);
    const profile = rows[0];

    if (rows.length === 0) {
      const embed = embedError('Профиль не найден. Обратитесь к Разработчикам для сообщения проблемы!');
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (amount > profile.dp_bank) {
      const embed = embedError('Недостаточно DP для того, чтобы снять их с банка!');
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await db.query('UPDATE discord_profiles SET dp_bank = ?, dp = ? WHERE user_id = ?', [profile.dp_bank - amount, profile.dp + amount, interaction.member.id]);
    const embed = embedSuccess('✅ Успешно', `Вы сняли с банка ${amount} DP!`);
    await interaction.reply({ embeds: [embed], ephemeral: true });

  } else {
    const embed = embedError('Неизвестная подкоманда!');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
