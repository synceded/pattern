-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Дек 30 2024 г., 01:22
-- Версия сервера: 10.5.23-MariaDB-0+deb11u1
-- Версия PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `gs68471`
--

-- --------------------------------------------------------

--
-- Структура таблицы `discord_families`
--

CREATE TABLE `discord_families` (
  `id` int(11) NOT NULL,
  `owner_id` varchar(32) NOT NULL,
  `role_id` varchar(32) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reputation` int(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `discord_family_members`
--

CREATE TABLE `discord_family_members` (
  `id` int(11) NOT NULL,
  `family_id` int(11) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `discord_profiles`
--

CREATE TABLE `discord_profiles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `username` varchar(100) NOT NULL,
  `dp` float(10,2) NOT NULL DEFAULT 0.00,
  `dp_bank` float(10,2) NOT NULL DEFAULT 0.00,
  `last_daily` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Структура таблицы `discord_role_requests`
--

CREATE TABLE `discord_role_requests` (
  `id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `role_id` varchar(20) NOT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `discord_statistic`
--

CREATE TABLE `discord_statistic` (
  `tickets_all` int(4) NOT NULL DEFAULT 0,
  `tickets_pending` int(1) NOT NULL DEFAULT 0,
  `tickets_closed` int(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `discord_tickets`
--

CREATE TABLE `discord_tickets` (
  `id` int(8) NOT NULL,
  `channel_id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `status` enum('pending','closed') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `discord_families`
--
ALTER TABLE `discord_families`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `discord_family_members`
--
ALTER TABLE `discord_family_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Индексы таблицы `discord_profiles`
--
ALTER TABLE `discord_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Индексы таблицы `discord_role_requests`
--
ALTER TABLE `discord_role_requests`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `discord_tickets`
--
ALTER TABLE `discord_tickets`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `discord_families`
--
ALTER TABLE `discord_families`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `discord_family_members`
--
ALTER TABLE `discord_family_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `discord_profiles`
--
ALTER TABLE `discord_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `discord_role_requests`
--
ALTER TABLE `discord_role_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT для таблицы `discord_tickets`
--
ALTER TABLE `discord_tickets`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
