import { EmbedBuilder } from 'discord.js';
import db from '../../db.mjs';

const role_list = {
  '1321555638005796947': {
    role_name: ['[T1]', '[Т1]'],
    role_id: '1321555638005796947',
    words: ['[T1]', '[Т1]'],
  },
  '1321555656083374080': {
    role_name: ['[T2]', '[Т2]'],
    role_id: '1321555656083374080',
    words: ['[T2]', '[Т2]'],
  },
};

export async function handleOut(interaction) {
  const member = interaction.member;
  const roleIds = Object.values(role_list).map(role => role.role_id);
  const rolesToRemove = member.roles.cache.filter(role => roleIds.includes(role.id));
  const removedRoleMentions = rolesToRemove.map(role => `<@&${role.id}>`).join(', ');

  if (rolesToRemove.size === 0) {
    const embedNoRoles = new EmbedBuilder()
      .setTitle('❌ Роли не найдены')
      .setDescription('У вас нет ни одной из указанных организационных ролей.')
      .setColor('#ff0000');
    return await interaction.reply({ embeds: [embedNoRoles], ephemeral: true });
  }

  await member.roles.remove(rolesToRemove);

  const embedSuccess = new EmbedBuilder()
    .setTitle('✅ Роли удалены')
    .setDescription(`Вы успешно сняли с себя следующие организационные роли:\n${removedRoleMentions}`)
    .setColor('#00ff00');

  await interaction.reply({ embeds: [embedSuccess], ephemeral: true });
}
