/**
 * 验证码存储服务
 * 使用内存存储，5分钟过期
 * 生产环境建议使用 Redis
 */

// 验证码存储 Map
const verifyCodes = new Map();

// 验证码有效期（5分钟）
const CODE_EXPIRE_TIME = 5 * 60 * 1000;

/**
 * 存储验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} type - 类型（login/register/reset）
 */
export function setCode(phone, code, type = 'login') {
  const key = `${type}:${phone}`;
  verifyCodes.set(key, {
    code,
    expireTime: Date.now() + CODE_EXPIRE_TIME,
    attempts: 0 // 验证尝试次数
  });
}

/**
 * 获取验证码
 * @param {string} phone - 手机号
 * @param {string} type - 类型
 * @returns {object|null}
 */
export function getCode(phone, type = 'login') {
  const key = `${type}:${phone}`;
  const record = verifyCodes.get(key);
  
  if (!record) return null;
  
  // 检查是否过期
  if (Date.now() > record.expireTime) {
    verifyCodes.delete(key);
    return null;
  }
  
  return record;
}

/**
 * 验证验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} type - 类型
 * @returns {boolean}
 */
export function verifyCode(phone, code, type = 'login') {
  const key = `${type}:${phone}`;
  const record = getCode(phone, type);
  
  if (!record) return false;
  
  // 增加尝试次数
  record.attempts++;
  
  // 最多允许3次尝试
  if (record.attempts > 3) {
    verifyCodes.delete(key);
    return false;
  }
  
  if (record.code === code) {
    // 验证成功，删除验证码
    verifyCodes.delete(key);
    return true;
  }
  
  return false;
}

/**
 * 删除验证码
 * @param {string} phone - 手机号
 * @param {string} type - 类型
 */
export function deleteCode(phone, type = 'login') {
  const key = `${type}:${phone}`;
  verifyCodes.delete(key);
}

/**
 * 清理过期的验证码
 */
function cleanExpiredCodes() {
  const now = Date.now();
  for (const [key, record] of verifyCodes.entries()) {
    if (now > record.expireTime) {
      verifyCodes.delete(key);
    }
  }
}

// 每10分钟清理一次过期的验证码
setInterval(cleanExpiredCodes, 10 * 60 * 1000);
