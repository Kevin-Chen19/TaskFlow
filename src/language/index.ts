import { createI18n } from 'vue-i18n'; // 引入vue-i18n组件
import zh from './lang/zh';
import en from './lang/en';
const lang = 'zh';// 默认显示语音

const i18n = createI18n({
  locale: lang, //默认
  legacy: false, // 使用组合式 API
  messages: {
    zh, // 中文
    en // 英文
  }
});

export default i18n;
