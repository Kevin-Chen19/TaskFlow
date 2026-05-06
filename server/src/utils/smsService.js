/**
 * 阿里云短信服务
 * 使用号码认证服务（Dypnsapi）
 */

import Dypnsapi20170525Pkg from '@alicloud/dypnsapi20170525';
import OpenApiPkg from '@alicloud/openapi-client';
import UtilPkg from '@alicloud/tea-util';

const { default: Dypnsapi20170525, SendSmsVerifyCodeRequest } = Dypnsapi20170525Pkg;
const { Config: OpenApiConfig } = OpenApiPkg;
const { RuntimeOptions } = UtilPkg;

// 短信签名和模板
const SMS_SIGN_NAME = process.env.ALIBABA_SMS_SIGN_NAME || 'TaskFlow';
const SMS_TEMPLATE_CODE = process.env.ALIBABA_SMS_TEMPLATE_CODE || '';

/**
 * 创建阿里云客户端
 * @returns {Dypnsapi20170525}
 */
function createClient() {
  const config = new OpenApiConfig({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || '',
  });
  config.endpoint = 'dypnsapi.aliyuncs.com';
  return new Dypnsapi20170525(config);
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendVerificationCode(phone, code) {
  try {
    const client = createClient();
    
    const request = new SendSmsVerifyCodeRequest({
      phoneNumber: phone,
      signName: SMS_SIGN_NAME,
      templateCode: SMS_TEMPLATE_CODE,
      templateParam: JSON.stringify({ code, min: '5' }),
    });
    
    const runtime = new RuntimeOptions({});
    const result = await client.sendSmsVerifyCodeWithOptions(request, runtime);
    
    console.log('短信发送结果:', result);
    
    // 根据返回结果判断是否成功
    if (result.statusCode === 200) {
      return { success: true, message: '发送成功' };
    } else {
      console.error('短信发送失败:', result);
      return { success: false, message: '发送失败' };
    }
  } catch (error) {
    console.error('短信发送异常:', error);
    // 错误 message
    console.log('错误信息:', error.message);
    // 诊断地址
    if (error.data && error.data["Recommend"]) {
      console.log('诊断地址:', error.data["Recommend"]);
    }
    return { success: false, message: error.message || '发送失败，请稍后重试' };
  }
}

/**
 * 生成6位数字验证码
 * @returns {string}
 */
export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
