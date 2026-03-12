import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { TextDecoder } from 'util';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保 uploads 文件夹存在
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ uploads 文件夹已创建');
}

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 存储到 uploads 文件夹
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一的文件名：时间戳 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  console.log('=== 文件过滤器 ===');
  console.log('文件名:', file.originalname);
  console.log('文件类型 (MIME):', file.mimetype);

  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  // 临时允许所有文件类型（调试用）
  cb(null, true);
  /*
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('拒绝文件类型:', file.mimetype);
    cb(new Error('不支持的文件类型: ' + file.mimetype), false);
  }
  */
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
  },
  // 添加文件名编码处理
  fileEncoding: 'utf8'
});

export default upload;
