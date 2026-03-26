import { Dashboard } from '@/components/dashboard/Dashboard';
import { DashboardData } from '@/components/dashboard/Dashboard.types';

// 임시(Mock) 데이터 - 향후 API 연동 시 백엔드 스키마와 1:1 매칭됨
const mockData: DashboardData = {
    user: {
        _id: 'user_001',
        userName: '김민수',
        role: 'user', // 'admin', 'instructor', 'user' 중 택 1
    },
    todayClasses: [
        { _id: 'cls_1', className: '중등 수학 심화반', time: '14:00 - 15:30', room: '제 3강의실', teacherName: '김민수' },
        { _id: 'cls_2', className: '고등 수학 선행반', time: '16:00 - 18:00', room: '제 1강의실', teacherName: '이서연' },
    ],
    calendarEvents: [
        { _id: 'cal_1', title: '전체 강사 정기 회의', category: 'meeting', time: '13:00 - 13:50' },
        { _id: 'cal_2', title: '이서연 강사 연차', category: 'absence', time: '종일', assignee: '이서연' },
    ],
    adminStats: {
        unpaidCount: 8,
        absentCount: 3,
        totalClassesToday: 24,
    },
    teacherStats: {
        myClassesToday: 2,
        completedClasses: 0,
    }
};

export default function DashboardPage() {
    return <Dashboard data={mockData} />;
}
