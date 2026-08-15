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

export type ProjectResponsibility = {
  title: string
  subtitle: string
  icon: string
}

export type ProjectResult = {
  number: string
  label: string
}

export type Project = {
  id?: string
  title: string
  subtitle?: string
  overviewQuote?: string
  year?: string
  role?: string
  highlight?: string
  projectType?: string
  responsibilities?: ProjectResponsibility[]
  results?: ProjectResult[]
  category: string
  image: string
  images?: string[]
  description: string
  features: string[]
  tech: string[]
  link?: string
  repo?: string
  youtubeUrl?: string
}

export const projects: Project[] = [
  {
    id: "smart-parking-aiot",
    title: "Nghiên cứu và triển khai hệ thống bãi đỗ xe thông minh ứng dụng AIoT",
    subtitle: "Một hệ thống AIoT kết hợp Computer Vision, Edge AI, ESP32, Raspberry Pi và Cloud để tự động nhận diện phương tiện, quản lý vị trí đỗ và điều khiển barrier.",
    category: "AIoT · Embedded",
    year: "2025 — 2026",
    role: "AIoT Engineer",
    highlight: "Edge AI & Embedded RTOS",
    projectType: "Research Project",
    overviewQuote: "Mục tiêu chính của kiến trúc là giảm độ trễ, giảm lượng dữ liệu phải truyền lên cloud và cho phép hệ thống tiếp tục hoạt động ngay cả khi kết nối Internet không ổn định.",
    description: "Dự án tập trung xây dựng một hệ thống bãi đỗ xe thông minh ứng dụng AIoT, trong đó phần xử lý AI được đưa xuống edge device thay vì phụ thuộc hoàn toàn vào cloud.\n\nCamera được sử dụng để thu thập hình ảnh phương tiện. Raspberry Pi thực hiện nhận diện phương tiện, xử lý biển số, xác định trạng thái vị trí đỗ và đưa ra quyết định điều khiển.",
    responsibilities: [
      {
        title: "Computer Vision",
        subtitle: "Xây dựng pipeline nhận diện phương tiện và xử lý hình ảnh.",
        icon: "Camera"
      },
      {
        title: "Edge AI",
        subtitle: "Tối ưu và triển khai inference trực tiếp trên Raspberry Pi 5.",
        icon: "Cpu"
      },
      {
        title: "ESP32 / Sensors",
        subtitle: "Kết nối cảm biến, barrier và các thiết bị ngoại vi.",
        icon: "Layers"
      },
      {
        title: "Cloud / Dashboard",
        subtitle: "Đồng bộ dữ liệu qua MQTT và Firebase Realtime Database.",
        icon: "Globe"
      }
    ],
    results: [
      { number: "93.0%", label: "Độ chính xác nhận diện" },
      { number: "< 2s", label: "Phản hồi barrier" },
      { number: "5+", label: "Thiết bị / node tích hợp" },
      { number: "Edge", label: "AI inference cục bộ" }
    ],
    features: [
      "Nhận diện phương tiện & biển số xe thời gian thực với YOLO",
      "Điều khiển Barrier tự động qua ESP32 & Relay",
      "Giám sát vị trí đỗ trống thời gian thực qua Web Dashboard",
      "Hoạt động offline-first bền bỉ khi mất kết nối mạng"
    ],
    tech: [
      "Raspberry Pi 5",
      "ESP32",
      "Python",
      "YOLO",
      "OpenCV",
      "MQTT",
      "Firebase",
      "React"
    ],
    image: "",
    images: [],
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    link: "https://phanhuynh.id.vn",
    repo: "https://github.com/minhtenlado"
  },
  {
    id: "autonomous-robot-navigation",
    title: "Hệ thống Robot tự động điều hướng thời gian thực",
    subtitle: "Robot tự hành ứng dụng cảm biến ToF, STM32 và thuật toán điều hướng môi trường động.",
    category: "Robotics",
    year: "2024 — 2025",
    role: "Robotics Engineer",
    highlight: "Real-time Navigation & ToF",
    projectType: "Hardware & Robotics",
    overviewQuote: "Tự động né tránh vật cản động và quy hoạch đường đi tối ưu với tần số phản hồi 100Hz.",
    description: "Robot sử dụng mảng cảm biến ToF kết hợp vi điều khiển STM32F4 để tính toán khoảng cách và phát hiện chướng ngại vật theo thời gian thực. Thuật toán điều hướng giúp robot di chuyển linh hoạt trong môi trường phức tạp.",
    responsibilities: [
      {
        title: "Lập trình nhúng STM32",
        subtitle: "Viết firmware điều khiển động cơ PID và đọc cảm biến ToF.",
        icon: "Cpu"
      },
      {
        title: "Thuật toán điều hướng",
        subtitle: "Xây dựng ma trận khoảng cách và né tránh vật cản động.",
        icon: "Layers"
      }
    ],
    results: [
      { number: "100Hz", label: "Tần số quét cảm biến" },
      { number: "< 10ms", label: "Độ trễ xử lý điều hướng" }
    ],
    features: [
      "Điều khiển động cơ với bộ điều khiển PID kín",
      "Định vị và quy hoạch đường đi tối ưu",
      "Truyền dữ liệu không dây qua NRF24L01 / Wi-Fi"
    ],
    tech: [
      "STM32F4",
      "ToF Sensors",
      "FreeRTOS",
      "C/C++",
      "PID Control"
    ],
    image: "",
    images: [],
    link: "https://phanhuynh.id.vn",
    repo: "https://github.com/minhtenlado"
  }
];

export type EducationItem = {
  degree: Record<"vi" | "en", string>
  school: Record<"vi" | "en", string>
  period: string
  detail: Record<"vi" | "en", string>
  logo?: string
}

export const educations: EducationItem[] = [
  {
    degree: { vi: "Kỹ sư Internet of Things và Trí tuệ nhân tạo ứng dụng", en: "Bachelor of Engineering in Internet of Things and Applied Artificial Intelligence" },
    school: { vi: "Trường Đại học Công nghiệp Thành phố Hồ Chí Minh", en: "Industrial University of Ho Chi Minh City" },
    period: "2022 – 2027",
    detail: { vi: "Khoa Công nghệ Điện tử. Chuyên ngành đào tạo chuyên sâu về hệ thống nhúng, lập trình vi điều khiển, mạng kết nối IoT, thiết kế mạch phần cứng và ứng dụng mô hình AI vào thực tế.", en: "Faculty of Electronics Technology. Major in IoT and Applied AI, focusing on embedded systems, edge AI networking, hardware circuit design, and intelligent automation solutions." }
  }
]

export type Certification = {
  name: string
  issuer: string
  year: string
}

export const certifications: Certification[] = [
  { name: "FreeRTOS Certified Engineer", issuer: "Real Time Engineers Ltd.", year: "2021" },
  { name: "LoRaWAN Academy Certificate", issuer: "Semtech", year: "2022" },
  { name: "Zephyr RTOS Training", issuer: "The Linux Foundation", year: "2023" },
  { name: "Embedded Linux Engineer", issuer: "Embedded Systems Academy", year: "2020" },
]

export type CodeSnippet = {
  id: string
  filename: string
  language: string
  title: string
  description: string
  code: string
}

export const codeSnippets: CodeSnippet[] = [
  {
    id: "blink-rtos",
    filename: "main.c",
    language: "c",
    title: "FreeRTOS Blink với Power Management",
    description:
      "Task nháy LED dùng FreeRTOS với chế độ Tickless Idle để tối ưu tiêu thụ năng lượng trên STM32L4.",
    code: `#include "stm32l4xx_hal.h"
#include "FreeRTOS.h"
#include "task.h"

/* Task nháy LED chu kỳ 1Hz, sleep giữa các lần chuyển trạng thái */
static void vLedTask(void *pvParameters) {
    (void)pvParameters;
    TickType_t last = xTaskGetTickCount();

    for (;;) {
        HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
        /* Tickless idle cho phép MCU vào Stop mode ở đây */
        vTaskDelayUntil(&last, pdMS_TO_TICKS(1000));
    }
}

int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();

    xTaskCreate(vLedTask, "LED", 128, NULL, tskIDLE_PRIORITY + 1, NULL);
    vTaskStartScheduler();   /* Không bao giờ trả về */
    for (;;) {}
}`,
  },
  {
    id: "i2c-driver",
    filename: "bme280_drv.c",
    language: "c",
    title: "Driver cảm biến BME280 qua I2C",
    description:
      "Driver portable tách biệt HAL, đọc nhiệt độ/độ ẩm/áp suất từ BME280 với hiệu chuẩn nhà sản xuất.",
    code: `#include "bme280.h"

/* Đọc thanh ghi dùng callback HAL — portable giữa các MCU */
static int8_t bme_read(uint8_t reg, uint8_t *buf, uint32_t len, void *intf) {
    const bme_intf_t *i = (const bme_intf_t *)intf;
    if (HAL_I2C_Mem_Read(i->hi2c, i->addr, reg,
                         I2C_MEMADD_SIZE_8BIT,
                         buf, len, 100) != HAL_OK) {
        return -1;
    }
    return 0;   /* BME280_OK */
}

int8_t bme280_measure(bme280_data_t *out) {
    uint8_t raw[8];
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
      "Văn Đô là một trong những kỹ sư firmware xuất sắc nhất tôi từng làm việc. Anh ấy đã đưa dòng smart meter của chúng tôi vào sản xuất đúng tiến độ, với mức tiêu thụ pin thấp hơn spec 35%.",
    name: "Trần Hoàng Long",
    title: "Engineering Manager",
    company: "SmartIoT Solutions JSC",
  },
  {
    quote:
      "Khả năng debug ở mức hardware của Văn Đô rất ấn tượng. Khi hệ thống gặp lỗi race condition hiếm gặp, anh ấy tìm ra nguyên nhân chỉ trong vài giờ dùng logic analyzer.",
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
      "Văn Đô hiểu sâu về cả firmware và phần cứng. Anh ấy góp ý trực tiếp vào schematic và giúp tối ưu layout cho tín hiệu cao tốc — điều hiếm thấy ở một lập trình viên.",
    name: "Võ Minh Tuấn",
    title: "PCB Design Lead",
    company: "SmartIoT Solutions JSC",
  },
]

export const navLinks = [
  { href: "/#about", vi: "Giới thiệu", en: "About" },
  { href: "/#projects", vi: "Dự án", en: "Projects" },
  { href: "/#posts", vi: "Bài viết", en: "Posts" },
]

export type NavLink = (typeof navLinks)[number]
