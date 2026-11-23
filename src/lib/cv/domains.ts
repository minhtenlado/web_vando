/** Presentation taxonomy shared by the homepage, project cards and project datasheets. */
export type DomainTone = 'cyan' | 'amber' | 'green' | 'violet' | 'pink' | 'blue';

export type Domain = {
  key: string
  tone: DomainTone
  vi: string
  en: string
  descriptionVi: string
  descriptionEn: string
}

/** Keys match the labels returned by `projectCategoryGroups`. */
export const DOMAINS: Domain[] = [
  { key: 'Embedded', tone: 'cyan', vi: 'Hệ thống nhúng', en: 'Embedded systems', descriptionVi: 'Firmware vi điều khiển, giao tiếp ngoại vi và xử lý tín hiệu thời gian thực.', descriptionEn: 'Microcontroller firmware, peripheral interfaces and real-time signal handling.' },
  { key: 'Hardware', tone: 'amber', vi: 'Thiết kế phần cứng', en: 'Hardware design', descriptionVi: 'Sơ đồ nguyên lý, PCB nhiều lớp, khối nguồn và hồ sơ sản xuất.', descriptionEn: 'Schematics, multi-layer PCBs, power stages and manufacturing files.' },
  { key: 'IoT', tone: 'green', vi: 'Internet vạn vật', en: 'Internet of Things', descriptionVi: 'Thiết bị kết nối, truyền dữ liệu không dây và hệ thống giám sát từ xa.', descriptionEn: 'Connected devices, wireless data links and remote monitoring.' },
  { key: 'AI', tone: 'violet', vi: 'Trí tuệ nhân tạo', en: 'Artificial intelligence', descriptionVi: 'Thị giác máy tính, học sâu và suy luận trên thiết bị biên.', descriptionEn: 'Computer vision, deep learning and on-device inference.' },
  { key: 'Robotics', tone: 'pink', vi: 'Robot tự hành', en: 'Robotics', descriptionVi: 'Động học, điều khiển chuyển động và mô phỏng robot.', descriptionEn: 'Kinematics, motion control and robot simulation.' },
  { key: 'Software', tone: 'blue', vi: 'Phần mềm', en: 'Software', descriptionVi: 'Ứng dụng web, công cụ xử lý dữ liệu và triển khai hệ thống.', descriptionEn: 'Web applications, data tooling and deployment.' },
];

export function domainFor(key: string): Domain | undefined {
  return DOMAINS.find((domain) => domain.key === key);
}

export function domainTone(key: string): DomainTone {
  return domainFor(key)?.tone ?? 'blue';
}

export const STATUS_LABELS: Record<string, { vi: string; en: string }> = {
  completed: { vi: 'Hoàn thành', en: 'Completed' },
  'in-development': { vi: 'Đang phát triển', en: 'In development' },
  prototype: { vi: 'Nguyên mẫu', en: 'Prototype' },
  research: { vi: 'Nghiên cứu', en: 'Research' },
};
