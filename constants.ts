import { TaskItem } from "./types";

export const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const getBaseSchedule = (dayIdx: number): TaskItem[] => {
    // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    const isGymDay = [1, 3, 5].includes(dayIdx); // T2, T4, T6
    const isClayMaskDay = [2, 6].includes(dayIdx); // T3, T7
    const isYogaDay = [4, 0].includes(dayIdx); // T5, CN

    // --- BUỔI SÁNG CỐ ĐỊNH (Tất cả các ngày) ---
    // Tuy nhiên, Chủ Nhật có lịch riêng từ 6:30
    let list: TaskItem[] = [
        { s: "05:00", e: "05:15", n: "Nghe nhạc để tỉnh ngủ", c: "health" },
        { s: "05:15", e: "05:25", n: "Nấu gừng, pha nước chanh", c: "health" },
        { s: "05:25", e: "05:40", n: "VSCN", c: "health" },
        { s: "05:40", e: "06:30", n: "Ăn sáng", c: "health" },
    ];

    // --- CHỦ NHẬT (Lên rừng) ---
    if (dayIdx === 0) {
        list.push({ s: "06:30", e: "19:00", n: "Lên rừng, ăn uống, chụp ảnh", c: "health" });
        list.push({ s: "19:00", e: "20:00", n: "Nghỉ ngơi", c: "health" });
        // Chủ nhật có Yoga (theo yêu cầu)
        list.push({ s: "20:00", e: "20:30", n: "Tập Yoga", c: "beauty" });
        list.push({ s: "20:30", e: "20:45", n: "Bỏ mùng", c: "health" });
        list.push({ s: "20:45", e: "21:00", n: "Xử lý phát sinh", c: "work" });
        list.push({ s: "21:00", e: "21:00", n: "Đi ngủ", c: "health" });
        
        return list.sort((a, b) => parseInt(a.s) - parseInt(b.s));
    }

    // --- CÁC NGÀY TRONG TUẦN (T2 - T7) ---
    
    // Giờ hành chính
    list.push(
        { s: "06:30", e: "10:30", n: "Làm việc tập trung", c: "work" },
        { s: "10:30", e: "11:00", n: "Xử lý phát sinh", c: "work" },
        { s: "11:00", e: "11:45", n: "Nấu ăn", c: "health" },
        { s: "11:45", e: "12:15", n: "Ăn", c: "health" },
        { s: "12:15", e: "13:00", n: "Nghỉ ngơi", c: "health" },
        { s: "13:00", e: "17:00", n: "Làm việc", c: "work" },
        { s: "17:00", e: "17:15", n: "Tổng kết và lên ghi chú", c: "work" }
    );

    // --- BUỔI CHIỀU TỐI (Khác nhau giữa Gym và Không Gym) ---
    
    if (isGymDay) {
        // T2, T4, T6
        list.push(
            { s: "17:15", e: "17:30", n: "Ăn 1 ít cơm", c: "health" },
            { s: "17:30", e: "17:40", n: "Pha whey", c: "health" },
            { s: "17:40", e: "18:00", n: "Thay quần áo", c: "beauty" },
            { s: "18:00", e: "18:15", n: "Đến phòng gym", c: "health" },
            { s: "18:15", e: "19:30", n: "Tập gym", c: "beauty" },
            { s: "19:30", e: "19:45", n: "Về nhà", c: "health" },
            { s: "19:45", e: "20:00", n: "Nghỉ ngơi", c: "health" },
            { s: "20:00", e: "20:30", n: "Tắm rửa và skincare", c: "beauty" }
        );
    } else {
        // T3, T5, T7
        list.push(
            { s: "17:15", e: "18:30", n: "Nấu ăn", c: "health" },
            { s: "18:30", e: "19:00", n: "Ăn", c: "health" },
            { s: "19:00", e: "20:00", n: "Nghỉ ngơi", c: "health" }
        );

        // Hoạt động lúc 20:00 - 20:30
        if (isClayMaskDay) {
            list.push({ s: "20:00", e: "20:30", n: "Đắp mặt nạ đất sét", c: "beauty" });
        } else if (dayIdx === 4) { // Thứ 5
            list.push({ s: "20:00", e: "20:30", n: "Tập Yoga", c: "beauty" });
        }
    }

    // --- CUỐI NGÀY (Chung cho T2-T7) ---
    list.push(
        { s: "20:30", e: "20:45", n: "Bỏ mùng", c: "health" },
        { s: "20:45", e: "21:00", n: "Xử lý phát sinh", c: "work" },
        { s: "21:00", e: "21:00", n: "Đi ngủ", c: "health" }
    );

    return list.sort((a, b) => parseInt(a.s) - parseInt(b.s));
};

export const GOAL_CATS: Record<string, string> = { 'health': 'SỨC KHỎE', 'beauty': 'SẮC ĐẸP', 'work': 'CÔNG VIỆC' };

export const CAT_COLORS = {
    'health': { dark: '#2ecc71', light: '#eafaf1', tailwind: 'text-green-500 bg-green-50' },
    'beauty': { dark: '#a29bfe', light: '#f4f1ff', tailwind: 'text-indigo-500 bg-indigo-50' },
    'work': { dark: '#ff6b6b', light: '#ffecec', tailwind: 'text-rose-500 bg-rose-50' }
};