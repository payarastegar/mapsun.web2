// scripts/postbuild.js - نسخه نهایی
import { rimraf } from 'rimraf';
import { glob } from 'glob';
import path from 'path';

// تابع اصلی را async تعریف می‌کنیم تا بتوانیم از await استفاده کنیم
async function deleteSourceMaps() {
  // ۱. الگو را همچنان با اسلش رو به جلو می‌سازیم که برای glob بهترین حالت است
  const pattern = path.posix.join(process.cwd(), 'build', '**', '*.map');
  console.log(`Searching for sourcemap files with pattern: ${pattern}`);

  try {
    // ۲. با استفاده از پکیج glob، لیست دقیق فایل‌ها را پیدا می‌کنیم
    const files = await glob(pattern, { nodir: true }); // nodir: true از انتخاب پوشه‌ها جلوگیری می‌کند

    if (files.length === 0) {
      console.log('No sourcemap files found to delete.');
      return;
    }

    console.log(`Found ${files.length} sourcemap files. Deleting...`);

    // ۳. لیست دقیق و بدون ابهام فایل‌ها را برای حذف به rimraf می‌دهیم
    await rimraf(files);

    console.log('Sourcemap files deleted successfully.');

  } catch (err) {
    console.error('An error occurred during postbuild script:', err);
    process.exit(1); // در صورت بروز خطا، با کد ارور خارج شو
  }
}

// تابع اصلی را اجرا می‌کنیم
deleteSourceMaps();