import React, { useState } from 'react';
import { PlusCircle, Check, X, Edit2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { getBaseSchedule, DAYS_VI } from '../constants';
import { SubTask, HistoryEntry } from '../types';

interface DayViewProps {
    daySubTasks: Record<string, SubTask[]>;
    dayChecks: Record<string, boolean>;
    history: HistoryEntry[];
    onToggleMain: (name: string) => void;
    onToggleSub: (parentName: string, index: number) => void;
    onDeleteSub: (parentName: string, index: number) => void;
    onAddSub: (parentName: string) => void;
    onEditSub: (parentName: string, index: number) => void;
    onSubmitDay: (note: string) => void;
}

const DayView: React.FC<DayViewProps> = ({
    daySubTasks,
    dayChecks,
    history,
    onToggleMain,
    onToggleSub,
    onDeleteSub,
    onAddSub,
    onEditSub,
    onSubmitDay
}) => {
    // State for selected date
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [note, setNote] = useState("");

    const dayIdx = selectedDate.getDay();
    const schedule = getBaseSchedule(dayIdx);

    // Handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSelectedDate(new Date(e.target.value));
        }
    };

    // Helper to format YYYY-MM-DD for input value
    const formatDateForInput = (date: Date) => {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    // Helper to format DD-MM-YYYY for History lookup and Unique Keys
    const formatDateForHistory = (date: Date) => {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isCurrentDay = isToday(selectedDate);
    const dateKeyStr = formatDateForHistory(selectedDate);

    // Calculate progress
    let percent = 0;
    
    if (isCurrentDay) {
        // Live calculation for Today
        let total = 0;
        let done = 0;
        schedule.forEach(item => {
            const taskKey = `${dateKeyStr}_${item.n}`;
            total++;
            if (dayChecks[taskKey]) done++;
            const subs = daySubTasks[taskKey] || [];
            subs.forEach(s => {
                total++;
                if (s.done) done++;
            });
        });
        percent = total === 0 ? 0 : Math.round((done / total) * 100);
    } else {
        // Historical lookup for other days
        const historyItem = history.find(h => h.date === dateKeyStr);
        percent = historyItem ? parseInt(historyItem.pc) : 0;
    }

    const getVibrantClass = (category: string, isDone: boolean) => {
        if (isDone) return 'bg-slate-100 border-l-4 border-slate-300 saturate-0 opacity-60'; // ADHD Focus: Remove visual noise when done
        
        let baseClass = '';
        switch (category) {
            case 'health':
                baseClass = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 border-l-8 border-emerald-700';
                break;
            case 'work':
                baseClass = 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 border-l-8 border-rose-700';
                break;
            case 'beauty':
                baseClass = 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 border-l-8 border-violet-700';
                break;
            default:
                baseClass = 'bg-gray-500 text-white';
        }

        // Apply 'pale' effect (tái hơn) if not today
        if (!isCurrentDay) {
            return `${baseClass} saturate-[0.4] opacity-80`;
        }

        return baseClass;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Progress */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-100 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 relative z-10 gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                             <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">{DAYS_VI[dayIdx]}</h2>
                             <div className="bg-slate-100 p-2 rounded-xl flex items-center gap-2 border border-slate-200">
                                <CalendarIcon size={18} className="text-slate-500" />
                                <input 
                                    type="date" 
                                    value={formatDateForInput(selectedDate)} 
                                    onChange={handleDateChange}
                                    className="bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer"
                                />
                             </div>
                        </div>
                        <div className="text-slate-500 font-medium text-lg mt-1 flex items-center gap-2">
                            <Clock size={18} />
                            {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isCurrentDay ? 'from-emerald-400 to-blue-500' : 'from-slate-400 to-slate-500'}`}>
                            {percent}%
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {isCurrentDay ? "Hoàn thành (Live)" : "Kết quả lưu trữ"}
                        </div>
                    </div>
                </div>
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 w-full h-4 bg-slate-100">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${isCurrentDay ? 'bg-gradient-to-r from-emerald-400 to-blue-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
            </div>

            {/* Task List - Always allow interaction as per request */}
            <div className="space-y-6">
                {schedule.map((item, idx) => {
                    // Generate unique key per day: "DD-MM-YYYY_TaskName"
                    const taskKey = `${dateKeyStr}_${item.n}`;
                    const isChecked = dayChecks[taskKey] || false;
                    const subs = daySubTasks[taskKey] || [];
                    
                    return (
                        <div key={idx} className={`rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px] ${getVibrantClass(item.c, isChecked)}`}>
                            {/* Main Task Layout */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Time Column - HUGE Font for ADHD Time Awareness */}
                                <div className={`flex flex-col md:w-32 shrink-0 border-r ${isChecked ? 'border-slate-300' : 'border-white/20'} pr-4 md:text-right`}>
                                    <span className={`text-4xl font-black tracking-tighter leading-none ${isChecked ? 'text-slate-400' : 'text-white'}`}>
                                        {item.s}
                                    </span>
                                    <span className={`text-sm font-bold opacity-80 ${isChecked ? 'text-slate-400' : 'text-white'}`}>
                                        đến {item.e}
                                    </span>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-2xl font-bold leading-tight mb-1 ${isChecked ? 'line-through text-slate-400' : 'text-white drop-shadow-md'}`}>
                                        {item.n}
                                    </div>
                                    
                                    {/* Subtasks Container */}
                                    {subs.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {subs.map((sub, sIdx) => (
                                                <div key={sIdx} className={`rounded-xl p-3 flex justify-between items-center transition-all ${
                                                    isChecked 
                                                        ? 'bg-slate-200' 
                                                        : sub.done 
                                                            ? 'bg-black/20' 
                                                            : 'bg-white/10 backdrop-blur-md border border-white/20'
                                                }`}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {/* Subtask Time: Strikethrough if done */}
                                                        <span className={`font-mono font-bold text-sm shrink-0 px-2 py-0.5 rounded ${
                                                            sub.done 
                                                                ? 'bg-slate-400 text-slate-200 line-through decoration-2' 
                                                                : 'bg-white/20 text-white'
                                                        }`}>
                                                            {sub.s ? `${sub.s}-${sub.e}` : '...'}
                                                        </span>
                                                        <span className={`truncate font-medium ${sub.done ? 'line-through opacity-50' : 'text-white'}`}>
                                                            {sub.n}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <input 
                                                            type="checkbox"
                                                            checked={sub.done}
                                                            onChange={() => onToggleSub(taskKey, sIdx)}
                                                            className="w-5 h-5 rounded cursor-pointer accent-emerald-400 ring-2 ring-white/30"
                                                        />
                                                        <button onClick={() => onEditSub(taskKey, sIdx)} className="p-1 hover:bg-white/20 rounded text-white/70 hover:text-white"><Edit2 size={14} /></button>
                                                        <button type="button" onClick={(e) => {e.stopPropagation(); onDeleteSub(taskKey, sIdx)}} className="p-1 hover:bg-red-500/20 rounded text-white/70 hover:text-red-200"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Main Checkbox & Actions */}
                                <div className="flex items-center gap-4 justify-end md:justify-start md:border-l md:border-white/20 md:pl-4">
                                    <button 
                                        onClick={() => onAddSub(taskKey)}
                                        className={`p-2 rounded-full transition-all ${isChecked ? 'text-slate-400 hover:bg-slate-200' : 'hover:bg-white/20 text-white'}`}
                                        title="Thêm việc nhỏ"
                                    >
                                        <PlusCircle size={28} />
                                    </button>
                                    <div className="relative group">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => onToggleMain(taskKey)}
                                            className="peer w-10 h-10 appearance-none rounded-xl border-2 border-white/40 checked:bg-white checked:border-white cursor-pointer transition-all shadow-sm" 
                                        />
                                        <Check 
                                            size={28} 
                                            strokeWidth={4}
                                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ${isChecked ? 'text-emerald-500 scale-100' : 'scale-0 opacity-0'}`} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day Conclusion - Only show if Today */}
            {isCurrentDay && (
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Edit2 size={20} className="text-emerald-500"/>
                        TỔNG KẾT & LƯU TRỮ
                    </h3>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none text-base min-h-[100px] transition-all"
                        placeholder="Viết lại những điều tuyệt vời hôm nay..."
                    ></textarea>
                    <button 
                        onClick={() => onSubmitDay(note)}
                        className="w-full mt-6 bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-lg shadow-slate-300/50 hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        LƯU VÀ KẾT QUẢ BIỂU ĐỒ
                    </button>
                </div>
            )}
        </div>
    );
};

export default DayView;