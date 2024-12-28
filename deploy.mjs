import { REST, Routes } from 'discord.js';
import 'dotenv/config'

const commands = [
  {
    name: 'out',
    description: 'Снять с себя организационные роли',
  },
  {
    name: 'profile',
    description: 'Просмотреть свой профиль',
  },
  {
    name: 'bank',
    description: 'Операции с банком',
    options: [
      {
        name: 'take',
        description: 'Снять DP с банка',
        type: 1,
        options: [
          {
            name: 'amount',
            description: 'Количество',
            type: 4,
            required: true,
          }
        ]
      },
      {
        name: 'put',
        description: 'Положить DP в банк',
        type: 1,
        options: [
          {
            name: 'amount',
            description: 'Количество',
            type: 4,
            required: true,
          }
        ]
      }
    ]
  },
  {
    name: 'daily',
    description: 'Забрать ежедневную награду',
  },
  {
    name: 'family',
    description: 'Операции с семьей',
    options: [
      {
        name: 'list',
        description: 'Просмотреть список семей сервера',
        type: 1,
      },
      {
        name: 'info',
        description: 'Просмотреть информацию о семье',
        type: 1,
        options: [
          {
            name: 'fam',
            description: 'Семья',
            type: 3,
            required: true,
            autocomplete: true,
          },
        ]
      },
      {
        name: 'leave',
        description: 'Покинуть семью',
        type: 1,
        options: [
          {
            name: 'fam',
            description: 'Семья',
            type: 3,
            required: true,
          },
        ]
      },
      {
        name: 'kick',
        description: 'Выгнать участника из семьи',
        type: 1,
        options: [
          {
            name: 'user',
            description: 'Участник',
            type: 6,
            required: true,
          },
          {
            name: 'fam',
            description: 'Семья',
            type: 3,
            required: true,
          },
        ]
      },
      {
        name: 'invite',
        description: 'Пригласить пользователя в семью',
        type: 1,
        options: [
          {
            name: 'user',
            description: 'Участник',
            type: 6,
            required: true,
          },
          {
            name: 'fam',
            description: 'Семья',
            type: 3,
            required: true,
          },
        ]
      },
    ]
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}