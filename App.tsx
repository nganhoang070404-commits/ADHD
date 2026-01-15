import React, { useState, useEffect, useRef } from 'react';
import { Brain, Calendar, Rocket, Target, History, Menu, PlusCircle, X, Edit2, TrendingUp, Award, Zap, Activity, CheckCircle, Clock, Trash2, MessageCircle, ChevronRight, Star, Flame, Trophy, Quote, Plus, Filter, PieChart as PieIcon, LayoutGrid, Download, Upload, AlertTriangle, CornerDownRight, StickyNote } from 'lucide-react';
import DayView from './components/DayView';
import { getBaseSchedule, DAYS_VI, CAT_COLORS, GOAL_CATS } from './constants';
import { AppData, GoalCollection, SubTask, GoalSub } from './types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Label, LineChart, Line, LabelList, YAxis, CartesianGrid, Legend, AreaChart, Area, ComposedChart } from 'recharts';

// --- DATA CONSTANTS ---

const SIDEBAR_QUOTES = [
    "Kỷ luật là tự do.",
    "Đừng đợi hoàn hảo, hãy bắt đầu ngay.",
    "Một bước nhỏ mỗi ngày còn hơn đứng yên.",
    "Sự tập trung là siêu năng lực của bạn.",
    "Đừng để cảm xúc đánh lừa lý trí.",
    "Hôm nay bạn đã làm tốt hơn hôm qua chưa?",
    "Khó khăn sinh ra để tôi luyện bản lĩnh.",
    "Tương lai được xây dựng từ hành động hôm nay.",
    "Thở sâu, tập trung, và hành động.",
    "Bạn mạnh mẽ hơn những gì bạn nghĩ."
];

// --- INITIAL STATE ---
const INITIAL_DATA: AppData = {
    projects: [],
    goals: { health: [], beauty: [], work: [] },
    daySubTasks: {},
    dayChecks: {},
    weekFloat: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    history: [],
    quotes: SIDEBAR_QUOTES,
    notes: []
};

// --- MOTIVATION RULES FOR PROJECTS ---
const PROJECT_QUOTES_RULES = {
    start: [ // 0%
        "Hành trình vạn dặm bắt đầu từ bước chân đầu tiên!",
        "Chỉ cần hoàn thành một việc thôi là bạn đã chạm tay tới hành trình xây dựng ước mơ rồi!"
    ],
    breakthrough: [ // 1% - 40%
        "Đà đang lên rồi, đừng dừng lại nhé!",
        "Cố lên! Bạn đã hoàn thành được 1/3 chặng đường rồi!",
        "Wow, bạn làm tốt rồi đấy. Sắp tới cột mốc quan trọng rồi!",
        "Nhìn xem, danh sách việc cần làm đang ngắn lại rõ rệt rồi kìa!",
        "Sự tập trung của bạn hôm nay thật đáng nể. Tiếp tục phát huy nào!"
    ],
    almostHalf: [ // 41% - 50% (Transition to 50%)
        "Bạn giỏi quá! Xong mục này là bạn đã cán mốc 50% rồi. Một nửa chặng đường đã ở sau lưng!"
    ],
    acceleration: [ // 51% - 80%
        "Đã đi được hơn nửa đường rồi, đích đến không còn xa nữa đâu!",
        "Bạn đang làm rất tốt, chỉ còn vài bước nữa là xong dự án này rồi!",
        "Lại thêm 1 cột mốc được hoàn thành! Đừng bỏ cuộc lúc này, bạn của sau này sẽ rất tự hào về bạn bây giờ!",
        "x% rồi! Bạn đang ở rất gần chiến thắng. Một chút nữa thôi!",
        "Cảm giác hoàn thành 100% đang chờ bạn ở phía trước. Tiến lên!"
    ],
    nearFinish: [ // 81% - 99%
        "x% rồi! Chỉ còn một chút nỗ lực cuối cùng thôi. Bạn sẽ làm được!",
        "Về đích thôi! Mọi thứ sắp hoàn hảo rồi!",
        "Đếm ngược nào: 3... 2... 1... Sắp xong rồi!",
        "Bạn là chiến binh! Không gì có thể cản bước bạn hoàn thành mục tiêu này."
    ],
    done: [ // 100%
        "XONG RỒI! Hãy tận hưởng cảm giác tự hào này đi, bạn xứng đáng với nó!",
        "QUÁ XUẤT SẮC! Cuối cùng bạn đã hoàn thành xong dự án, tốt hơn rất nhiều khi những người xung quanh đang loay hoay với 1 đống ý tưởng trong đầu họ!",
        "XUẤT SẮC! Bạn đã hoàn thành tốt vượt mong đợi! Tiếp tục đánh gục các dự án khác nào!!!"
    ]
};

// --- MOTIVATION RULES FOR GOALS ---
const GOAL_QUOTES_RULES = {
    start: [ // 0%
        "Hành trình vạn dặm bắt đầu từ bước chân đầu tiên!",
        "Chỉ cần hoàn thành một mục tiêu nhỏ thôi là bạn đã chạm tay tới hành trình xây dựng ước mơ rồi!"
    ],
    breakthrough: [ // 1% - 40%
        "Đà đang lên rồi, đừng dừng lại nhé!",
        "Cố lên! Bạn đã hoàn thành được 1/3 chặng đường rồi!",
        "Wow, bạn làm tốt rồi đấy. Sắp tới cột mốc quan trọng rồi!",
        "Nhìn xem, danh sách mục tiêu cần hoàn thành đang ngắn lại rõ rệt rồi kìa!",
        "Sự tập trung của bạn hôm nay thật đáng nể. Tiếp tục phát huy nào!"
    ],
    almostHalf: [ // 41% - 50%
        "Bạn giỏi quá! Xong mục này là bạn đã cán mốc 50% rồi. Một nửa chặng đường đã ở sau lưng!"
    ],
    acceleration: [ // 51% - 80%
        "Đã đi được hơn nửa đường rồi, đích đến không còn xa nữa đâu!",
        "Bạn đang làm rất tốt, chỉ còn vài bước nữa là hoàn thành mục tiêu này rồi!",
        "Lại thêm 1 cột mốc được hoàn thành! Đừng bỏ cuộc lúc này, bạn của sau này sẽ rất tự hào về bạn bây giờ!",
        "x% rồi! Bạn đang ở rất gần chiến thắng. Một chút nữa thôi!",
        "Cảm giác hoàn thành 100% đang chờ bạn ở phía trước. Tiến lên!"
    ],
    nearFinish: [ // 81% - 99%
        "x% rồi! Chỉ còn một chút nỗ lực cuối cùng thôi. Bạn sẽ làm được!",
        "Về đích thôi! Mọi thứ sắp hoàn hảo rồi!",
        "Đếm ngược nào: 3... 2... 1... Sắp xong rồi!",
        "Bạn là chiến binh! Không gì có thể cản bước bạn hoàn thành mục tiêu này."
    ],
    done: [ // 100%
        "XONG RỒI! Hãy tận hưởng cảm giác tự hào này đi, bạn xứng đáng với nó!",
        "QUÁ XUẤT SẮC! Cuối cùng bạn đã hoàn thành xong mục tiêu, tốt hơn rất nhiều khi những người xung quanh đang loay hoay với 1 đống giấc mơ trong đầu họ!",
        "XUẤT SẮC! Bạn đã hoàn thành tốt vượt mong đợi! Tiếp tục đánh gục các mục tiêu khác nào!!!"
    ]
};

// --- HELPER FUNCTIONS ---
const getDaysLeft = (end: string | undefined) => {
    if (!end) return null;
    const diff = new Date(end).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
};

// Recursive function to calculate progress
const getRecursiveStats = (subs: any[]) => {
    let total = 0;
    let done = 0;
    const traverse = (list: any[]) => {
        list.forEach(item => {
            total++; // Count the item itself
            if (item.done) done++;
            if (item.subs && item.subs.length > 0) traverse(item.subs);
        });
    };
    traverse(subs);
    return { total, done };
};

// Global Deadline Config (Projects)
const getDeadlineConfig = (days: number | null) => {
    if (days === null) return { label: '∞', text: 'CHUẨN BỊ', style: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (days < 0) return { label: `-${Math.abs(days)} NGÀY`, text: 'KHẨN CẤP', style: 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_#ef4444] border-red-600' };
    
    // Updated Logic per request: 
    // 1-10 days: Urgent
    // 11-20 days: Attention
    // 21+: Prepare
    if (days <= 10) return { label: `${days} NGÀY`, text: 'KHẨN CẤP', style: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border-rose-600' };
    if (days <= 20) return { label: `${days} NGÀY`, text: 'CHÚ Ý', style: 'bg-amber-400 text-white border-amber-500' };
    
    return { label: `${days} NGÀY`, text: 'CHUẨN BỊ', style: 'bg-emerald-500 text-white border-emerald-600' };
};

// Specific Deadline Config for Goals
const getGoalDeadlineConfig = (days: number | null) => {
    if (days === null) return { label: '∞', text: 'CHUẨN BỊ', style: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (days < 1) return { label: `${days} NGÀY`, text: 'KHẨN CẤP', style: 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_#ef4444] border-red-600' }; // Quá hạn hoặc hôm nay
    
    // Rule: 1-10 days: Urgent
    if (days <= 10) return { label: `${days} NGÀY`, text: 'KHẨN CẤP', style: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border-rose-600' };
    // Rule: 11-20 days: Attention
    if (days <= 20) return { label: `${days} NGÀY`, text: 'CHÚ Ý', style: 'bg-amber-400 text-white border-amber-500' };
    // Rule: 21+ days: Prepare
    return { label: `${days} NGÀY`, text: 'CHUẨN BỊ', style: 'bg-emerald-500 text-white border-emerald-600' };
};

const getMotivationQuote = (pc: number) => {
    let pool = [];
    if (pc === 0) pool = PROJECT_QUOTES_RULES.start;
    else if (pc <= 40) pool = PROJECT_QUOTES_RULES.breakthrough;
    else if (pc <= 50) pool = PROJECT_QUOTES_RULES.almostHalf;
    else if (pc <= 80) pool = PROJECT_QUOTES_RULES.acceleration;
    else if (pc < 100) pool = PROJECT_QUOTES_RULES.nearFinish;
    else pool = PROJECT_QUOTES_RULES.done;

    const quote = pool[Math.floor(Math.random() * pool.length)];
    // Replace 'x' in 'x%' with the actual percentage
    return quote.replace(/x(?=%)/g, pc.toString());
};

const getGoalMotivationQuote = (pc: number) => {
    let pool = [];
    if (pc === 0) pool = GOAL_QUOTES_RULES.start;
    else if (pc <= 40) pool = GOAL_QUOTES_RULES.breakthrough;
    else if (pc <= 50) pool = GOAL_QUOTES_RULES.almostHalf;
    else if (pc <= 80) pool = GOAL_QUOTES_RULES.acceleration;
    else if (pc < 100) pool = GOAL_QUOTES_RULES.nearFinish;
    else pool = GOAL_QUOTES_RULES.done;

    const quote = pool[Math.floor(Math.random() * pool.length)];
    return quote.replace(/x(?=%)/g, pc.toString());
};

const formatDateDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    // Check if format is yyyy-mm-dd (default input type=date)
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
};

const parseDateDDMMYYYY = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(); 
};

const getDailyQuote = (quotes: string[]) => {
    if (!quotes || quotes.length === 0) return "Hãy thêm một câu quote mới!";
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return quotes[dayOfYear % quotes.length];
};

const CHART_COLORS = {
    work: '#f43f5e',   // Rose
    health: '#10b981', // Emerald
    beauty: '#8b5cf6', // Violet
    line: '#38bdf8'    // Sky
};

const YEAR_RANGE = Array.from({length: 13}, (_, i) => 2024 + i); // 2024 to 2036

// Neon palette
const LINE_COLORS = [
    '#00f2ff', // Cyan Neon
    '#ff0055', // Pink Neon
    '#ae00ff', // Purple Neon
    '#39ff14', // Green Neon
    '#ffbd00', // Yellow Neon
];

// --- HELPER COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, colorClass }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center w-full px-5 py-5 mb-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden border-none outline-none
        ${active 
            ? `bg-white/10 backdrop-blur-lg ${colorClass} shadow-[0_0_30px_rgba(255,255,255,0.1)] translate-x-3 scale-105` 
            : 'text-slate-500 hover:bg-white/5 hover:text-white hover:translate-x-2'}`}
    >
        <div className={`relative z-10 flex items-center gap-4`}>
            <Icon size={28} strokeWidth={active ? 3 : 2} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'group-hover:scale-110'}`} />
            <span className={`text-lg font-black tracking-tight uppercase ${active ? 'text-white' : ''}`}>{label}</span>
        </div>
    </button>
);

const SummaryCard = ({ title, value, sub, icon: Icon, bgClass }: any) => (
    <div className={`relative overflow-hidden p-6 rounded-[2.5rem] transition-all hover:scale-105 hover:-translate-y-2 duration-300 group ${bgClass}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-white/20 transition-colors"></div>
        <div className="relative z-10 flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="text-yellow-50 text-xs font-black uppercase tracking-[0.2em] mb-1 border-b-2 border-white/20 pb-1 inline-block drop-shadow-sm">{title}</div>
                <div className={`font-black text-white drop-shadow-md my-2 tracking-tighter ${String(value).length > 3 ? 'text-2xl md:text-3xl uppercase leading-tight' : 'text-5xl'}`}>{value}</div>
                <div className="text-[10px] font-bold text-white/90 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md inline-flex items-center shadow-inner">
                    {sub}
                </div>
            </div>
            <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:rotate-12 transition-transform`}>
                <Icon size={28} className="text-white drop-shadow-md" />
            </div>
        </div>
    </div>
);

// --- RECURSIVE TASK COMPONENTS ---

interface ProjectTaskItemProps {
    task: SubTask;
    path: number[];
    pi: number;
    si: number;
    toggleProjectSub: (pi: number, si: number, path: number[]) => void;
    deleteProjectSub: (pi: number, si: number, path: number[]) => void;
    openModal: (type: string, target?: any, subIndex?: number, isEdit?: boolean, goalSubIndex?: number, path?: number[]) => void;
}

const ProjectTaskItem: React.FC<ProjectTaskItemProps> = ({ task, path, pi, si, toggleProjectSub, deleteProjectSub, openModal }) => {
    const deadline = getDaysLeft(task.e);
    const deadlineConf = getDeadlineConfig(deadline);
    const hasChildren = task.subs && task.subs.length > 0;
    
    return (
        <div className="flex flex-col w-full animate-fade-in-up">
             <div className={`group flex justify-between items-start p-4 rounded-2xl border-2 transition-all mb-2 ${task.done ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0 mr-3">
                    <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => toggleProjectSub(pi, si, path)} 
                        className="mt-1 w-6 h-6 accent-emerald-500 cursor-pointer rounded-lg border-2 border-slate-200 checked:border-emerald-500 shrink-0" 
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className={`font-bold text-sm break-words ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.n}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {(task.s || task.e) && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Calendar size={10}/> {formatDateDisplay(task.s) || '?'} - {formatDateDisplay(task.e) || '?'}
                                </div>
                            )}
                            {task.e && !task.done && (
                                <div className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${deadlineConf.style}`}>
                                    {deadlineConf.text} ({deadlineConf.label})
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openModal('proj-sub', pi, null, false, null, [...path, si])} className="p-2 hover:bg-emerald-50 rounded-lg text-slate-300 hover:text-emerald-500" title="Thêm việc nhỏ con"><CornerDownRight size={16} /></button>
                     <button onClick={() => openModal('proj-sub', pi, si, true, null, path)} className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-500"><Edit2 size={16} /></button>
                     <button onClick={() => deleteProjectSub(pi, si, path)} className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
            </div>
            {/* Render Children */}
            {hasChildren && (
                <div className="pl-6 border-l-2 border-slate-100 ml-3 mb-2 space-y-2">
                    {task.subs!.map((sub, idx) => (
                        <ProjectTaskItem 
                            key={idx} 
                            task={sub} 
                            path={[...path, si]} 
                            pi={pi} 
                            si={idx}
                            toggleProjectSub={toggleProjectSub}
                            deleteProjectSub={deleteProjectSub}
                            openModal={openModal}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface GoalTaskItemProps {
    task: GoalSub;
    path: number[];
    cat: keyof GoalCollection;
    gi: number;
    si: number;
    toggleGoalSub: (cat: keyof GoalCollection, gIndex: number, sIndex: number, path: number[]) => void;
    deleteGoalSub: (cat: keyof GoalCollection, gIndex: number, sIndex: number, path: number[]) => void;
    openModal: (type: string, target?: any, subIndex?: number, isEdit?: boolean, goalSubIndex?: number, path?: number[]) => void;
}

const GoalTaskItem: React.FC<GoalTaskItemProps> = ({ task, path, cat, gi, si, toggleGoalSub, deleteGoalSub, openModal }) => {
    const deadline = getDaysLeft(task.e);
    const deadlineConf = getGoalDeadlineConfig(deadline);
    const hasChildren = task.subs && task.subs.length > 0;
    
    return (
        <div className="flex flex-col w-full animate-fade-in-up">
             <div className={`group flex justify-between items-start p-4 rounded-2xl border-2 transition-all mb-2 ${task.done ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0 mr-3">
                    <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => toggleGoalSub(cat, gi, si, path)} 
                        className="mt-1 w-6 h-6 accent-emerald-500 cursor-pointer rounded-lg border-2 border-slate-200 checked:border-emerald-500 shrink-0" 
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className={`font-bold text-sm break-words ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.n}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {(task.s || task.e) && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Calendar size={10}/> {formatDateDisplay(task.s) || '?'} - {formatDateDisplay(task.e) || '?'}
                                </div>
                            )}
                            {task.e && !task.done && (
                                <div className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${deadlineConf.style}`}>
                                    {deadlineConf.text} ({deadlineConf.label})
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openModal('goal-sub', cat, gi, false, null, [...path, si])} className="p-2 hover:bg-emerald-50 rounded-lg text-slate-300 hover:text-emerald-500" title="Thêm việc nhỏ con"><CornerDownRight size={16} /></button>
                     <button onClick={() => openModal('goal-sub', cat, gi, true, si, path)} className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-500"><Edit2 size={16} /></button>
                     <button onClick={() => deleteGoalSub(cat, gi, si, path)} className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
            </div>
            {/* Render Children */}
            {hasChildren && (
                <div className="pl-6 border-l-2 border-slate-100 ml-3 mb-2 space-y-2">
                    {task.subs!.map((sub, idx) => (
                        <GoalTaskItem 
                            key={idx} 
                            task={sub} 
                            path={[...path, si]} 
                            cat={cat} 
                            gi={gi} 
                            si={idx}
                            toggleGoalSub={toggleGoalSub}
                            deleteGoalSub={deleteGoalSub}
                            openModal={openModal}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
    // --- STATE ---
    const [tab, setTab] = useState('day');
    const [statTab, setStatTab] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [data, setData] = useState<AppData>(INITIAL_DATA);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [newQuote, setNewQuote] = useState("");
    
    // Stats Filtering State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<any>({});
    const [modalForm, setModalForm] = useState<any>({});

    // Import Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        const load = (key: string) => JSON.parse(localStorage.getItem(key) || 'null');
        setData({
            projects: load('v15_projs') || [],
            goals: load('v15_goals') || { health: [], beauty: [], work: [] },
            daySubTasks: load('v15_day_subs') || {},
            dayChecks: load('v15_day_checks') || {},
            weekFloat: load('v15_week_float') || INITIAL_DATA.weekFloat,
            history: load('v15_history') || [],
            quotes: load('v15_quotes') || SIDEBAR_QUOTES,
            notes: load('v15_notes') || []
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('v15_projs', JSON.stringify(data.projects));
        localStorage.setItem('v15_goals', JSON.stringify(data.goals));
        localStorage.setItem('v15_day_subs', JSON.stringify(data.daySubTasks));
        localStorage.setItem('v15_day_checks', JSON.stringify(data.dayChecks));
        localStorage.setItem('v15_week_float', JSON.stringify(data.weekFloat));
        localStorage.setItem('v15_history', JSON.stringify(data.history));
        localStorage.setItem('v15_quotes', JSON.stringify(data.quotes));
        localStorage.setItem('v15_notes', JSON.stringify(data.notes));
    }, [data]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // NEW: Automatic Weekend Backup Reminder
    useEffect(() => {
        const checkWeekendReminder = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 6 = Saturday
            if (day === 0 || day === 6) {
                // Key format: backup_reminder_day_month_year
                const key = `backup_reminder_${now.getDate()}_${now.getMonth()}_${now.getFullYear()}`;
                const hasReminded = localStorage.getItem(key);
                
                if (!hasReminded) {
                    // Slight delay to ensure it appears nicely after app load
                    setTimeout(() => {
                        setToast({ msg: "Cuối tuần rồi! Đừng quên Sao lưu dữ liệu nhé 💾", type: 'success' });
                        localStorage.setItem(key, 'true');
                    }, 2000);
                }
            }
        };
        checkWeekendReminder();
    }, []);

    // --- IMPORT / EXPORT HANDLERS ---
    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `adhd-studio-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setToast({ msg: "Đã sao lưu dữ liệu thành công!", type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ msg: "Lỗi khi sao lưu dữ liệu", type: 'error' });
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content);
                
                // Basic validation
                if (!importedData || typeof importedData !== 'object') {
                    throw new Error("Invalid data format");
                }

                // Merge with default structure to ensure all keys exist
                const newData = {
                    ...INITIAL_DATA,
                    ...importedData,
                    // Ensure nested objects are also merged correctly if missing in backup
                    goals: { ...INITIAL_DATA.goals, ...(importedData.goals || {}) },
                    weekFloat: { ...INITIAL_DATA.weekFloat, ...(importedData.weekFloat || {}) },
                };

                setData(newData);
                setToast({ msg: "Đã khôi phục dữ liệu thành công!", type: 'success' });
                
                // Clear input
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error(error);
                setToast({ msg: "File lỗi hoặc không đúng định dạng!", type: 'error' });
            }
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };


    // --- HANDLERS ---
    const openModal = (type: string, target?: any, subIndex?: number, isEdit = false, goalSubIndex?: number, path: number[] = []) => {
        let title = isEdit ? "Sửa" : "Thêm mới";
        let initialForm: any = { n: '', s: '', e: '', cat: 'work' };
        
        if (type === 'day-sub') {
            title = isEdit ? "Sửa việc nhỏ" : "Thêm việc nhỏ";
            if (isEdit && target) initialForm = { ...data.daySubTasks[target][subIndex!] };
        } else if (type === 'proj') {
            title = "Thêm Dự Án Mới";
        } else if (type === 'proj-edit') {
            title = "Sửa Dự Án";
            const p = data.projects[target];
            initialForm = { n: p.name, s: p.start, e: p.end, cat: p.cat };
        } else if (type === 'proj-sub') {
            title = isEdit ? "Sửa đầu việc dự án" : "Thêm đầu việc dự án";
            if (isEdit) {
                // Find deep nested task
                let current = data.projects[target].subs;
                for (let i = 0; i < path.length; i++) {
                    current = current[path[i]].subs || [];
                }
                const s = current[subIndex!];
                initialForm = { n: s.n, s: s.s, e: s.e };
            }
        } else if (type === 'goal') {
            title = "Thêm Mục Tiêu Lớn";
        } else if (type === 'goal-edit') {
            title = "Sửa Mục Tiêu Lớn";
            const g = data.goals[target as keyof GoalCollection][subIndex!];
            initialForm = { n: g.name, s: g.start, e: g.end };
        } else if (type === 'goal-sub') {
            title = isEdit ? "Sửa mục tiêu nhỏ" : "Thêm mục tiêu nhỏ";
            if (isEdit) {
                let current = data.goals[target as keyof GoalCollection][subIndex!].subs;
                if (path && path.length > 0) {
                     for (let i = 0; i < path.length; i++) {
                         current = current[path[i]].subs || [];
                     }
                }
                const s = current[goalSubIndex!];
                initialForm = { n: s.n, s: s.s, e: s.e };
            }
        } else if (type === 'week-float') {
            title = isEdit ? "Sửa việc tuần" : "Thêm việc tuần";
            if (isEdit) initialForm.n = data.weekFloat[target][subIndex!].n;
        } else if (type === 'quote-edit') {
            title = "Chỉnh sửa Quote";
            initialForm.n = data.quotes[subIndex!];
        } else if (type === 'note') {
            title = "Thêm Ghi Chú Mới";
        } else if (type === 'note-edit') {
            title = "Sửa Ghi Chú";
            const note = data.notes[subIndex!];
            initialForm = { n: note.title, content: note.content };
        }
        setModalConfig({ type, target, subIndex, isEdit, goalSubIndex, title, path });
        setModalForm(initialForm);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!modalForm.n) return;
        const newData = { ...data };
        const { type, target, subIndex, isEdit, goalSubIndex, path } = modalConfig;
        
        if (type === 'day-sub') {
            const list = newData.daySubTasks[target] || [];
            const newItem = { n: modalForm.n, s: modalForm.s, e: modalForm.e, done: modalForm.done || false };
            if (isEdit) list[subIndex] = { ...list[subIndex], ...newItem };
            else list.push(newItem);
            newData.daySubTasks[target] = list;
        } else if (type === 'proj') {
            newData.projects.push({ name: modalForm.n, cat: modalForm.cat, start: modalForm.s, end: modalForm.e, subs: [] });
        } else if (type === 'proj-edit') {
            newData.projects[target] = { ...newData.projects[target], name: modalForm.n, start: modalForm.s, end: modalForm.e, cat: modalForm.cat };
        } else if (type === 'proj-sub') {
            // Helper to find correct sub array
            let current = newData.projects[target].subs;
            // Navigate path if exists
            if (path && path.length > 0) {
                 for (let i = 0; i < path.length; i++) {
                     if (!current[path[i]].subs) current[path[i]].subs = [];
                     current = current[path[i]].subs!;
                 }
            }

            if (isEdit) {
                current[subIndex] = { ...current[subIndex], n: modalForm.n, s: modalForm.s, e: modalForm.e };
            } else {
                current.push({ n: modalForm.n, s: modalForm.s, e: modalForm.e, done: false, subs: [] });
            }
        } else if (type === 'goal') {
            newData.goals[target as keyof GoalCollection].push({ name: modalForm.n, start: modalForm.s, end: modalForm.e, subs: [] });
        } else if (type === 'goal-edit') {
            const g = newData.goals[target as keyof GoalCollection][subIndex];
            g.name = modalForm.n;
            g.start = modalForm.s;
            g.end = modalForm.e;
        } else if (type === 'goal-sub') {
            let current = newData.goals[target as keyof GoalCollection][subIndex].subs;
            // Navigate path if exists
            if (path && path.length > 0) {
                 for (let i = 0; i < path.length; i++) {
                     if (!current[path[i]].subs) current[path[i]].subs = [];
                     current = current[path[i]].subs!;
                 }
            }

            if (isEdit) {
                 current[goalSubIndex] = { ...current[goalSubIndex], n: modalForm.n, s: modalForm.s, e: modalForm.e };
            } else {
                 current.push({ n: modalForm.n, s: modalForm.s, e: modalForm.e, done: false, subs: [] });
            }
        } else if (type === 'week-float') {
            if (isEdit) newData.weekFloat[target][subIndex].n = modalForm.n;
            else newData.weekFloat[target].push({ n: modalForm.n, done: false });
        } else if (type === 'quote-edit') {
            const updatedQuotes = [...newData.quotes];
            updatedQuotes[subIndex] = modalForm.n;
            newData.quotes = updatedQuotes;
        } else if (type === 'note') {
             newData.notes.push({
                 id: Date.now().toString(),
                 title: modalForm.n,
                 content: modalForm.content,
                 date: new Date().toLocaleDateString('vi-VN')
             });
        } else if (type === 'note-edit') {
             newData.notes[subIndex] = {
                 ...newData.notes[subIndex],
                 title: modalForm.n,
                 content: modalForm.content
             };
        }
        setData(newData);
        setIsModalOpen(false);
    };

    const updateDayCheck = (name: string) => setData(p => ({ ...p, dayChecks: { ...p.dayChecks, [name]: !p.dayChecks[name] } }));
    const deleteDaySub = (name: string, idx: number) => {
        setData(prev => {
            const newDaySubTasks = { ...prev.daySubTasks };
            if (newDaySubTasks[name]) newDaySubTasks[name] = newDaySubTasks[name].filter((_, i) => i !== idx);
            return { ...prev, daySubTasks: newDaySubTasks };
        });
    };
    const deleteProject = (index: number) => {
        setData(prev => {
            const newProjects = prev.projects.filter((_, i) => i !== index);
            return { ...prev, projects: newProjects };
        });
    };
    
    // Updated recursive delete
    const deleteProjectSub = (pIndex: number, sIndex: number, path: number[] = []) => {
        setData(prev => {
            const newProjects = [...prev.projects];
            let current = newProjects[pIndex].subs;
            
            // Navigate path
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]].subs!;
            }
            
            // Delete at index
            current.splice(sIndex, 1);
            
            return { ...prev, projects: newProjects };
        });
    };

    // Updated toggle for nested project tasks with recursive auto-check for parents
    const toggleProjectSub = (pIndex: number, sIndex: number, path: number[] = []) => {
        setData(prev => {
            const newProjects = [...prev.projects];
            // Use JSON parse/stringify for a deep copy to simplify mutation tracking in recursion
            const project = JSON.parse(JSON.stringify(newProjects[pIndex]));
            
            let current = project.subs;
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]].subs!;
            }
            
            // Toggle the specific task
            const task = current[sIndex];
            task.done = !task.done;
            
            // Helper to recursively update parents based on children status
            const syncDoneStatus = (items: any[]) => {
                items.forEach(item => {
                    if (item.subs && item.subs.length > 0) {
                        syncDoneStatus(item.subs); // Recurse first (bottom-up)
                        // If all children are done, mark parent as done
                        item.done = item.subs.every((child: any) => child.done);
                    }
                });
            };
            
            // Apply sync from the root of the project
            syncDoneStatus(project.subs);

            newProjects[pIndex] = project;
            return { ...prev, projects: newProjects };
        });
    };

    // Recursive toggle for Goals with auto-check for parents
    const toggleGoalSub = (cat: keyof GoalCollection, gIndex: number, sIndex: number, path: number[] = []) => {
        setData(prev => {
            const newGoals = { ...prev.goals };
            const newCatGoals = [...newGoals[cat]];
            
            // Deep copy specific goal
            const goal = JSON.parse(JSON.stringify(newCatGoals[gIndex]));
            
            let current = goal.subs;
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]].subs!;
            }
            
            // Toggle specific task
            const task = current[sIndex];
            task.done = !task.done;
            
            // Helper to recursively update parents based on children status
            const syncDoneStatus = (items: any[]) => {
                items.forEach(item => {
                    if (item.subs && item.subs.length > 0) {
                        syncDoneStatus(item.subs);
                        item.done = item.subs.every((child: any) => child.done);
                    }
                });
            };
            
            // Apply sync from root of the goal
            syncDoneStatus(goal.subs);
            
            newCatGoals[gIndex] = goal;
            newGoals[cat] = newCatGoals;
            return { ...prev, goals: newGoals };
        });
    };

    const deleteGoal = (cat: keyof GoalCollection, index: number) => {
        setData(prev => {
            const newGoals = { ...prev.goals };
            newGoals[cat] = newGoals[cat].filter((_, i) => i !== index);
            return { ...prev, goals: newGoals };
        });
    };
    
    // Recursive delete for Goals
    const deleteGoalSub = (cat: keyof GoalCollection, gIndex: number, sIndex: number, path: number[] = []) => {
        setData(prev => {
            const newGoals = { ...prev.goals };
            const newCatGoals = [...newGoals[cat]];
            let current = newCatGoals[gIndex].subs;
            
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]].subs!;
            }
            
            current.splice(sIndex, 1);
            
            newGoals[cat] = newCatGoals;
            return { ...prev, goals: newGoals };
        });
    };
    
    const deleteWeekFloat = (dayIdx: number, taskIdx: number) => {
        setData(prev => {
            const newWeekFloat = { ...prev.weekFloat };
            if (newWeekFloat[dayIdx]) newWeekFloat[dayIdx] = newWeekFloat[dayIdx].filter((_, i) => i !== taskIdx);
            return { ...prev, weekFloat: newWeekFloat };
        });
    };
    const addQuote = () => {
        if (!newQuote.trim()) return;
        setData(prev => ({ ...prev, quotes: [...prev.quotes, newQuote.trim()] }));
        setNewQuote("");
        setToast({ msg: "Đã thêm câu quote mới!", type: 'success' });
    };
    const deleteQuote = (index: number) => {
        setData(prev => ({ ...prev, quotes: prev.quotes.filter((_, i) => i !== index) }));
    };

    const deleteNote = (index: number) => {
        setData(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
    };
    
    // --- UPDATED SUBMIT LOGIC ---
    const submitDay = (note: string) => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${day}-${month}-${year}`;

            setData(prev => {
                const schedule = getBaseSchedule(new Date().getDay());
                // Calculate Breakdown
                let t = 0, d = 0;
                let catCounts: Record<string, {t: number, d: number}> = { work: {t:0, d:0}, health: {t:0, d:0}, beauty: {t:0, d:0} };

                schedule.forEach(i => {
                    // Update key to include date to separate data
                    const key = `${todayStr}_${i.n}`;
                    t++; 
                    catCounts[i.c].t++;
                    if (prev.dayChecks[key]) { d++; catCounts[i.c].d++; }
                    
                    (prev.daySubTasks[key] || []).forEach(s => { 
                        t++; 
                        catCounts[i.c].t++; // Inherit category
                        if (s.done) { d++; catCounts[i.c].d++; } 
                    });
                });
                
                const totalPc = t === 0 ? "0" : Math.round((d / t) * 100).toString();
                
                // Weighted contribution to the total
                const details = {
                    work: t===0 ? 0 : Math.round((catCounts.work.d / t) * 100),
                    health: t===0 ? 0 : Math.round((catCounts.health.d / t) * 100),
                    beauty: t===0 ? 0 : Math.round((catCounts.beauty.d / t) * 100)
                };

                const newHist = prev.history.filter(h => h.date !== todayStr);
                newHist.push({ date: todayStr, pc: totalPc, note: note || "Không có ghi chú", details });
                return { ...prev, history: newHist };
            });

            setToast({ msg: `Đã lưu thành công cho ngày ${todayStr}!`, type: 'success' });
            setTab('hist');
        } catch (e) {
            console.error(e);
            setToast({ msg: "Lỗi khi lưu dữ liệu", type: 'error' });
        }
    };

    // --- VIEWS ---
    const renderWeek = () => {
       const todayIdx = new Date().getDay();
       // Generate ordered indices starting from today: [todayIdx, todayIdx+1, ..., wrap around]
       const orderedIndices = Array.from({length: 7}, (_, i) => (todayIdx + i) % 7);

       return (
            <div className="flex flex-col h-full">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 uppercase tracking-tighter drop-shadow-sm">Tuần Này</h2>
                        <p className="text-slate-500 font-bold text-lg">Kéo ngang để xem kế hoạch</p>
                    </div>
                </div>
                <div className="flex gap-6 h-full overflow-x-auto min-w-[1000px] pb-10 snap-x snap-mandatory px-4 py-4 items-center">
                    {orderedIndices.map((idx, i) => {
                        const day = DAYS_VI[idx];
                        const isToday = idx === todayIdx;
                        const sched = getBaseSchedule(idx);
                        const floats = data.weekFloat[idx] || [];
                        const now = new Date();
                        
                        // Logic change: calculate date based on sequenceIndex i (0 = today, 1 = tomorrow...)
                        const targetDate = new Date(now);
                        targetDate.setDate(now.getDate() + i);
                        
                        const dd = String(targetDate.getDate()).padStart(2, '0');
                        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
                        const yyyy = targetDate.getFullYear();
                        const dateKey = `${dd}-${mm}-${yyyy}`;
                        const historyEntry = data.history.find(h => h.date === dateKey);
                        let doneCount = 0;
                        
                        // Look up date-specific keys for accurate count
                        sched.forEach(t => { if(data.dayChecks[`${dateKey}_${t.n}`]) doneCount++; });
                        floats.forEach(f => { if(f.done) doneCount++; });
                        const totalCount = sched.length + floats.length;
                        const livePc = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
                        let displayPc = isToday ? livePc : (historyEntry ? parseInt(historyEntry.pc) : 0);

                        return (
                            <div key={idx} className={`snap-center shrink-0 w-[300px] flex flex-col transition-all duration-500 rounded-[2.5rem] relative group 
                                ${isToday ? 'scale-110 z-20 shadow-[0_20px_60px_-10px_rgba(16,185,129,0.4)] ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-50' : 'scale-95 opacity-80 hover:opacity-100 hover:scale-100 bg-white shadow-xl'}`}>
                                <div className={`relative p-8 rounded-t-[2.5rem] overflow-hidden flex flex-col justify-between h-48 ${isToday ? 'bg-slate-900 text-white' : 'bg-white border-b-2 border-slate-100'}`}>
                                    {isToday && <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900"></div>}
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className={`font-black uppercase text-3xl tracking-widest ${isToday ? 'text-white' : 'text-slate-300'}`}>{day}</div>
                                        {isToday && <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">NOW</div>}
                                    </div>
                                    <div className="relative z-10 mt-auto">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className={`text-4xl font-black ${isToday ? 'text-emerald-400' : 'text-slate-800'}`}>{displayPc}%</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{floats.length} Linh hoạt</div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200/20 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${isToday ? 'bg-emerald-400' : 'bg-slate-800'}`} style={{width: `${displayPc}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex-1 p-6 rounded-b-[2.5rem] space-y-4 min-h-[300px] flex flex-col ${isToday ? 'bg-white border-x-4 border-b-4 border-slate-900' : 'bg-white'}`}>
                                    <div className="space-y-3">
                                        {sched.filter(i => i.n.includes("Làm") || i.n.toLowerCase().includes("gym") || i.n.includes("Yoga") || i.n.includes("đất sét") || i.n.includes("Lên rừng")).map((item, ii) => {
                                             const solidBg = item.c === 'work' ? 'bg-rose-500 text-white' : item.c === 'health' ? 'bg-emerald-500 text-white' : 'bg-violet-500 text-white';
                                             return (
                                                <div key={ii} className={`flex items-center gap-3 p-3 rounded-2xl shadow-md ${solidBg}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-black text-white/80 uppercase tracking-wider">{item.s}</div>
                                                        <div className="text-sm font-bold truncate">{item.n}</div>
                                                    </div>
                                                </div>
                                             );
                                        })}
                                    </div>
                                    <div className="h-px bg-slate-100 my-2"></div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-black text-slate-400 uppercase">Việc linh hoạt</div>
                                            <button onClick={() => openModal('week-float', idx)} className="bg-slate-100 hover:bg-emerald-500 hover:text-white p-2 rounded-xl transition-all shadow-sm"><PlusCircle size={16}/></button>
                                        </div>
                                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                            {floats.map((f, fi) => (
                                                <div key={fi} className={`group flex items-center gap-3 text-xs p-3 rounded-xl border-2 transition-all cursor-pointer ${f.done ? 'bg-slate-50 border-transparent opacity-50' : 'bg-white border-slate-100 hover:border-emerald-400'}`}>
                                                    <input type="checkbox" checked={f.done} onChange={() => { const nd = { ...data }; nd.weekFloat[idx][fi].done = !nd.weekFloat[idx][fi].done; setData(nd); }} className="accent-slate-900 w-5 h-5 rounded-md shrink-0 cursor-pointer" />
                                                    <span className={`font-bold flex-1 truncate ${f.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.n}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteWeekFloat(idx, fi); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><X size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderQuotes = () => { /* ... existing ... */ return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 transform -rotate-3 border-4 border-emerald-500">
                    <Quote size={48} className="text-emerald-400 animate-pulse" />
                 </div>
                 <div>
                     <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm">KHO TÀNG ĐỘNG LỰC</h2>
                     <p className="text-slate-500 font-bold text-xl">Lưu trữ những câu nói truyền cảm hứng của bạn</p>
                 </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" value={newQuote} onChange={(e) => setNewQuote(e.target.value)} placeholder="Nhập câu quote..." className="flex-1 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-bold text-slate-800" onKeyDown={(e) => e.key === 'Enter' && addQuote()} />
                    <button onClick={addQuote} className="bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={20} />Thêm Quote</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.quotes.map((q, i) => (
                    <div key={i} className="group relative bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                        <Quote size={40} className="text-slate-100 absolute top-6 left-6" />
                        <p className="relative z-10 text-xl font-bold text-slate-700 italic leading-relaxed pl-8 pr-8">"{q}"</p>
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                            <button onClick={() => openModal('quote-edit', null, i)} className="p-2 bg-slate-50 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 size={18} /></button>
                            <button onClick={() => deleteQuote(i)} className="p-2 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )};

    const renderNotes = () => (
        <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-yellow-500/30 transform -rotate-3 border-4 border-yellow-500">
                    <StickyNote size={48} className="text-yellow-400 animate-pulse" />
                 </div>
                 <div>
                     <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm">GHI CHÚ</h2>
                     <p className="text-slate-500 font-bold text-xl">Lưu lại mọi ý tưởng và thông tin quan trọng</p>
                 </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex justify-between items-center">
                 <div><h3 className="text-2xl font-black text-slate-800">DANH SÁCH GHI CHÚ</h3><p className="text-slate-500 font-bold">Quản lý ghi chú cá nhân</p></div>
                 <button onClick={() => openModal('note')} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2"><Plus size={18} />Thêm Ghi Chú</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.notes.map((note, i) => (
                    <div key={note.id || i} className="group relative bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all duration-300 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{note.date}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal('note-edit', null, i)} className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-500 rounded-xl"><Edit2 size={16} /></button>
                                <button onClick={() => deleteNote(i)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2">{note.title}</h3>
                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap line-clamp-6 flex-1">{note.content}</p>
                    </div>
                ))}
                {data.notes.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-50">
                        <StickyNote size={64} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-xl font-black text-slate-400">CHƯA CÓ GHI CHÚ NÀO</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProjects = () => { /* ... existing ... */ return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border-2 border-slate-100">
                <div><h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase">DỰ ÁN CẦN LÀM</h3><p className="text-slate-500 font-bold mt-1">Quản lý mục tiêu & Deadline rực lửa 🔥</p></div>
                <button type="button" onClick={() => openModal('proj')} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2"><Rocket size={18} />Dự án mới</button>
            </div>
            {data.projects.length === 0 && <div className="text-center text-gray-400 py-20 font-black text-xl opacity-50">CHƯA CÓ DỰ ÁN NÀO. 🚀</div>}
            <div className="grid grid-cols-1 gap-8">
                {data.projects.map((p, pi) => {
                    const stats = getRecursiveStats(p.subs);
                    const total = stats.total;
                    const doneCount = stats.done;
                    const pc = total === 0 ? 0 : Math.round((doneCount / total) * 100);
                    
                    const daysLeft = getDaysLeft(p.end); const deadlineConf = getDeadlineConfig(daysLeft);
                    const catColor = p.cat === 'work' ? 'bg-rose-500' : p.cat === 'health' ? 'bg-emerald-500' : 'bg-violet-500';
                    const motivation = getMotivationQuote(pc);

                    return (
                        <div key={pi} className={`bg-white rounded-[2rem] shadow-sm border-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${deadlineConf.style.includes('border') ? deadlineConf.style.split(' ').find(c => c.startsWith('border')) : 'border-slate-100'}`}>
                             <div className={`${catColor} p-6 flex justify-between items-start text-white`}>
                                <div className="flex-1"><h3 className="text-2xl font-black leading-tight mb-2">{p.name}</h3><div className="flex items-center gap-2 opacity-90 text-sm font-bold"><Calendar size={14} />{formatDateDisplay(p.start)} - {formatDateDisplay(p.end)}</div></div>
                                <div className="flex gap-2 relative z-10 items-start"><button onClick={() => openModal('proj-edit', pi)} className="p-2 bg-white/20 rounded-xl hover:bg-white hover:text-slate-900"><Edit2 size={18} /></button><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteProject(pi); }} className="p-2 bg-white/20 rounded-xl hover:bg-white hover:text-red-500"><Trash2 size={18} /></button></div>
                            </div>
                            <div className="p-6">
                                <div className="mb-8">
                                    <div className="flex justify-between items-end mb-3"><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiến độ</div><div className={`text-4xl font-black ${catColor.replace('bg-', 'text-')}`}>{pc}%</div></div><div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className={`h-full transition-all duration-1000 ${catColor}`} style={{ width: `${pc}%` }}></div></div><div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm border ${deadlineConf.style}`}><Clock size={14} />{deadlineConf.text} ({deadlineConf.label})</div>
                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                                        <Zap className="text-amber-400 shrink-0 fill-amber-400" size={18} />
                                        <p className="text-sm font-bold text-slate-600 italic">"{motivation}"</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-4"><h4 className="font-black text-slate-800 uppercase text-sm tracking-wider">Danh sách việc</h4><button onClick={() => openModal('proj-sub', pi)} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors">+ Thêm việc</button></div>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {p.subs.map((s, si) => (
                                        <ProjectTaskItem 
                                            key={si} 
                                            task={s} 
                                            path={[] as number[]} 
                                            pi={pi} 
                                            si={si} 
                                            toggleProjectSub={toggleProjectSub}
                                            deleteProjectSub={deleteProjectSub}
                                            openModal={openModal}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )};
    const renderGoals = () => { 
        // 1. Calculate Stats for Pie Chart
        const stats = (['health', 'beauty', 'work'] as const).map(cat => {
            let done = 0;
            let total = 0;
            let completedGoals = 0;
            const totalGoalsCount = data.goals[cat].length;
            
            // Helper to count recursive
            const countSubs = (subs: GoalSub[]) => {
                subs.forEach(s => {
                    total++;
                    if(s.done) done++;
                    if(s.subs) countSubs(s.subs);
                });
            };

            data.goals[cat].forEach(g => {
                countSubs(g.subs);
                // Check if goal is "completed" (has subs and all are done)
                // If a goal has no subs, it's not "complete" in this logic unless we want to count it.
                // Assuming a goal is complete if it has > 0 subs and all are done.
                if (g.subs.length > 0 && g.subs.every(s => s.done)) {
                    completedGoals++;
                }
            });

            return {
                name: GOAL_CATS[cat],
                value: done,
                total: total,
                completedGoals: completedGoals,
                totalGoals: totalGoalsCount,
                color: CHART_COLORS[cat]
            };
        }).filter(s => s.total > 0 || s.totalGoals > 0);

        // Calculate data for Pie Chart based on completed tasks distribution across categories
        const pieData = stats.map(s => ({
            name: s.name,
            value: s.value,
            color: s.color
        })).filter(s => s.value > 0);

        return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                 <div className="flex items-center gap-6 flex-1">
                     <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-purple-500/30 transform rotate-6 border-4 border-purple-500"><Target size={48} className="text-purple-400 animate-pulse" /></div>
                     <div><h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm">MỤC TIÊU</h2><p className="text-slate-500 font-bold text-xl">Thu thập thành tựu & thăng cấp</p></div>
                 </div>
            </div>

            {/* PIE CHART SECTION */}
            {pieData.length > 0 && (
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase flex items-center gap-2">
                            <PieIcon className="text-purple-500" /> Thống kê hoàn thành
                            </h3>
                            <p className="text-slate-500 font-medium">Tỷ lệ các mục tiêu đã hoàn thành theo từng nhóm.</p>
                            <div className="mt-6 space-y-3">
                            {stats.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: entry.color}}></div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{entry.name}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                Đã xong {entry.completedGoals}/{entry.totalGoals} mục tiêu lớn
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-lg text-slate-900">{entry.value}/{entry.total} mục tiêu</span>
                                        <span className="text-xs font-bold text-slate-400">({entry.total > 0 ? Math.round(entry.value/entry.total*100) : 0}%)</span>
                                    </div>
                                </div>
                            ))}
                            </div>
                    </div>
                    <div className="w-full md:w-1/2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#1e293b', color: 'white' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="space-y-20">
                {(['health', 'beauty', 'work'] as const).map(cat => {
                    const items = data.goals[cat]; const styles = CAT_COLORS[cat];
                    const catColor = cat === 'work' ? 'bg-rose-500' : cat === 'health' ? 'bg-emerald-500' : 'bg-violet-500';

                    return (
                        <div key={cat} className="space-y-8 animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3 px-6 py-2 bg-white rounded-full shadow-lg border-2 border-slate-100" style={{ color: styles.dark }}>{GOAL_CATS[cat]}</h3>
                                <button type="button" onClick={() => openModal('goal', cat)} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl shadow-current transition-transform hover:scale-105 active:scale-95`} style={{ backgroundColor: styles.dark }}>+ MỤC TIÊU MỚI</button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-8">
                                {items.map((g, gi) => {
                                     // Calculate recursive stats for goal
                                     const stats = getRecursiveStats(g.subs);
                                     const total = stats.total;
                                     const doneCount = stats.done;
                                     const pc = total === 0 ? 0 : Math.round((doneCount / total) * 100);
                                     
                                     const daysLeft = getDaysLeft(g.end); 
                                     const deadlineConf = getGoalDeadlineConfig(daysLeft); // USE SPECIFIC GOAL CONFIG
                                     const motivation = getGoalMotivationQuote(pc);

                                    return (
                                        <div key={gi} className={`bg-white rounded-[2rem] shadow-sm border-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${deadlineConf.style.includes('border') ? deadlineConf.style.split(' ').find(c => c.startsWith('border')) : 'border-slate-100'}`}>
                                            <div className={`${catColor} p-6 flex justify-between items-start text-white`}>
                                                <div className="flex-1"><h3 className="text-2xl font-black leading-tight mb-2">{g.name}</h3><div className="flex items-center gap-2 opacity-90 text-sm font-bold"><Calendar size={14} />{formatDateDisplay(g.start)} - {formatDateDisplay(g.end)}</div></div>
                                                <div className="flex gap-2 relative z-10 items-start"><button onClick={() => openModal('goal-edit', cat, gi)} className="p-2 bg-white/20 rounded-xl hover:bg-white hover:text-slate-900"><Edit2 size={18} /></button><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteGoal(cat, gi); }} className="p-2 bg-white/20 rounded-xl hover:bg-white hover:text-red-500"><Trash2 size={18} /></button></div>
                                            </div>
                                            <div className="p-6">
                                                <div className="mb-8">
                                                    <div className="flex justify-between items-end mb-3"><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiến độ</div><div className={`text-4xl font-black ${catColor.replace('bg-', 'text-')}`}>{pc}%</div></div><div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className={`h-full transition-all duration-1000 ${catColor}`} style={{ width: `${pc}%` }}></div></div><div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm border ${deadlineConf.style}`}><Clock size={14} />{deadlineConf.text} ({deadlineConf.label})</div>
                                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                                                        <Zap className="text-amber-400 shrink-0 fill-amber-400" size={18} />
                                                        <p className="text-sm font-bold text-slate-600 italic">"{motivation}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mb-4"><h4 className="font-black text-slate-800 uppercase text-sm tracking-wider">Danh sách việc</h4><button onClick={() => openModal('goal-sub', cat, gi)} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors">+ Thêm việc</button></div>
                                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {g.subs.map((s, si) => (
                                                        <GoalTaskItem 
                                                            key={si} 
                                                            task={s} 
                                                            path={[] as number[]} 
                                                            cat={cat} 
                                                            gi={gi} 
                                                            si={si} 
                                                            toggleGoalSub={toggleGoalSub} 
                                                            deleteGoalSub={deleteGoalSub} 
                                                            openModal={openModal} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )};

    const renderHistory = () => {
        const historySorted = [...data.history].sort((a, b) => parseDateDDMMYYYY(b.date).getTime() - parseDateDDMMYYYY(a.date).getTime());
        const totalLogs = historySorted.length;
        const avgPc = totalLogs > 0 ? Math.round(historySorted.reduce((acc, cur) => acc + parseInt(cur.pc), 0) / totalLogs) : 0;
        let streak = 0; if (totalLogs > 0) { streak = 1; let currentDate = parseDateDDMMYYYY(historySorted[0].date); for (let i = 1; i < totalLogs; i++) { const prevDate = parseDateDDMMYYYY(historySorted[i].date); if (Math.ceil(Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) { streak++; currentDate = prevDate; } else break; } }
        let chartContent = null;
        let chartTitle = "";
        
        // Unified Distribution Data Logic
        let pieDistributionData: {name: string, value: number, color: string}[] = [];
        
        if (statTab !== 'day') {
             let sourceData: typeof historySorted = [];
             if (statTab === 'week') {
                 sourceData = historySorted.slice(0, 7);
             } else if (statTab === 'month') {
                 sourceData = historySorted.filter(h => {
                     const d = parseDateDDMMYYYY(h.date);
                     return d.getMonth() === (selectedMonth - 1) && d.getFullYear() === selectedYear;
                 });
             } else if (statTab === 'year') {
                 sourceData = historySorted.filter(h => {
                     const d = parseDateDDMMYYYY(h.date);
                     return d.getFullYear() === selectedYear;
                 });
             }

             let tW = 0, tH = 0, tB = 0;
             sourceData.forEach(h => {
                 // Use details if available, otherwise estimate based on PC or default
                 // Existing legacy data might not have details. 
                 const d = h.details;
                 if (d) {
                     tW += d.work;
                     tH += d.health;
                     tB += d.beauty;
                 } else {
                     // Fallback for legacy data without details
                     // Assuming even distribution or just Work
                     const val = parseInt(h.pc);
                     if (val > 0) {
                         tW += val; // Default to work
                     }
                 }
             });
             
             const totalPoints = tW + tH + tB;
             if (totalPoints > 0) {
                 pieDistributionData = [
                    { name: 'Công việc', value: Math.round((tW / totalPoints) * 100), color: CHART_COLORS.work },
                    { name: 'Sức khỏe', value: Math.round((tH / totalPoints) * 100), color: CHART_COLORS.health },
                    { name: 'Sắc đẹp', value: Math.round((tB / totalPoints) * 100), color: CHART_COLORS.beauty }
                 ].filter(x => x.value > 0);
             }
        }

        // Apply filters for history table
        const filteredHistoryForTable = historySorted.filter(h => {
             if (!filterStartDate && !filterEndDate) return true;
             const hDate = parseDateDDMMYYYY(h.date);
             const start = filterStartDate ? new Date(filterStartDate) : new Date(0);
             const end = filterEndDate ? new Date(filterEndDate) : new Date(9999, 11, 31);
             hDate.setHours(0,0,0,0);
             start.setHours(0,0,0,0);
             end.setHours(23,59,59,999);
             return hDate >= start && hDate <= end;
        });

        if (statTab === 'day') {
             // ... existing Day logic ...
             chartTitle = "Hôm nay";
             // ... copy existing day logic ...
             // Need to make sure I don't lose the day logic restoration from previous turn
             const todaySched = getBaseSchedule(new Date().getDay());
             const catCounts = { work: 0, health: 0, beauty: 0 };
             todaySched.forEach(t => { if(t.c) catCounts[t.c]++ });
             const catDone = { work: 0, health: 0, beauty: 0 };
             const todayStr = `${new Date().getDate().toString().padStart(2, '0')}-${(new Date().getMonth()+1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;

             // Updated to check date-specific keys
             todaySched.forEach(t => { if(data.dayChecks[`${todayStr}_${t.n}`]) catDone[t.c as keyof typeof catDone]++; });
             
             const todayLog = data.history.find(h => h.date === todayStr);
             const todayPc = todayLog ? parseInt(todayLog.pc) : 0;
             const motivation = "Hãy nỗ lực hết mình!"; // Placeholder for Day view since rules are for Projects

             const pieData = [ { name: 'Công việc', value: catCounts.work, color: '#f43f5e', done: catDone.work, total: catCounts.work }, { name: 'Sức khỏe', value: catCounts.health, color: '#10b981', done: catDone.health, total: catCounts.health }, { name: 'Sắc đẹp', value: catCounts.beauty, color: '#8b5cf6', done: catDone.beauty, total: catCounts.beauty } ].filter(i => i.value > 0);
             
             // Helper for text color based on completion
             const getProgressColor = (done: number, total: number) => {
                 if (total === 0) return "text-slate-500";
                 const p = (done / total) * 100;
                 if (p === 100) return "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
                 if (p >= 50) return "text-amber-400";
                 return "text-rose-400";
             };

             chartContent = ( 
                <div className="flex flex-col md:flex-row items-center justify-around h-full gap-8"> 
                    <div className="w-full md:w-1/2 h-[300px] relative"> 
                        <ResponsiveContainer width="100%" height="100%"> 
                            <PieChart> 
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none"> 
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)} 
                                    <Label value={`${todayPc}%`} position="center" className="text-5xl font-black fill-white drop-shadow-md" /> 
                                </Pie> 
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#1e293b', color: 'white' }} /> 
                            </PieChart> 
                        </ResponsiveContainer> 
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <p className="text-lg text-emerald-400 font-bold italic mb-2">"{motivation}"</p>
                        </div>
                        <div className="space-y-2">
                             <div className={`flex justify-between border-b border-slate-700 pb-2 transition-colors ${getProgressColor(catDone.work, catCounts.work)}`}><span className="font-bold">Công việc</span> <span className="font-bold">{catDone.work}/{catCounts.work}</span></div>
                             <div className={`flex justify-between border-b border-slate-700 pb-2 transition-colors ${getProgressColor(catDone.health, catCounts.health)}`}><span className="font-bold">Sức khỏe</span> <span className="font-bold">{catDone.health}/{catCounts.health}</span></div>
                             <div className={`flex justify-between transition-colors ${getProgressColor(catDone.beauty, catCounts.beauty)}`}><span className="font-bold">Sắc đẹp</span> <span className="font-bold">{catDone.beauty}/{catCounts.beauty}</span></div>
                        </div>
                    </div>
                </div> 
            );

        } else if (statTab === 'week' || statTab === 'month') {
            chartTitle = statTab === 'week' ? "7 ngày qua" : `Tháng ${selectedMonth}/${selectedYear}`;
            const isMonth = statTab === 'month';
            
            // Re-filter for Bar Chart specifically (needs sliced data for display)
            const filteredChartData = historySorted.filter(h => {
                if (statTab === 'week') return true; 
                // Month Logic
                const d = parseDateDDMMYYYY(h.date);
                return d.getMonth() === (selectedMonth - 1) && d.getFullYear() === selectedYear;
            });
            
            // No need to calculate distribution here anymore, done above.

            const chartData = filteredChartData.slice(0, isMonth ? 31 : 7).reverse().map(h => {
                const d = h.details || { work: parseInt(h.pc), health: 0, beauty: 0 };
                return {
                    name: h.date.split('-').slice(0, 2).join('/'),
                    work: d.work,
                    health: d.health,
                    beauty: d.beauty,
                    total: parseInt(h.pc)
                };
            });

            chartContent = (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                            cursor={{fill: '#ffffff10'}} 
                            contentStyle={{borderRadius: '16px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.5)', background: '#0f172a', color: 'white' }} 
                            formatter={(value: any) => `${value}%`}
                        />
                        <Legend verticalAlign="top" height={36}/>
                        
                        <Bar dataKey="work" name="Công việc" stackId="a" fill={CHART_COLORS.work} radius={[0,0,4,4]} barSize={isMonth ? 20 : 40} />
                        <Bar dataKey="health" name="Sức khỏe" stackId="a" fill={CHART_COLORS.health} />
                        <Bar dataKey="beauty" name="Sắc đẹp" stackId="a" fill={CHART_COLORS.beauty} radius={[4,4,0,0]} />
                        
                        <Line type="monotone" dataKey="total" name="Tổng" stroke={CHART_COLORS.line} strokeWidth={3} dot={{r:4, fill: CHART_COLORS.line}}>
                            <LabelList dataKey="total" position="top" offset={10} fill="#38bdf8" style={{ fontSize: '12px', fontWeight: 'bold' }} textAnchor="middle" formatter={(val: number) => `${val}%`} />
                        </Line>
                    </ComposedChart>
                </ResponsiveContainer>
            );
        } else if (statTab === 'year') {
             // ... New Year Logic (12 Month Grid) ...
             chartTitle = `Tổng quan Năm ${selectedYear}`;
             // ... copy existing year logic ...
             const monthStats = Array.from({length: 12}, (_, i) => {
                 const monthIndex = i; // 0-11
                 const daysInMonth = data.history.filter(h => {
                     const d = parseDateDDMMYYYY(h.date);
                     return d.getFullYear() === selectedYear && d.getMonth() === monthIndex;
                 });
                 
                 const avg = daysInMonth.length > 0 
                    ? Math.round(daysInMonth.reduce((acc, curr) => acc + parseInt(curr.pc), 0) / daysInMonth.length)
                    : 0;
                 
                 return { month: i + 1, avg, count: daysInMonth.length };
             });

             chartContent = (
                 <div className="grid grid-cols-4 gap-4 h-full content-center">
                     {monthStats.map((m) => {
                         let colorClass = "bg-slate-800 border-slate-700 text-slate-500";
                         if (m.count > 0) {
                             if (m.avg >= 80) colorClass = "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                             else if (m.avg >= 50) colorClass = "bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]";
                             else colorClass = "bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                         }

                         return (
                            <div key={m.month} className={`relative rounded-2xl p-4 border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${colorClass}`}>
                                <div className="text-xs font-black uppercase mb-1 opacity-80">Tháng {m.month}</div>
                                <div className="text-4xl font-black">{m.avg}%</div>
                                {m.count === 0 && <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]"><span className="text-[10px] uppercase font-bold text-white/50">Chưa có dữ liệu</span></div>}
                            </div>
                         );
                     })}
                 </div>
             );
        }

        return (
            <div className="space-y-10 animate-fade-in pb-20">
                {/* HUD Header & Summary Widgets ... existing code ... */}
                <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 shadow-lg shadow-blue-500/20"><Activity size={32} className="text-blue-400 animate-pulse" /></div>
                     <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Command Center</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <SummaryCard title="CHUỖI BẤT BẠI" value={`${streak}`} sub="Ngày rực lửa 🔥" icon={Flame} bgClass="bg-gradient-to-br from-orange-500 to-red-600 shadow-xl shadow-orange-500/30 border-none" />
                    <SummaryCard title="KỶ LUẬT THÉP" value={`${avgPc}%`} sub="Phong độ trung bình" icon={Activity} bgClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 border-none" />
                    <SummaryCard title="CHINH PHỤC" value={totalLogs} sub="Ngày đã chiến thắng" icon={Calendar} bgClass="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30 border-none" />
                    <SummaryCard title="DANH HIỆU" value={avgPc >= 80 ? "XUẤT SẮC" : "KHÁ TỐT"} sub="Đánh giá hiệu suất" icon={Trophy} bgClass="bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-xl shadow-purple-500/30 border-none" />
                </div>

                {/* Main Chart Section */}
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="flex flex-col md:flex-row justify-between items-center p-8 border-b border-slate-800 relative z-10 gap-4">
                        <div><h3 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{chartTitle}</h3></div>
                        <div className="flex flex-wrap items-center gap-4">
                            {statTab === 'month' && (
                                <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-slate-900 text-white font-bold p-2 rounded-lg outline-none border border-slate-700">
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                                    </select>
                                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-slate-900 text-white font-bold p-2 rounded-lg outline-none border border-slate-700">
                                        {YEAR_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                            {statTab === 'year' && (
                                <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-slate-900 text-white font-bold p-2 rounded-lg outline-none border border-slate-700">
                                        {YEAR_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">{(['day', 'week', 'month', 'year'] as const).map((t) => (<button key={t} onClick={() => setStatTab(t)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statTab === t ? 'bg-blue-500 text-white shadow-[0_0_15px_#3b82f6]' : 'text-slate-400 hover:text-white'}`}>{t === 'day' ? 'Ngày' : t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Năm'}</button>))}</div>
                        </div>
                    </div>
                    <div className="p-8 h-[450px] relative z-10">{chartContent}</div>
                </div>
                
                {/* Distribution Pie Chart (Only for Week/Month/Year) */}
                {(statTab === 'week' || statTab === 'month' || statTab === 'year') && pieDistributionData.length > 0 && (
                     <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                             <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase flex items-center gap-2">
                                <PieIcon className="text-purple-500" /> Phân bổ năng lượng
                             </h3>
                             <p className="text-slate-500 font-medium">Tỷ lệ thời gian bạn dành cho các khía cạnh cuộc sống trong giai đoạn này.</p>
                             <div className="mt-6 space-y-3">
                                {pieDistributionData.map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: entry.color}}></div>
                                            <span className="font-bold text-slate-700">{entry.name}</span>
                                        </div>
                                        <span className="font-black text-lg text-slate-900">{entry.value}%</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="w-full md:w-1/2 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                        {pieDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        <Label value="Total" position="center" className="text-sm font-bold fill-slate-400" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#1e293b', color: 'white' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                )}

                {/* Logs Table with Filters */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 relative z-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase"><History size={24} className="text-slate-400" />Nhật ký hoạt động</h3>
                        
                        {/* Fix: Added relative z-index to ensure clicks work and styled inputs better */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 relative z-30 shadow-sm">
                            <Filter size={16} className="text-slate-400 ml-2" />
                            <input 
                                type="date" 
                                value={filterStartDate} 
                                onChange={e => setFilterStartDate(e.target.value)} 
                                className="bg-white text-xs font-bold text-slate-600 outline-none border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:border-blue-500" 
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input 
                                type="date" 
                                value={filterEndDate} 
                                onChange={e => setFilterEndDate(e.target.value)} 
                                className="bg-white text-xs font-bold text-slate-600 outline-none border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:border-blue-500" 
                            />
                            {(filterStartDate || filterEndDate) && (
                                <button onClick={() => {setFilterStartDate(''); setFilterEndDate('')}} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar"><table className="w-full text-sm text-left border-collapse"><thead className="text-xs text-slate-400 font-black uppercase bg-slate-50 sticky top-0 z-10"><tr><th className="px-6 py-4 rounded-tl-xl">Ngày</th><th className="px-6 py-4">Hiệu suất</th><th className="px-6 py-4 rounded-tr-xl">Ghi chú</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredHistoryForTable.map((h, i) => (<tr key={i} className="hover:bg-slate-50 transition-colors group"><td className="px-6 py-4 font-mono font-bold text-slate-600">{h.date}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-sm ${parseInt(h.pc) >= 80 ? 'bg-emerald-500' : parseInt(h.pc) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div><span className="font-black text-lg">{h.pc}%</span></div></td><td className="px-6 py-4 text-slate-500 italic max-w-xs truncate group-hover:text-slate-800 transition-colors">{h.note}</td></tr>))}</tbody></table></div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 relative selection:bg-emerald-300 selection:text-emerald-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,_rgba(16,185,129,0.1)_0px,_transparent_50%),radial-gradient(at_100%_0%,_rgba(59,130,246,0.1)_0px,_transparent_50%),radial-gradient(at_100%_100%,_rgba(244,63,94,0.1)_0px,_transparent_50%)] pointer-events-none z-0"></div>
            {toast && (<div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-fade-in-left border-l-8 backdrop-blur-md ${toast.type === 'success' ? 'bg-white/90 border-emerald-500' : 'bg-white/90 border-rose-500'}`}>{toast.type === 'success' ? <CheckCircle size={32} className="text-emerald-500" /> : <Activity size={32} className="text-rose-500" />}<div><div className={`font-black text-sm uppercase ${toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{toast.type === 'success' ? 'Thành công' : 'Lỗi'}</div><div className="font-bold text-slate-700 text-sm">{toast.msg}</div></div></div>)}
            <div className="w-[320px] bg-[#020617] flex flex-col p-8 shrink-0 relative overflow-hidden z-50 shadow-2xl border-r border-slate-800">
                <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-4 text-2xl font-black text-white mb-12 uppercase tracking-tighter group cursor-pointer">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transform group-hover:rotate-12 transition-transform duration-500 ring-2 ring-white/10"><Brain size={32} strokeWidth={2.5} /></div>
                    <div><div className="leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-3xl italic">ADHD</div><div className="text-xs text-emerald-400 tracking-[0.3em] font-bold mt-1">STUDIO PRO</div></div>
                </div>
                <nav className="flex-1 space-y-3 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <SidebarItem icon={Calendar} label="Lịch Ngày" active={tab === 'day'} onClick={() => setTab('day')} colorClass="text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
                    <SidebarItem icon={Menu} label="Lịch Tuần" active={tab === 'week'} onClick={() => setTab('week')} colorClass="text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]" />
                    <SidebarItem icon={Rocket} label="Dự Án" active={tab === 'proj'} onClick={() => setTab('proj')} colorClass="text-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.3)]" />
                    <SidebarItem icon={Target} label="Mục Tiêu" active={tab === 'goals'} onClick={() => setTab('goals')} colorClass="text-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.3)]" />
                    <SidebarItem icon={TrendingUp} label="Thống Kê" active={tab === 'hist'} onClick={() => setTab('hist')} colorClass="text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                    <SidebarItem icon={StickyNote} label="GHI CHÚ" active={tab === 'notes'} onClick={() => setTab('notes')} colorClass="text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]" />
                    <SidebarItem icon={Quote} label="QUOTE" active={tab === 'quotes'} onClick={() => setTab('quotes')} colorClass="text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.3)]" />
                </nav>
                <div className="relative z-10 mt-4">
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 relative group hover:bg-white/10 transition-colors">
                        <Quote size={20} className="text-emerald-500 absolute -top-3 -left-2 bg-[#020617] p-1 rounded-full" />
                        <p className="text-slate-300 text-sm italic font-medium leading-relaxed">"{getDailyQuote(data.quotes)}"</p>
                        <div className="mt-2 flex items-center gap-2"><span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">TRẠM SẠC</span></div>
                    </div>
                </div>
                <div className="mt-4 border-t border-slate-800 pt-4 relative z-10 space-y-2 mb-4">
                     <button onClick={handleExport} className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all group">
                        <Download size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-wide">Sao lưu</span>
                     </button>
                     <button onClick={triggerImport} className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-slate-400 hover:text-blue-400 hover:bg-white/5 transition-all group">
                        <Upload size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-wide">Khôi phục</span>
                     </button>
                     <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="max-w-[1400px] mx-auto h-full">
                    {tab === 'day' && (<DayView 
                        daySubTasks={data.daySubTasks} 
                        dayChecks={data.dayChecks} 
                        history={data.history} 
                        onToggleMain={updateDayCheck} 
                        onToggleSub={(p, i) => {
                            const nd = {...data}; 
                            if (nd.daySubTasks[p]) { 
                                nd.daySubTasks[p][i].done = !nd.daySubTasks[p][i].done; 
                                // Auto-check main task if all subtasks are done
                                const allDone = nd.daySubTasks[p].every(s => s.done); 
                                nd.dayChecks = { ...nd.dayChecks, [p]: allDone }; 
                            } 
                            setData(nd);
                        }} 
                        onAddSub={(p) => openModal('day-sub', p)} 
                        onEditSub={(p, i) => openModal('day-sub', p, i, true)} 
                        onDeleteSub={deleteDaySub} 
                        onSubmitDay={submitDay} 
                    />)}
                    {tab === 'week' && renderWeek()}
                    {tab === 'proj' && renderProjects()}
                    {tab === 'goals' && renderGoals()}
                    {tab === 'hist' && renderHistory()}
                    {tab === 'quotes' && renderQuotes()}
                    {tab === 'notes' && renderNotes()}
                </div>
            </div>
            {isModalOpen && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border-4 border-slate-900"><div className="px-8 py-6 border-b border-slate-100 bg-slate-900 flex justify-between items-center"><h3 className="font-black text-2xl text-white uppercase tracking-tighter">{modalConfig.title}</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="text-white" /></button></div><div className="p-8 space-y-6"><div><label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">Nội dung</label><input className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/20 focus:border-slate-900 outline-none font-black text-lg text-slate-800 transition-all shadow-inner" value={modalForm.n || ''} onChange={e => setModalForm({...modalForm, n: e.target.value})} placeholder="Nhập tên..." autoFocus /></div>
            {(modalConfig.type === 'note' || modalConfig.type === 'note-edit') && (
                <div className="mt-4">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">Chi tiết</label>
                    <textarea 
                        className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/20 focus:border-slate-900 outline-none font-medium text-slate-800 transition-all shadow-inner min-h-[150px]" 
                        value={modalForm.content || ''} 
                        onChange={e => setModalForm({...modalForm, content: e.target.value})} 
                        placeholder="Viết nội dung ghi chú..." 
                    />
                </div>
            )}
            {(modalConfig.type === 'day-sub' || modalConfig.type.includes('proj') || modalConfig.type.includes('goal')) && (<div className="grid grid-cols-2 gap-6"><div><label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">Bắt đầu</label><input type={modalConfig.type === 'day-sub' ? "time" : "date"} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none font-bold shadow-sm focus:border-slate-900" value={modalForm.s || ''} onChange={e => setModalForm({...modalForm, s: e.target.value})} /></div><div><label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">Kết thúc</label><input type={modalConfig.type === 'day-sub' ? "time" : "date"} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none font-bold shadow-sm focus:border-slate-900" value={modalForm.e || ''} onChange={e => setModalForm({...modalForm, e: e.target.value})} /></div></div>)}{(modalConfig.type === 'proj' || modalConfig.type === 'proj-edit') && (<div><label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-wider">Loại dự án</label><div className="flex gap-3"><button onClick={() => setModalForm({...modalForm, cat: 'work'})} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wide border-2 transition-all ${modalForm.cat === 'work' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg scale-105' : 'border-slate-100 text-slate-300 hover:border-rose-200 bg-white'}`}>Công việc</button><button onClick={() => setModalForm({...modalForm, cat: 'health'})} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wide border-2 transition-all ${modalForm.cat === 'health' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg scale-105' : 'border-slate-100 text-slate-300 hover:border-emerald-200 bg-white'}`}>Sức khỏe</button><button onClick={() => setModalForm({...modalForm, cat: 'beauty'})} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wide border-2 transition-all ${modalForm.cat === 'beauty' ? 'border-violet-500 bg-violet-50 text-violet-600 shadow-lg scale-105' : 'border-slate-100 text-slate-300 hover:border-violet-200 bg-white'}`}>Sắc đẹp</button></div></div>)}<button onClick={handleSave} className="w-full py-5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/40 transition-all active:scale-[0.98] mt-4">XÁC NHẬN</button></div></div></div>)}
        </div>
    );
};

export default App;