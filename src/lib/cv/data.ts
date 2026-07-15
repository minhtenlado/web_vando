// Central CV data — single source of truth for the portfolio.
// All content is in Vietnamese, tailored for an Embedded Software Engineer.

export const profile = {
  name: "Nguyễn Minh Anh",
  role: "Embedded Software Engineer",
  tagline: "Lập trình viên nhúng · RTOS · ARM Cortex · IoT",
  location: "TP. Hồ Chí Minh, Việt Nam",
  email: "minhanh.embedded@gmail.com",
  phone: "+84 912 345 678",
  website: "minhanh-embedded.dev",
  github: "github.com/minhanh-embedded",
  linkedin: "linkedin.com/in/minhanh-embedded",
  available: true,
  avatar: "/avatar.png",
  summary:
    "Kỹ sư phần mềm nhúng với hơn 6 năm kinh nghiệm thiết kế firmware và hệ thống thời gian thực cho vi điều khiển ARM Cortex-M, ESP32 và các nền tảng IoT. Đam mê tối ưu hóa tài nguyên phần cứng, viết code sạch và kiến trúc phần mềm có khả năng tái sử dụng cao. Đã triển khai thành công nhiều sản phẩm thương mại trong lĩnh vực IoT, tự động hóa công nghiệp và thiết bị y tế.",
}

export type StatItem = {
  value: string
  label: string
}

export const stats: StatItem[] = [
  { value: "6+", label: "Năm kinh nghiệm" },
  { value: "40+", label: "Dự án hoàn thành" },
  { value: "12", label: "Sản phẩm thương mại" },
  { value: "8", label: "Loại MCU thành thạo" },
]

export type SkillGroup = {
  title: string
  icon: string
  skills: { name: string; level: number }[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Ngôn ngữ lập trình",
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
    title: "Vi điều khiển & Phần cứng",
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
    title: "RTOS & Middleware",
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
    title: "Giao tiếp & Giao thức",
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
    title: "Công cụ & DevOps",
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
    title: "Thiết kế phần cứng",
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
  role: string
  company: string
  period: string
  location: string
  description: string
  highlights: string[]
  stack: string[]
}

export const experiences: Experience[] = [
  {
    role: "Senior Embedded Software Engineer",
    company: "SmartIoT Solutions JSC",
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
  title: string
  category: string
  image: string
  description: string
  features: string[]
  tech: string[]
  link?: string
  repo?: string
}

export const projects: Project[] = [
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
    repo: "#",
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
    repo: "#",
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
  },
]

export type EducationItem = {
  degree: string
  school: string
  period: string
  detail: string
}

export const educations: EducationItem[] = [
  {
    degree: "Kỹ sư Điện tử - Viễn thông",
    school: "Đại học Bách Khoa TP.HCM",
    period: "2014 — 2018",
    detail:
      "Tốt nghiệp loại Giỏi, GPA 3.6/4.0. Đồ án: Hệ thống định vị trong nhà dùng UWB với sai số < 20cm.",
  },
  {
    degree: "Chứng chỉ ARM Accredited Engineer",
    school: "ARM Ltd.",
    period: "2020",
    detail:
      "Chứng chỉ chuyên môn về kiến trúc ARM Cortex-M và kỹ thuật tối ưu code.",
  },
  {
    degree: "Chứng chỉ Functional Safety (IEC 61508)",
    school: "TÜV SÜD Academy",
    period: "2023",
    detail:
      "Đào tạo về phát triển phần mềm an toàn chức năng SIL2/SIL3 cho hệ thống nhúng.",
  },
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

export const navLinks = [
  { href: "#about", label: "Giới thiệu" },
  { href: "#skills", label: "Kỹ năng" },
  { href: "#experience", label: "Kinh nghiệm" },
  { href: "#projects", label: "Dự án" },
  { href: "#education", label: "Học vấn" },
  { href: "#contact", label: "Liên hệ" },
]
