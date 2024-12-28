import mysql from 'mysql2/promise'
import 'dotenv/config'

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE,
})

try {
  await db.connect()
  console.log(`[DB] Подключение к БД успешно!`)
} catch (e) {
  console.error(`[DB] Ошибка в подключении к БД: ${e}`)
}

export default db;