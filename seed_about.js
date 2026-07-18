const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const principles = [
  {
    icon: "Terminal",
    title: { vi: "Code Sạch & Dễ Bảo Trì", en: "Clean & Maintainable Code" },
    desc: { 
      vi: "Tuân thủ MISRA C và các chuẩn lập trình an toàn. Thiết kế kiến trúc phần mềm modular để dễ dàng tái sử dụng và mở rộng.",
      en: "Adhere to MISRA C and secure coding standards. Design modular software architecture for easy reuse and scalability."
    }
  },
  {
    icon: "Zap",
    title: { vi: "Tối Ưu Hiệu Năng", en: "Performance Optimization" },
    desc: {
      vi: "Viết firmware chạy mượt mà với tài nguyên RAM/Flash tối thiểu. Sử dụng hiệu quả các chế độ Low Power để kéo dài tuổi thọ pin.",
      en: "Write firmware that runs smoothly with minimal RAM/Flash footprint. Effectively utilize Low Power modes to extend battery life."
    }
  },
  {
    icon: "ShieldCheck",
    title: { vi: "An Toàn & Đáng Tin Cậy", en: "Safety & Reliability" },
    desc: {
      vi: "Thiết kế hệ thống có khả năng chịu lỗi (fault-tolerant) với Watchdog, brown-out reset và các cơ chế xử lý lỗi chặt chẽ.",
      en: "Design fault-tolerant systems with Watchdog, brown-out reset, and robust error handling mechanisms."
    }
  },
  {
    icon: "Layers",
    title: { vi: "Tích Hợp Toàn Diện", en: "Full-Stack Integration" },
    desc: {
      vi: "Từ vi điều khiển lên tới Cloud. Đảm bảo dữ liệu từ cảm biến được xử lý và truyền tải chính xác đến server và dashboard.",
      en: "From microcontrollers to the Cloud. Ensure sensor data is processed and transmitted accurately to servers and dashboards."
    }
  }
];

const stats = [
  { value: "6+", label: { vi: "Năm kinh nghiệm", en: "Years of Experience" } },
  { value: "40+", label: { vi: "Dự án hoàn thành", en: "Projects Completed" } },
  { value: "12", label: { vi: "Sản phẩm thương mại", en: "Commercial Products" } },
  { value: "8", label: { vi: "Loại MCU thành thạo", en: "MCU Families Mastered" } }
];

const nowTextVi = "Hiện đang xây dựng nền tảng firmware thế hệ thứ 3 cho dòng smart meter, với mục tiêu đạt chứng nhận DLMS/COSEM trong quý tới.";
const nowTextEn = "Currently building the 3rd generation firmware platform for smart meters, aiming for DLMS/COSEM certification next quarter.";

async function seed() {
  await prisma.profile.updateMany({
    where: { locale: 'vi' },
    data: {
      principles: JSON.stringify(principles),
      stats: JSON.stringify(stats),
      nowText: nowTextVi
    }
  });
  
  await prisma.profile.updateMany({
    where: { locale: 'en' },
    data: {
      principles: JSON.stringify(principles),
      stats: JSON.stringify(stats),
      nowText: nowTextEn
    }
  });
  
  console.log("Seeded successfully");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
