import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 2000, // 连接超时
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
  process.exit(-1);
});

// 查询方法
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 查询耗时:', { duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ 查询错误:', error);
    throw error;
  }
};

// 获取客户端（用于事务）
export const getClient = () => {
  return pool.connect();
};

// 关闭连接池
export const closePool = async () => {
  await pool.end();
  console.log('🔌 数据库连接已关闭');
};

export default pool;
