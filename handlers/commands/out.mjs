import db from '../../db.mjs';

const role_list = {
/*    '1321092832823607306': {
        role_name: ['[GOV]', '[ПРА-ВО]'],
        role_id: `1321092832823607306`,
        words: ['[GOV]', '[ПРА-ВО]'],
    },
    '1321092834010595348': {
        role_name: ['[FBI]', '[ФБР]'],
        role_id: `1321092834010595348`,
        words: ['[FBI]', '[ФБР]'],
    },
    '1321092835528933476': {
        role_name: ['[LSPD]', '[ЛСПД]', '[LSSD]', '[RCSD]', '[ЛССД]', '[РКШД]', '[SFPD]', '[СФПД]', '[LVMPD]', '[ЛВМПД]'],
        role_id: `1321092835528933476`,
        words: ['[LSPD]', '[ЛСПД]', '[LSSD]', '[RCSD]', '[ЛССД]', '[РКШД]', '[SFPD]', '[СФПД]', '[LVMPD]', '[ЛВМПД]'],
    },
    '1321092837445468180': {
        role_name: ['[ФИК]', '[АНГ]', '[ANG]', '[VNG]', '[ВНГ]'],
        role_id: `1321092837445468180`,
        words: ['[ФИК]', '[АНГ]', '[ANG]', '[VNG]', '[ВНГ]'],
    },
    '1321092839295422547': {
        role_name: ['[FD]', '[ПД]'],
        role_id: `1321092839295422547`,
        words: ['[FD]', '[ПД]'],
    },
    '1321092840813498378': {
        role_name: ['[LSMC]', '[SFMC]', '[LVMC]', '[TC]', '[ЛСМЦ]', '[СФМЦ]', '[ЛВМЦ]', '[ТС]'],
        role_id: `1321092840813498378`,
        words: ['[LSMC]', '[SFMC]', '[LVMC]', '[TC]', '[ЛСМЦ]', '[СФМЦ]', '[ЛВМЦ]', '[ТС]'],
    },
    '1321092842021589063': {
        role_name: ['[CNN LS]', '[RLS]', '[R-LS]', '[CNN LV]', '[RLV]', '[R-LV]', '[CNN SF]', '[RSF]', '[R-SF]', '[РЛС]', '[Р-ЛС]', '[РЛВ]', '[Р-ЛВ]', '[РСФ]', '[Р-СФ]'],
        role_id: `1321092842021589063`,
        words: ['[CNN LS]', '[RLS]', '[R-LS]', '[CNN LV]', '[RLV]', '[R-LV]', '[CNN SF]', '[RSF]', '[R-SF]', '[РЛС]', '[Р-ЛС]', '[РЛВ]', '[Р-ЛВ]', '[РСФ]', '[Р-СФ]']
    },
    '1321092843389059145': {
        role_name: ['[RM]', '[РМ]'],
        role_id: `1321092843389059145`,
        words: ['[RM]', '[РМ]'],
    },
    '1321092844714201208': {
        role_name: ['[WMC]', '[ВМС]'],
        role_id: `1321092844714201208`,
        words: ['[WMC]', '[ВМС]'],
    },
    '1321092845758582824': {
        role_name: ['[LCN]', '[ЛКН]'],
        role_id: `1321092845758582824`,
        words: ['[LCN]', '[ЛКН]'],
    },
    '1321092846966538312': {
        role_name: ['[YAKUZA]', '[ЯКУДЗА]'],
        role_id: `1321092846966538312`,
        words: ['[YAKUZA]', '[ЯКУДЗА]'],
    },
    '1321092848287744020': {
        role_name: ['[TRB]', '[ТРБ]'],
        role_id: `1321092848287744020`,
        words: ['[TRB]', '[ТРБ]'],
    },
    '1321092849764270151': {
        role_name: ['[GROVE]', '[ГРУВ]'],
        role_id: `1321092849764270151`,
        words: ['[GROVE]', '[ГРУВ]'],
    },
    '1321092851186274317': {
        role_name: ['[BALLAS]', '[БАЛЛАС]'],
        role_id: `1321092851186274317`,
        words: ['[BALLAS]', '[БАЛЛАС]'],
    },
    '1321092852486508604': {
        role_name: ['[VAGOS]', '[ВАГОС]'],
        role_id: `1321092852486508604`,
        words: ['[VAGOS]', '[ВАГОС]'],
    },
    '1321092853669040209': {
        role_name: ['[AZTEC]', '[АЦТЕК]'],
        role_id: `1321092853669040209`,
        words: ['[AZTEC]', '[АЦТЕК]'],
    },
    '1321092856634671154': {
        role_name: ['[RIFA]', '[РИФА]'],
        role_id: `1321092856634671154`,
        words: ['[RIFA]', '[РИФА]'],
    },
    '1321092855002828810': {
        role_name: ['[NW]', '[НВ]'],
        role_id: `1321092855002828810`,
        words: ['[NW]', '[НВ]'],
    },*/
    '1321555638005796947': {
      role_name: ['[T1]', '[Т1]'],
      role_id: `1321555638005796947`,
      words: ['[T1]', '[Т1]'],
    },
    '1321555656083374080': {
      role_name: ['[T2]', '[Т2]'],
      role_id: `1321555656083374080`,
      words: ['[T2]', '[Т2]'],
    },
};

export async function handleOut(interaction) {
  const member = interaction.member;
  const roleIds = Object.values(role_list).map(role => role.role_id);
  const rolesToRemove = member.roles.cache.filter(role => roleIds.includes(role.id));
  const removedRoleMentions = rolesToRemove.map(role => `<@&${role.id}>`).join(', ');
      
  if (rolesToRemove.size === 0) return await interaction.reply({ content: "У вас нет ни одной из указанных ролей.", ephemeral: true });

  await member.roles.remove(rolesToRemove);
  await interaction.reply({ content: `Вы успешно сняли с себя следующие организационные роли: ${removedRoleMentions}`, ephemeral: true });
}
