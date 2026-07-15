/* eslint-disable @typescript-eslint/no-require-imports */
// Seed the CMS tables from the static defaults so the site works out of the box.
// Run with: bun run prisma/seed.ts

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const profile = {
  name: "Nguyễn Minh Anh",
  role: "Embedded Software Engineer",
  tagline: "Lập trình viên nhúng · RTOS · ARM Cortex · IoT",
  location: "TP. Hồ Chí Minh, Việt Nam",
  email: "minhanh.embedded@gmail.com",
  phone: "+84 912 345 678",
  website: "minhanh-embedded.dev",
  github: "github.com/minhanh-embedded",
  linkedin: "linkedin.com/in/minhanh-embedded",
  summary:
    "Kỹ sư phần mềm nhúng với hơn 6 năm kinh nghiệm thiết kế firmware và hệ thống thời gian thực cho vi điều khiển ARM Cortex-M, ESP32 và các nền tảng IoT. Đam mê tối ưu hóa tài nguyên phần cứng, viết code sạch và kiến trúc phần mềm có khả năng tái sử dụng cao. Đã triển khai thành công nhiều sản phẩm thương mại trong lĩnh vực IoT, tự động hóa công nghiệp và thiết bị y tế.",
  avatar: "/avatar.png",
};

const experiences = [
  {
    role: "Senior Embedded Software Engineer",
    company: "SmartIoT Solutions JSC",
    companyUrl: "https://smartiot.vn",
    period: "06/2022 — Hiện tại",
    location: "TP. HCM",
    description:
      "Dẫn dắt đội firmware 5 người phát triển nền tảng IoT cho thiết bị thông minh đô thị (smart metering, smart lighting).",
    highlights: [
      "Thiết kế kiến trúc firmware dựa trên FreeRTOS cho STM32L4, giảm 35% tiêu thụ năng lượng ở chế độ sleep.",
      "Triển khai OTA update an toàn với dual-bank flashing, đạt tỷ lệ thành công 99.8% trên 50k thiết bị thực tế.",
      "Tích hợp LoRaWAN Class C và BLE provisioning cho dòng sản phẩm smart meter.",
      "Xây dựng thư viện driver nội bộ chuẩn hóa, rút ngắn thời gian onboard dự án mới xuống 40%.",
    ],
    stack: ["STM32L4", "FreeRTOS", "LoRaWAN", "BLE", "MQTT", "C"],
  },
  {
    role: "Embedded Software Engineer",
    company: "AutoTech Industry Co.",
    companyUrl: "https://autotech.vn",
    period: "03/2020 — 05/2022",
    location: "Bình Dương",
    description:
      "Phát triển phần mềm điều khiển cho hệ thống tự động hóa công nghiệp và thiết bị đo lường.",
    highlights: [
      "Phát triển driver CAN bus và giao thức Modbus cho bộ điều khiển PLC nội bộ.",
      "Tối ưu thuật toán PID điều khiển động cơ servo, cải thiện độ chính xác định vị ±0.05mm.",
      "Triển khai HMI trên màn tactile dùng LVGL + STM32H7.",
      "Viết tài liệu kỹ thuật và hướng dẫn kiểm định CE/EMC cho sản phẩm.",
    ],
    stack: ["STM32H7", "CAN", "Modbus", "LVGL", "C++"],
  },
  {
    role: "Firmware Engineer",
    company: "MedDevice Lab",
    companyUrl: "https://meddevice.vn",
    period: "07/2018 — 02/2020",
    location: "TP. HCM",
    description:
      "Tham gia phát triển firmware cho thiết bị y tế theo tiêu chuẩn IEC 62304.",
    highlights: [
      "Phát triển firmware máy đo Spo2 dùng STM32 + cảm biến MAX30102.",
      "Triển khai giao thức HL7 gửi dữ liệu về hệ thống HIS của bệnh viện.",
      "Tham gia kiểm định an toàn y tế và viết tài liệu theo IEC 62304 lớp C.",
    ],
    stack: ["STM32F4", "FreeRTOS", "HL7", "C"],
  },
  {
    role: "Embedded Developer Intern",
    company: "MakerLab Vietnam",
    companyUrl: "https://makerlab.vn",
    period: "01/2018 — 06/2018",
    location: "Hà Nội",
    description:
      "Khởi đầu sự nghiệp với các dự án nguyên mẫu IoT và robot giáo dục.",
    highlights: [
      "Phát triển board robot giáo dục dựa trên ESP32, hỗ trợ lập trình khối bằng App.",
      "Đóng góp 15+ thư viện driver cảm biến mã nguồn mở trên GitHub.",
    ],
    stack: ["ESP32", "Arduino", "Python"],
  },
];

const projects = [
  {
    title: "Hệ thống Smart Meter LoRaWAN",
    category: "IoT · Năng lượng",
    image: "/project-1.png",
    description:
      "Đồng hồ điện thông minh đa pha với đo lường độ chính xác cao, truyền dữ liệu qua LoRaWAN và BLE provisioning cho phép cài đặt chỉ trong 30 giây.",
    features: [
      "Đo lường điện năng Class 1.0 theo IEC 62053",
      "OTA update dual-bank an toàn",
      "Tuổi thọ pin 10 năm ở chế độ báo cáo 15 phút/lần",
      "Dashboard quản lý thiết bị qua MQTT",
    ],
    tech: ["STM32L4", "FreeRTOS", "LoRaWAN", "BLE", "C"],
    link: "#",
    repo: "https://github.com/minhanh-embedded/smart-meter-lorawan",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Bộ kit Smart Home ESP32",
    category: "IoT · Consumer",
    image: "/project-2.png",
    description:
      "Bộ kit DIY cho nhà thông minh gồm gateway ESP32 và các module cảm biến không dây, tích hợp với Home Assistant và Matter.",
    features: [
      "Hỗ trợ Matter over Wi-Fi & Thread",
      "Cảm biến chuyển động, nhiệt độ, độ ẩm, khí gas",
      "Cấu hình qua web BLE beacon",
      "Tiêu thụ 18µA ở chế độ deep sleep",
    ],
    tech: ["ESP32-C6", "Zephyr", "Matter", "Thread", "C"],
    link: "#",
    repo: "https://github.com/minhanh-embedded/esp32-smarthome-kit",
    youtubeUrl: "",
  },
  {
    title: "Cánh tay robot 6 DOF công nghiệp",
    category: "Robotics · Tự động hóa",
    image: "/project-3.png",
    description:
      "Cánh tay robot 6 bậc tự do điều khiển servo BLDC, dùng cho gắp đặt linh kiện SMD trên dây chuyền sản xuất.",
    features: [
      "Điều khiển quỹ đạo điểm-điểm và Jog liên tục",
      "Giao thức giao tiếp CANopen",
      "HMI 7 inch dùng LVGL",
      "Độ lặp lại ±0.05mm",
    ],
    tech: ["STM32H7", "CANopen", "LVGL", "FreeRTOS", "C++"],
    link: "#",
    repo: "https://github.com/minhanh-embedded/robotic-arm-6dof",
    youtubeUrl: "",
  },
  {
    title: "Thiết bị đo SpO2 y tế",
    category: "Medical · Wearable",
    image: "/project-4.png",
    description:
      "Thiết bị đo nồng độ oxy trong máu không xâm lấn, được chứng nhận theo IEC 62304 lớp C, tích hợp gửi dữ liệu về hệ thống bệnh viện.",
    features: [
      "Cảm biến MAX30102 + lọc Kalman",
      "Hiển thị OLED 1.3 inch + đồ thị dạng sóng",
      "Gửi dữ liệu HL7 tới hệ thống HIS",
      "Pin 72h hoạt động liên tục",
    ],
    tech: ["STM32F4", "FreeRTOS", "HL7", "C"],
    link: "#",
    repo: "https://github.com/minhanh-embedded/spo2-medical",
    youtubeUrl: "",
  },
];

const posts = [
  {
    title: "Tối ưu tiêu thụ năng lượng trên STM32L4 với FreeRTOS Tickless",
    slug: "stm32l4-tickless-power",
    excerpt:
      "Cách cấu hình Tickless Idle mode để đưa MCU vào Stop mode giữa các tick, giảm tiêu thụ từ mA xuống µA.",
    content:
      "## Giới thiệu\n\nTiêu thụ năng lượng là chỉ số sống còn của thiết bị IoT chạy pin. Bài viết này chia sẻ cách tôi tối ưu dòng smart meter xuống **< 5µA** ở chế độ sleep.\n\n## Tickless Idle\n\nFreeRTOS hỗ trợ `configUSE_TICKLESS_IDLE`. Khi không có task sẵn sàng, kernel dừng tick và gọi `portSUPPRESS_TICKS_AND_SLEEP()`.\n\n```c\n#define configUSE_TICKLESS_IDLE 1\n#define configEXPECTED_IDLE_TIME_BEFORE_SLEEP 5\n```\n\n## Kết quả\n\n- Active: 8.2 mA\n- Sleep (Tickless): 4.7 µA\n- Stop mode (RTC): 1.1 µA\n\n## Kết luận\n\nTickless Idle là bước đầu tiên và dễ nhất để giảm năng lượng trên RTOS.",
    published: true,
  },
  {
    title: "Triển khai OTA an toàn với Dual-Bank và ECDSA",
    slug: "ota-dual-bank-ecdsa",
    excerpt:
      "Kiến trúc bootloader dual-bank với xác thực chữ ký ECDSA-P256 và cơ chế rollback tự động khi OTA thất bại.",
    content:
      "## Vì sao cần Dual-Bank?\n\nKhi firmware mới bị lỗi, thiết bị brick. Dual-Bank cho phép giữ firmware cũ chạy trong khi kiểm tra firmware mới ở bank dự phòng.\n\n## Quy trình\n\n1. Tải firmware mới vào **Bank B**\n2. Bootloader kiểm tra chữ ký ECDSA\n3. Hợp lệ → chuyển active bank; không hợp lệ → rollback\n\n## Kết quả thực tế\n\nTỷ lệ OTA thành công **99.8%** trên 50.000 thiết bị trong 18 tháng.",
    published: true,
  },
  {
    title: "5 lỗi phổ biến khi làm việc với I2C trên vi điều khiển",
    slug: "i2c-common-mistakes",
    excerpt:
      "Pull-up yếu, clock stretching, address conflict... Những cái bẫy tôi đã gặp và cách khắc phục.",
    content:
      "I2C đơn giản nhưng có nhiều cạm bẫy. Đây là 5 lỗi tôi gặp thường nhất:\n\n1. **Thiếu pull-up** — SDA/SCL phải có pull-up 4.7kΩ\n2. **Clock stretching quá lâu** — một số cảm biến stretch quá giới hạn\n3. **Tranh chấp bus** — nhiều master không được clock sync\n4. **Sai địa chỉ 7-bit vs 8-bit**\n5. **Noise do layout** — dây dài > 30cm cần giảm tốc độ\n\nLuôn dùng logic analyzer để debug I2C!",
    published: true,
  },
];

async function main() {
  // Profile (upsert singleton)
  await db.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: { id: "profile", ...profile },
  });
  console.log("✓ profile seeded");

  // Experiences
  await db.experience.deleteMany({});
  for (let i = 0; i < experiences.length; i++) {
    await db.experience.create({
      data: {
        ...experiences[i],
        order: i,
        highlights: JSON.stringify(experiences[i].highlights),
        stack: JSON.stringify(experiences[i].stack),
        companyUrl: experiences[i].companyUrl ?? null,
      },
    });
  }
  console.log(`✓ ${experiences.length} experiences seeded`);

  // Projects
  await db.project.deleteMany({});
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    await db.project.create({
      data: {
        title: p.title,
        category: p.category,
        description: p.description,
        features: JSON.stringify(p.features),
        tech: JSON.stringify(p.tech),
        image: p.image,
        youtubeUrl: p.youtubeUrl || null,
        link: p.link ?? null,
        repo: p.repo ?? null,
        order: i,
      },
    });
  }
  console.log(`✓ ${projects.length} projects seeded`);

  // Posts
  await db.post.deleteMany({});
  for (const post of posts) {
    await db.post.create({ data: post });
  }
  console.log(`✓ ${posts.length} posts seeded`);

  console.log("\n🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
