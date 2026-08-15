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

export const defaultProfile = profile

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

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  published: boolean
  category: string
  coverImage?: string | null
  pdfUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  createdAt: string
  updatedAt: string
}

export const defaultPosts: Post[] = [
  {
    id: "default-post-1",
    slug: "luong-tu-hoa-mo-hinh-ai-tren-thiet-bi-bien",
    title: "Lượng tử hóa mô hình AI: Tối ưu và triển khai trên thiết bị biên",
    category: "AI",
    excerpt: "Phân tích kỹ thuật Post-Training Quantization (PTQ) và Quantization-Aware Training (QAT) để nén mô hình Computer Vision & Edge AI cho Raspberry Pi 5 và Jetson Nano.",
    content: `<h2>1. Giới thiệu tổng quan về Quantization</h2>
<p>Lượng tử hóa (Quantization) là kỹ thuật quan trọng giúp nén các mô hình Trí tuệ Nhân tạo (AI) bằng cách chuyển đổi trọng số (weights) và dữ liệu kích hoạt (activations) từ định dạng số thực dấu vết động 32-bit (FP32) sang định dạng số nguyên có độ chính xác thấp hơn như 8-bit (INT8) hoặc 4-bit (INT4).</p>

<h2>2. So sánh PTQ (Post-Training Quantization) và QAT (Quantization-Aware Training)</h2>
<ul>
  <li><strong>Post-Training Quantization (PTQ):</strong> Thực hiện lượng tử hóa sau khi mô hình đã hoàn tất huấn luyện. Phương pháp này đơn giản, không yêu cầu huấn luyện lại nhưng có thể suy giảm độ chính xác với các mô hình nhỏ.</li>
  <li><strong>Quantization-Aware Training (QAT):</strong> Mô phỏng sai số lượng tử hóa ngay trong quá trình huấn luyện mô hình. QAT giúp duy trì mAP (mean Average Precision) gần như tương đương với mô hình FP32 gốc.</li>
</ul>

<h2>3. Triển khai thực tế trên Raspberry Pi 5 với ONNX Runtime</h2>
<p>Dưới đây là đoạn mã Python thực thi việc chuyển đổi và suy luận mô hình YOLOv8 INT8 trên thiết bị biên:</p>

<pre><code class="language-python">import torch
from ultralytics import YOLO

# 1. Khởi tạo mô hình YOLOv8
model = YOLO("yolov8n.pt")

# 2. Export sang mô hình ONNX INT8 đã tối ưu hóa
model.export(format="onnx", int8=True, simplify=True)
print("Đã lượng tử hóa mô hình sang ONNX INT8 thành công!")
</code></pre>

<h2>4. Kết quả Thực nghiệm & Hiệu năng</h2>
<p>Qua đánh giá thực tế trên vi xử lý ARM Cortex-A76 của Raspberry Pi 5:</p>
<ul>
  <li>Dung lượng mô hình giảm từ 12.5 MB (FP32) xuống còn 3.2 MB (INT8).</li>
  <li>Tốc độ suy luận (Inference Speed) tăng từ 12 FPS lên 38 FPS.</li>
  <li>Mức tiêu thụ năng lượng giảm hơn 40%, đáp ứng tốt các ứng dụng chạy pin/năng lượng mặt trời.</li>
</ul>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "Lượng tử hóa mô hình AI trên thiết bị biên — Phan Huỳnh Văn Đô",
    seoDescription: "Hướng dẫn kỹ thuật nén mô hình AI với PTQ & QAT triển khai trên Raspberry Pi 5 và Jetson Nano.",
    seoKeywords: "Quantization, Edge AI, Raspberry Pi 5, YOLOv8, ONNX, TensorRT, Embedded AI",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "default-post-2",
    slug: "toi-uu-hoa-freertos-tren-vi-dieu-khien-stm32",
    title: "Xây dựng Firmware Hệ thống Nhúng Thời gian Thực với FreeRTOS và STM32",
    category: "embedded",
    excerpt: "Phương pháp thiết kế kiến trúc đa nhiệm, quản lý bộ nhớ Heap, cơ chế đồng bộ Semaphore/Mutex và chiến lược tối ưu năng lượng với Tickless Idle trên vi điều khiển STM32.",
    content: `<h2>1. Đặt vấn đề trong Lập trình Nhúng Thời gian Thực</h2>
<p>Khi ứng dụng nhúng phát triển phức tạp đòi hỏi xử lý nhiều nhiệm vụ đồng thời như đọc dữ liệu cảm biến, quản lý màn hình HMI và giao tiếp mạng, kiến trúc Super Loop (Bare-metal) trở nên khó duy trì và dễ bị nghẽn hệ thống. Hệ điều hành thời gian thực (FreeRTOS) giúp phân chia ứng dụng thành các Tác vụ (Tasks) độc lập với độ ưu tiên rõ ràng.</p>

<h2>2. Quản lý Bộ nhớ Heap & Tránh Phân mảnh</h2>
<p>Trong FreeRTOS, việc lựa chọn trình quản lý bộ nhớ phù hợp quyết định tính ổn định dài hạn của thiết bị nhúng:</p>
<ul>
  <li><strong>heap_4.c:</strong> Thuật toán First-Fit kết hợp gộp các ô nhớ trống kề nhau, tránh phân mảnh bộ nhớ hiệu quả cho ứng dụng cấp phát tĩnh/động linh hoạt.</li>
  <li><strong>Stack Watermark Checking:</strong> Sử dụng hàm <code>uxTaskGetStackHighWaterMark()</code> để theo dõi mức tiêu thụ Stack thực tế của từng Task.</li>
</ul>

<h2>3. Ví dụ Mã nguồn: Đồng bộ hóa Task bằng Binary Semaphore</h2>
<pre><code class="language-c">#include "FreeRTOS.h"
#include "task.h"
#include "semphr.h"

SemaphoreHandle_t xSensorSemaphore;

void vSensorISR_Handler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    // Phát tín hiệu Semaphore từ ISR ngắt ngoại vi
    xSemaphoreGiveFromISR(xSensorSemaphore, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void vProcessingTask(void *pvParameters) {
    for (;;) {
        if (xSemaphoreTake(xSensorSemaphore, portMAX_DELAY) == pdTRUE) {
            // Xử lý dữ liệu ngay khi ngắt hoàn tất
            HAL_GPIO_TogglePin(GPIOD, GPIO_PIN_12);
        }
    }
}
</code></pre>

<h2>4. Kết luận</h2>
<p>Áp dụng chuẩn thiết kế RTOS giúp nâng cao độ tin cậy của firmware trong các thiết bị công nghiệp và y tế đòi hỏi tiêu chuẩn khắt khe.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "Tối ưu hóa FreeRTOS trên STM32 — Phan Huỳnh Văn Đô",
    seoDescription: "Hướng dẫn xây dựng firmware hệ thống nhúng thời gian thực với FreeRTOS và vi điều khiển STM32.",
    seoKeywords: "FreeRTOS, STM32, Embedded Systems, RTOS, Firmware, C Language, Semaphore, Mutex",
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "default-post-3",
    slug: "xay-dung-he-thong-iot-offline-first-mqtt-esp32",
    title: "Xây dựng Hệ thống IoT Offline-First với Giao thức MQTT & ESP32",
    category: "IOT",
    excerpt: "Giải pháp kiến trúc mạng cảm biến không dây với cơ chế đệm dữ liệu cục bộ, đảm bảo hệ thống hoạt động ổn định và không mất dữ liệu khi mất kết nối Internet.",
    content: `<h2>1. Thách thức Mạng trong IoT Công nghiệp</h2>
<p>Trong các môi trường công nghiệp hoặc nông nghiệp thông minh, kết nối mạng Internet thường bị gián đoạn. Thiết kế hệ thống IoT phụ thuộc vào Cloud có thể gây mất mát dữ liệu cảm biến quan trọng. Kiến trúc Offline-First giải quyết triệt để vấn đề này.</p>

<h2>2. Kiến trúc Publish/Subscribe và Local Gateway Bridge</h2>
<ul>
  <li><strong>ESP32 Sensor Nodes:</strong> Thu thập dữ liệu môi trường và gửi gói tin MQTT QoS 1 đến Local Broker.</li>
  <li><strong>Local Broker (Mosquitto / EMQX):</strong> Chạy trên Local Gateway (Raspberry Pi) đóng vai trò trung gian lưu trữ đệm.</li>
  <li><strong>MQTT Bridge:</strong> Tự động đẩy toàn bộ dữ liệu tồn đọng lên Cloud ngay khi đường truyền kết nối lại thành công.</li>
</ul>

<h2>3. Mã nguồn ESP32 Quản lý Đệm Dữ liệu khi Mất Mạng</h2>
<pre><code class="language-cpp">#include &lt;WiFi.h&gt;
#include &lt;PubSubClient.h&gt;

WiFiClient espClient;
PubSubClient client(espClient);

void connectToBroker() {
    while (!client.connected()) {
        if (client.connect("ESP32_Gateway_Node")) {
            Serial.println("Đã kết nối thành công đến MQTT Broker cục bộ!");
        } else {
            delay(2000);
        }
    }
}
</code></pre>

<h2>4. Kết luận</h2>
<p>Mô hình Offline-First giúp gia tăng độ bền vững và tính sẵn sàng của toàn bộ hạ tầng IoT doanh nghiệp.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "Hệ thống IoT Offline-First với MQTT & ESP32 — Phan Huỳnh Văn Đô",
    seoDescription: "Thiết kế kiến trúc IoT Offline-First với MQTT Broker cục bộ và vi điều khiển ESP32.",
    seoKeywords: "IoT, MQTT, ESP32, Offline-First, Embedded IoT, Wireless Sensor Networks",
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "default-post-4",
    slug: "dieu-huong-robot-amr-voi-ros2-humble-va-lidar",
    title: "Điều hướng Robot Di động Tự hành (AMR) với ROS2 Humble và LiDAR",
    category: "ROS2",
    excerpt: "Quy trình thiết kế Nav2 pipeline, định vị SLAM Cartographer và giao tiếp micro-ROS với STM32 điều khiển động cơ PID cho robot AMR trong nhà kho thông minh.",
    content: `<h2>1. Giới thiệu về Robot AMR và ROS2 Humble</h2>
<p>Robot di động tự hành (AMR) trong logistics đòi hỏi khả năng định vị chính xác và quy hoạch đường đi linh hoạt trong môi trường nhà kho thay đổi liên tục. Khung làm việc ROS2 Humble tích hợp chuẩn giao tiếp DDS giúp truyền nhận dữ liệu cảm biến thời gian thực với độ trễ cực thấp.</p>

<h2>2. Tích hợp SLAM Cartographer và Nav2 Stack</h2>
<ul>
  <li><strong>Cartographer SLAM:</strong> Tạo bản đồ 2D Grid Map từ dữ liệu quét của cảm biến 2D LiDAR.</li>
  <li><strong>Nav2 Navigation:</strong> Quy hoạch đường đi toàn cục (Global Planner) và tránh vật cản cục bộ (Local Planner - DWB controller).</li>
  <li><strong>micro-ROS Bridge:</strong> Gửi lệnh vận tốc <code>cmd_vel</code> xuống mạch điều khiển STM32.</li>
</ul>

<h2>3. Đoạn mã C++ micro-ROS trên STM32</h2>
<pre><code class="language-cpp">#include &lt;rcl/rcl.h&gt;
#include &lt;geometry_msgs/msg/twist.h&gt;

// Hàm callback nhận lệnh cmd_vel từ ROS2 Nav2
void cmd_vel_callback(const void * msincoming) {
    const geometry_msgs__msg__Twist * msg = (const geometry_msgs__msg__Twist *)msincoming;
    float linear_x = msg-&gt;linear.x;
    float angular_z = msg-&gt;angular.z;
    
    // Điều khiển động cơ qua thuật toán PID vòng kín
    update_motor_pwm(linear_x, angular_z);
}
</code></pre>

<h2>4. Kết luận</h2>
<p>Ứng dụng ROS2 và micro-ROS mang lại khả năng mở rộng tuyệt vời cho các hệ thống Robotics công nghiệp hiện đại.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "Điều hướng Robot AMR với ROS2 Humble — Phan Huỳnh Văn Đô",
    seoDescription: "Hướng dẫn tích hợp ROS2 Humble, Cartographer SLAM và Nav2 cho Robot AMR tự hành.",
    seoKeywords: "ROS2, AMR, Robotics, LiDAR, SLAM, Nav2, micro-ROS, STM32",
    createdAt: "2025-12-20T08:00:00.000Z",
    updatedAt: "2025-12-20T08:00:00.000Z",
  },
]

export const defaultPostsEn: Post[] = [
  {
    id: "default-post-en-1",
    slug: "ai-model-quantization-edge-optimization",
    title: "AI Model Quantization: Edge Optimization and Deployment",
    category: "AI",
    excerpt: "An in-depth analysis of Post-Training Quantization (PTQ) and Quantization-Aware Training (QAT) to compress Computer Vision & Edge AI models for Raspberry Pi 5 and Jetson Nano.",
    content: `<h2>1. Introduction to Model Quantization</h2>
<p>Quantization is an essential compression technique that transforms Artificial Intelligence (AI) model weights and activations from 32-bit floating-point (FP32) to lower-precision integer representations such as 8-bit (INT8) or 4-bit (INT4).</p>

<h2>2. PTQ (Post-Training Quantization) vs QAT (Quantization-Aware Training)</h2>
<ul>
  <li><strong>Post-Training Quantization (PTQ):</strong> Quantizes weights after full model training. Fast and straightforward, though slight accuracy degradation may occur on smaller architectures.</li>
  <li><strong>Quantization-Aware Training (QAT):</strong> Simulates quantization error during training, preserving near-FP32 accuracy for INT8 deployments.</li>
</ul>

<h2>3. Raspberry Pi 5 Deployment with ONNX Runtime</h2>
<p>Python snippet exporting and inferencing a INT8 YOLOv8 model on edge hardware:</p>

<pre><code class="language-python">import torch
from ultralytics import YOLO

# 1. Initialize YOLOv8 model
model = YOLO("yolov8n.pt")

# 2. Export to optimized INT8 ONNX format
model.export(format="onnx", int8=True, simplify=True)
print("Successfully quantized model to INT8 ONNX!")
</code></pre>

<h2>4. Empirical Results & Performance Benchmark</h2>
<p>Evaluated on the ARM Cortex-A76 processor of Raspberry Pi 5:</p>
<ul>
  <li>Model size reduced from 12.5 MB (FP32) to 3.2 MB (INT8).</li>
  <li>Inference speed increased from 12 FPS to 38 FPS.</li>
  <li>Power consumption decreased by over 40%, ideal for battery-powered setups.</li>
</ul>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "AI Model Quantization on Edge Devices — Phan Huỳnh Văn Đô",
    seoDescription: "Technical guide on PTQ & QAT model compression for Raspberry Pi 5 and Jetson Nano.",
    seoKeywords: "Quantization, Edge AI, Raspberry Pi 5, YOLOv8, ONNX, TensorRT, Embedded AI",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "default-post-en-2",
    slug: "real-time-embedded-firmware-freertos-stm32",
    title: "Building Real-Time Embedded Systems Firmware with FreeRTOS and STM32",
    category: "embedded",
    excerpt: "Multitasking architecture design, Heap memory management, Semaphore/Mutex synchronization, and Low-Power Tickless Idle optimization on STM32 microcontrollers.",
    content: `<h2>1. Real-Time Embedded Programming Challenges</h2>
<p>As embedded applications grow complex—simultaneously managing sensor polling, HMI displays, and wireless protocol stacks—the traditional Bare-metal Super Loop architecture becomes difficult to maintain. FreeRTOS structures code into independent Tasks with explicit priorities.</p>

<h2>2. Heap Memory Management & Fragmentation Avoidance</h2>
<p>Selecting the right memory scheme ensures long-term system stability:</p>
<ul>
  <li><strong>heap_4.c:</strong> First-fit algorithm with adjacent free-block coalescing, minimizing fragmentation during dynamic memory allocations.</li>
  <li><strong>Stack Watermark Monitoring:</strong> Utilizing <code>uxTaskGetStackHighWaterMark()</code> to verify real-time stack consumption per task.</li>
</ul>

<h2>3. Code Example: Task Synchronization via Binary Semaphore</h2>
<pre><code class="language-c">#include "FreeRTOS.h"
#include "task.h"
#include "semphr.h"

SemaphoreHandle_t xSensorSemaphore;

void vSensorISR_Handler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xSemaphoreGiveFromISR(xSensorSemaphore, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void vProcessingTask(void *pvParameters) {
    for (;;) {
        if (xSemaphoreTake(xSensorSemaphore, portMAX_DELAY) == pdTRUE) {
            HAL_GPIO_TogglePin(GPIOD, GPIO_PIN_12);
        }
    }
}
</code></pre>

<h2>4. Conclusion</h2>
<p>Adopting proper RTOS design patterns guarantees robust firmware execution across industrial and medical devices.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "FreeRTOS STM32 Optimization — Phan Huỳnh Văn Đô",
    seoDescription: "Guide to building real-time embedded firmware using FreeRTOS and STM32 microcontrollers.",
    seoKeywords: "FreeRTOS, STM32, Embedded Systems, RTOS, Firmware, C Language, Semaphore, Mutex",
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "default-post-en-3",
    slug: "offline-first-iot-architecture-mqtt-esp32",
    title: "Architecting Offline-First IoT Systems with MQTT & ESP32",
    category: "IOT",
    excerpt: "Designing resilient wireless sensor networks with local data buffering, ensuring reliable operation without data loss during network outages.",
    content: `<h2>1. Networking Challenges in Industrial IoT</h2>
<p>In industrial and smart agriculture environments, internet connectivity can be spotty. Cloud-dependent IoT architectures risk critical sensor data loss during dropouts. An Offline-First architecture solves this problem natively.</p>

<h2>2. Publish/Subscribe Architecture & Local Gateway Bridge</h2>
<ul>
  <li><strong>ESP32 Sensor Nodes:</strong> Collect environmental metrics and publish MQTT QoS 1 packets to the local broker.</li>
  <li><strong>Local Broker (Mosquitto / EMQX):</strong> Operates on a local Raspberry Pi gateway as a storage buffer.</li>
  <li><strong>MQTT Bridge:</strong> Automatically flushes queued messages to the Cloud once WAN connectivity is restored.</li>
</ul>

<h2>3. ESP32 Offline Buffer Management Code</h2>
<pre><code class="language-cpp">#include &lt;WiFi.h&gt;
#include &lt;PubSubClient.h&gt;

WiFiClient espClient;
PubSubClient client(espClient);

void connectToBroker() {
    while (!client.connected()) {
        if (client.connect("ESP32_Gateway_Node")) {
            Serial.println("Connected to local MQTT Broker!");
        } else {
            delay(2000);
        }
    }
}
</code></pre>

<h2>4. Conclusion</h2>
<p>The Offline-First approach significantly enhances system availability and resilience across enterprise IoT deployments.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "Offline-First IoT System with MQTT & ESP32 — Phan Huỳnh Văn Đô",
    seoDescription: "Designing offline-first IoT architecture with local MQTT brokers and ESP32 nodes.",
    seoKeywords: "IoT, MQTT, ESP32, Offline-First, Embedded IoT, Wireless Sensor Networks",
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "default-post-en-4",
    slug: "autonomous-mobile-robot-navigation-ros2-humble",
    title: "Autonomous Mobile Robot (AMR) Navigation with ROS2 Humble & LiDAR",
    category: "ROS2",
    excerpt: "Designing Nav2 pipelines, Cartographer SLAM, and micro-ROS communication with STM32 motor controllers for smart warehouse AMRs.",
    content: `<h2>1. Overview of Autonomous Mobile Robots (AMR)</h2>
<p>Logistics AMRs require precise indoor mapping and dynamic obstacle avoidance. ROS2 Humble built upon DDS infrastructure delivers low-latency real-time communication for robotic sub-systems.</p>

<h2>2. Cartographer SLAM & Nav2 Stack Integration</h2>
<ul>
  <li><strong>Cartographer SLAM:</strong> Constructs 2D occupancy grid maps from 2D LiDAR scans.</li>
  <li><strong>Nav2 Navigation:</strong> Handles global path planning and local obstacle avoidance (DWB controller).</li>
  <li><strong>micro-ROS Bridge:</strong> Streams <code>cmd_vel</code> velocity commands to the STM32 motor driver.</li>
</ul>

<h2>3. C++ micro-ROS Driver Snippet on STM32</h2>
<pre><code class="language-cpp">#include &lt;rcl/rcl.h&gt;
#include &lt;geometry_msgs/msg/twist.h&gt;

void cmd_vel_callback(const void * msincoming) {
    const geometry_msgs__msg__Twist * msg = (const geometry_msgs__msg__Twist *)msincoming;
    float linear_x = msg-&gt;linear.x;
    float angular_z = msg-&gt;angular.z;
    
    update_motor_pwm(linear_x, angular_z);
}
</code></pre>

<h2>4. Conclusion</h2>
<p>Integrating ROS2 and micro-ROS provides unparalleled scalability for industrial mobile robotics.</p>`,
    published: true,
    coverImage: "/uploads/avatar.jpg",
    seoTitle: "AMR Navigation with ROS2 Humble — Phan Huỳnh Văn Đô",
    seoDescription: "Integrating ROS2 Humble, Cartographer SLAM, and Nav2 for autonomous mobile robots.",
    seoKeywords: "ROS2, AMR, Robotics, LiDAR, SLAM, Nav2, micro-ROS, STM32",
    createdAt: "2025-12-20T08:00:00.000Z",
    updatedAt: "2025-12-20T08:00:00.000Z",
  },
]

