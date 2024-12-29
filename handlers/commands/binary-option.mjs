import { EmbedBuilder } from 'discord.js';
import db from '../../db.mjs';

export async function handleBinaryOption(interaction) {
  const direction = interaction.options.getString('direction');
  const amount = interaction.options.getInteger('amount');

  const [rows] = await db.query('SELECT dp FROM discord_profiles WHERE user_id = ?', [interaction.user.id]);
  const profile = rows[0];

  if (!profile || profile.dp < amount) {
    return await interaction.reply({
      content: '❌ У вас недостаточно средств для ставки!',
      ephemeral: true,
    });
  }

  // Случайный результат (выигрыш или проигрыш)
  const isWin = Math.random() < 0.5;
  const multiplier = 0.088; // Коэффициент выигрыша
  const courseChange = generateCourseChange();
  let resultMessage, finalColor;

  if (isWin && direction === courseChange.finalDirection) {
    const winAmount = amount * multiplier;
    const roundedWinAmount = Math.round(winAmount * 100) / 100;
    await db.query('UPDATE discord_profiles SET dp = ? WHERE user_id = ?', [profile.dp + roundedWinAmount, interaction.user.id]);
    resultMessage = `🎉 Вы выиграли! Ваш выигрыш: **${roundedWinAmount} DP**. Направление: **${direction.toUpperCase()}**.`;
    finalColor = '#00ff00';
  } else {
    await db.query('UPDATE discord_profiles SET dp = ? WHERE user_id = ?', [profile.dp - amount, interaction.user.id]);
    resultMessage = `💔 Вы проиграли. Ставка: **${amount} DP**. Направление: **${direction.toUpperCase()}**.`;
    finalColor = '#ff0000';
  }

  // Создание Embed для анимации
  const embed = new EmbedBuilder()
    .setTitle('📊 «Бинарный опцион»')
    .setDescription('Изменения курса:\n' + courseChange.visual)
    .setColor('#ffcc00'); // Желтый цвет, пока анимация идет

  // Отправка эмбеда для начала анимации
  const msg = await interaction.reply({
    embeds: [embed],
    ephemeral: false,
  });

  // Анимация повышения и понижения курса
  const interval = setInterval(() => {
    let visual = '';
    for (let i = 0; i < 4; i++) {
      const current = Math.random() < 0.5 ? '📈' : '📉';
      visual += ` ${current}`;
    }
    embed.setDescription(`Изменения курса:\n${visual}`);

    msg.edit({ embeds: [embed] });
  }, 500); // Каждый 500 миллисекунд обновляем

  // После 6 секунд заканчиваем анимацию и выводим финальный результат
  setTimeout(async () => {
    clearInterval(interval); // Останавливаем анимацию

    // Финальный Embed с результатом
    embed.setDescription(
      `Изменения курса:\n${courseChange.visual}\n\n${resultMessage}`
    )
    .setColor(finalColor);

    await msg.edit({ embeds: [embed] });
  }, 6000); // Анимация длится 6 секунд
}

function generateCourseChange() {
  const directions = ['📈', '📉'];
  let visual = '';
  let finalDirection = directions[Math.floor(Math.random() * directions.length)];

  for (let i = 0; i < 4; i++) {
    const current = directions[Math.floor(Math.random() * directions.length)];
    visual += ` ${current}`;
    if (i === 3) finalDirection = current === '📈' ? 'up' : 'down';
  }

  return { visual: visual.trim(), finalDirection };
}
