// Central CV data — single source of truth for the portfolio.
// All content is in Vietnamese, tailored for an Embedded Software Engineer.

export const profile = {
  name: "Phan Huỳnh Văn Đô",
  role: "Kỹ sư Lập trình Nhúng, IoT & Edge AI",
  tagline: "Biến ý tưởng công nghệ thành những giải pháp thông minh và thực tế",
  location: "Phường Bình Thạnh, TP. Hồ Chí Minh, Việt Nam",
  email: "phanhuynhvando@gmail.com",
  phone: "+84 352820680",
  website: "phanhuynh.id.vn",
  github: "github.com/minhtenlado",
  linkedin: "linkedin.com/in/v%C4%83n-%C4%91%C3%B4/",
  available: true,
  avatar: "/uploads/avatar.jpg",
  summary: "Xin chào! Tôi là Phan Huỳnh Văn Đô, sinh viên năm cuối ngành IoT và Trí tuệ nhân tạo ứng dụng tại Trường Đại học Công nghiệp TP.HCM. Là một người đam mê hệ thống nhúng, robotics và công nghệ AI, tôi luôn hướng tới việc xây dựng các hệ thống xử lý thông minh và tối ưu cục bộ (offline-first). Với kinh nghiệm thực tế từ các dự án nghiên cứu như Hệ thống bãi đỗ xe thông minh (Smart Parking) hay thiết kế robot mô phỏng, tôi luôn sẵn sàng đón nhận những thách thức công nghệ mới để tạo ra các giải pháp tự động hóa hữu ích trong thế giới thực."
}

export type StatItem = {
  value: string
  label: Record<"vi" | "en", string>
}

export const stats: StatItem[] = [
  { value: "6+", label: { vi: "Năm kinh nghiệm", en: "Years of Experience" } },
  { value: "40+", label: { vi: "Dự án hoàn thành", en: "Projects Completed" } },
  { value: "12", label: { vi: "Sản phẩm thương mại", en: "Commercial Products" } },
  { value: "8", label: { vi: "Loại MCU thành thạo", en: "MCU Families Mastered" } },
]

export type SkillGroup = {
  title: Record<"vi" | "en", string>
  icon: string
  skills: { name: string; level: number }[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: { vi: "Ngôn ngữ lập trình", en: "Programming Languages" },
    icon: "code",
    skills: [
      { name: "C", level: 95 },
      { name: "C++", level: 88 },
      { name: "Python", level: 80 },
      { name: "Rust (nhúng)", level: 55 },
      { name: "Assembly (ARM)", level: 70 },
    ],
  },
  {
    title: { vi: "Vi điều khiển & Phần cứng", en: "Microcontrollers & Hardware" },
    icon: "cpu",
    skills: [
      { name: "STM32 (F1/F4/H7)", level: 92 },
      { name: "ESP32 / ESP8266", level: 90 },
      { name: "Nordic nRF52", level: 78 },
      { name: "Raspberry Pi RP2040", level: 72 },
      { name: "Arduino / AVR", level: 85 },
    ],
  },
  {
    title: { vi: "RTOS & Middleware", en: "RTOS & Middleware" },
    icon: "layers",
    skills: [
      { name: "FreeRTOS", level: 93 },
      { name: "Zephyr RTOS", level: 75 },
      { name: "ThreadX", level: 65 },
      { name: "LittlevGL (LVGL)", level: 82 },
      { name: "FatFS / LittleFS", level: 80 },
    ],
  },
  {
    title: { vi: "Giao tiếp & Giao thức", en: "Communication & Protocols" },
    icon: "radio",
    skills: [
      { name: "I2C / SPI / UART / CAN", level: 95 },
      { name: "MQTT / CoAP", level: 88 },
      { name: "BLE (Nordic SoftDevice)", level: 80 },
      { name: "LoRaWAN", level: 72 },
      { name: "Modbus RTU/TCP", level: 78 },
    ],
  },
  {
    title: { vi: "Công cụ & DevOps", en: "Tools & DevOps" },
    icon: "wrench",
    skills: [
      { name: "Keil / STM32CubeIDE", level: 92 },
      { name: "PlatformIO / GCC ARM", level: 88 },
      { name: "Git / GitLab CI", level: 85 },
      { name: "JTAG / SWD Debugging", level: 90 },
      { name: "Docker (build embedded)", level: 70 },
    ],
  },
  {
    title: { vi: "Thiết kế phần cứng", en: "Hardware Design" },
    icon: "circuit-board",
    skills: [
      { name: "Đọc schematic / PCB", level: 82 },
      { name: "KiCad / Altium (xem)", level: 70 },
      { name: "Oscilloscope / Logic Analyzer", level: 90 },
      { name: "Soldering / Rework", level: 78 },
      { name: "Power profiling", level: 80 },
    ],
  },
]

export type Experience = {
  id?: string
  role: string
  company: string
  companyUrl?: string
  period: string
  location: string
  description: string
  highlights: string[]
  stack: string[]
}

export const experiences: Experience[] = [
  {
    role: "Thực tập sinh Lập trình Nhúng & IoT",
    company: "Công ty TNHH giải pháp công nghệ Skytech",
    companyUrl: "https://skytechnology.vn/",
    period: "05/2026 – Hiện tại",
    location: "Việt Nam",
    description: "Tham gia nghiên cứu và phát triển các giải pháp chiếu sáng thông minh và thiết kế hệ thống IoT ứng dụng cho đô thị, công nghiệp. Tham gia lập trình firmware cho các thiết bị ngoại vi, tối ưu hóa giao thức kết nối và tích hợp hệ thống phần cứng điều khiển thông minh cục bộ.",
    highlights: [],
    stack: ["IoT", "Embedded Systems", "Smart Lighting", "Firmware", "Modbus", "Wi-Fi/Zigbee"]
  },
  {
    role: "Embedded Software Engineer",
    company: "AutoTech Industry Co.",
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
]

export type Project = {
  id?: string
  title: string
  category: string
  image: string
  description: string
  features: string[]
  tech: string[]
  link?: string
  repo?: string
  youtubeUrl?: string
}

export const projects: Project[] = [];
    if (bme_read(0xF7, raw, sizeof(raw), &g_intf) != 0)
        return -1;

    /* Bù hiệu chuẩn theo datasheet Rev 1.6 */
    out->temp  = bme280_compensate_T(raw[3] << 12 | raw[4] << 4 | raw[5] >> 4);
    out->press = bme280_compensate_P(raw[0] << 12 | raw[1] << 4 | raw[2] >> 4);
    out->hum   = bme280_compensate_H(raw[6] << 8  | raw[7]);
    return 0;
}`,
  },
  {
    id: "ota-update",
    filename: "ota_bootloader.c",
    language: "c",
    title: "OTA Dual-Bank Bootloader",
    description:
      "Bootloader kiểm tra chữ ký firmware ở bank dự phòng trước khi chuyển đổi — an toàn cho OTA từ xa.",
    code: `#define BANK_A  0x08000000U
#define BANK_B  0x08040000U

typedef enum { BANK_A_ACTIVE, BANK_B_PENDING } bank_state_t;

static int ota_verify_signature(uint32_t addr, size_t len) {
    /* ECDSA-P256 trên 64 byte SHA-256 của firmware */
    uint8_t digest[32];
    sha256_flash(addr, len, digest);
    return ecdsa_verify(digest, (const uint8_t*)addr + len, g_pubkey);
}

void boot_check_and_swap(void) {
    bank_state_t st = flash_read_state();

    if (st == BANK_B_PENDING) {
        size_t len = flash_read_image_len(BANK_B);
        if (ota_verify_signature(BANK_B, len) == 0) {
            flash_set_active_bank(BANK_B);     /* commit */
            log_info("OTA: switched to BANK_B");
        } else {
            log_err("OTA: signature invalid, rollback");
            flash_set_active_bank(BANK_A);     /* rollback */
        }
    }
    jump_to_app(flash_active_bank() == BANK_A ? BANK_A : BANK_B);
}`,
  },
]

export type Testimonial = {
  quote: string
  name: string
  title: string
  company: string
  avatar?: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Minh Anh là một trong những kỹ sư firmware xuất sắc nhất tôi từng làm việc. Anh ấy đã đưa dòng smart meter của chúng tôi vào sản xuất đúng tiến độ, với mức tiêu thụ pin thấp hơn spec 35%.",
    name: "Trần Hoàng Long",
    title: "Engineering Manager",
    company: "SmartIoT Solutions JSC",
  },
  {
    quote:
      "Khả năng debug ở mức hardware của Minh Anh rất ấn tượng. Khi hệ thống gặp lỗi race condition hiếm gặp, anh ấy tìm ra nguyên nhân chỉ trong vài giờ dùng logic analyzer.",
    name: "Lê Thu Hà",
    title: "Senior Hardware Engineer",
    company: "AutoTech Industry Co.",
  },
  {
    quote:
      "Code của anh ấy luôn sạch, có tài liệu đầy đủ và tuân thủ MISRA. Onboard một dự án mới với thư viện driver anh ấy viết nhanh hơn rất nhiều so với trước đây.",
    name: "Phạm Quốc Bảo",
    title: "Firmware Team Lead",
    company: "MedDevice Lab",
  },
  {
    quote:
      "Minh Anh hiểu sâu về cả firmware và phần cứng. Anh ấy góp ý trực tiếp vào schematic và giúp tối ưu layout cho tín hiệu cao tốc — điều hiếm thấy ở một lập trình viên.",
    name: "Võ Minh Tuấn",
    title: "PCB Design Lead",
    company: "SmartIoT Solutions JSC",
  },
]

export const navLinks = [
  { href: "#about", vi: "Giới thiệu", en: "About" },
  { href: "#skills", vi: "Kỹ năng", en: "Skills" },
  { href: "#experience", vi: "Kinh nghiệm", en: "Experience" },
  { href: "#projects", vi: "Dự án", en: "Projects" },
  { href: "#posts", vi: "Bài viết", en: "Posts" },
  { href: "#education", vi: "Học vấn", en: "Education" },
  { href: "#contact", vi: "Liên hệ", en: "Contact" },
]

export type NavLink = (typeof navLinks)[number]
