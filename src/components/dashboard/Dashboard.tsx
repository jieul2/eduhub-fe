import { 
    Users, BookOpen,
    CheckCircle2, CreditCard, ChevronRight, UserMinus 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DashboardData, StatCardProps } from './Dashboard.types';

const StatItem = ({ title, value, icon: Icon, colorClass }: StatCardProps) => (
    <div className="flex flex-col gap-3 p-6 md:p-8 transition-colors hover:bg-background/50">
        <div className="flex items-center gap-3">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-bold text-muted">{title}</p>
        </div>
        <h3 className="text-4xl font-extrabold text-ink tracking-tight">{value}</h3>
    </div>
);

export const Dashboard = ({ data }: { data: DashboardData }) => {
    const { user, todayClasses, calendarEvents, adminStats, teacherStats } = data;
    
    // DB의 role 값에 따른 권한 분기
    const isAdmin = user.role === 'admin';
    const isInstructor = user.role === 'instructor';
    const isStudent = user.role === 'user'; // 학생 등 기본 유저

    // 호칭 설정
    const userTitle = isAdmin ? '원장님' : isInstructor ? '선생님' : '학생';

    const todayStr = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());

    return (
        <div className="flex flex-col gap-10 pb-12">
            {/* 환영 헤더 */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-primary">{todayStr}</span>
                    <h1 className="text-3xl font-bold text-ink md:text-4xl tracking-tight">
                        안녕하세요, {user.userName} {userTitle}!
                    </h1>
                </div>
                <p className="text-muted text-sm md:text-base">
                    {isAdmin ? '오늘의 전체 운영 현황입니다.' : 
                     isInstructor ? '오늘의 담당 수업 및 일정을 확인하세요.' : 
                     '오늘의 수업 시간표와 학원 일정을 확인하세요.'}
                </p>
            </section>

            {/* 통계 요약 (관리자, 강사에게만 노출 / 학생은 숨김) */}
            {!isStudent && (
                <section className="overflow-hidden rounded-3xl border border-border bg-paper shadow-sm">
                    <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 md:grid-cols-3 md:divide-x md:divide-y-0">
                        {isAdmin && adminStats ? (
                            <>
                                <StatItem title="당일 총 수업" value={`${adminStats.totalClassesToday}건`} icon={BookOpen} colorClass="bg-primary/10 text-primary" />
                                <StatItem title="결석 예상/확인" value={`${adminStats.absentCount}명`} icon={UserMinus} colorClass="bg-accent/10 text-accent" />
                                <StatItem title="당월 미납 인원" value={`${adminStats.unpaidCount}명`} icon={CreditCard} colorClass="bg-accent-2/10 text-accent-2" />
                            </>
                        ) : isInstructor && teacherStats ? (
                            <>
                                <StatItem title="오늘 내 수업" value={`${teacherStats.myClassesToday}건`} icon={BookOpen} colorClass="bg-primary/10 text-primary" />
                                <StatItem title="완료한 수업" value={`${teacherStats.completedClasses}건`} icon={CheckCircle2} colorClass="bg-accent-2/10 text-accent-2" />
                                <div className="hidden md:block bg-background/30" />
                            </>
                        ) : null}
                    </div>
                </section>
            )}

            <div className="grid gap-10 lg:grid-cols-3">
                {/* 왼쪽: 오늘 수업 일정 */}
                <section className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-ink">오늘 수업 일정</h2>
                        <Link href="/classes" className="text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center">
                            전체보기 <ChevronRight className="size-4" />
                        </Link>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {todayClasses.length > 0 ? todayClasses.map((cls) => (
                            <div key={cls._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-paper p-5 transition-all hover:bg-background border border-transparent hover:border-border hover:shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="flex flex-col items-center justify-center h-14 min-w-18 rounded-xl bg-background border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                                        <span className="text-sm font-extrabold text-ink group-hover:text-primary">{cls.time.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-lg font-bold text-ink">{cls.className}</span>
                                        <div className="flex items-center gap-2 text-sm text-muted font-medium">
                                            <span>{cls.room}</span>
                                            {/* 학생이나 관리자에게는 강사 이름 노출 */}
                                            {(isAdmin || isStudent) && cls.teacherName && (
                                                <>
                                                    <span className="text-border text-xs">|</span>
                                                    <span className="text-primary">{cls.teacherName} 선생님</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* '강사(instructor)'일 경우에만 출결 체크 버튼 노출 */}
                                {isInstructor && (
                                    <Link 
                                        href={`/classes/${cls._id}`} 
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-background transition-colors hover:bg-primary sm:w-auto w-full"
                                    >
                                        출결 체크
                                    </Link>
                                )}
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-border bg-background/50">
                                <BookOpen className="size-10 text-muted mb-3" />
                                <span className="text-muted font-medium">오늘 예정된 수업이 없습니다.</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 오른쪽: 공유 캘린더 (공통 노출) */}
                <section className="lg:col-span-1 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-ink">공유 캘린더</h2>
                        <Link href="/calendar" className="flex size-8 items-center justify-center rounded-full bg-paper text-muted hover:bg-primary/10 hover:text-primary transition-colors">
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>
                    
                    <div className="rounded-3xl border border-border bg-paper p-6 md:p-8">
                        {calendarEvents.length > 0 ? (
                            <div className="relative pl-6 border-l-2 border-border flex flex-col gap-8">
                                {calendarEvents.map((event) => (
                                    <div key={event._id} className="relative">
                                        <div className={cn(
                                            "absolute -left-7.75 top-1 size-3.5 rounded-full border-2 border-paper ring-4 ring-paper",
                                            event.category === 'meeting' ? 'bg-primary' : 
                                            event.category === 'absence' ? 'bg-accent' : 'bg-muted'
                                        )} />
                                        
                                        <div className="flex flex-col gap-1.5 -mt-1">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                event.category === 'meeting' ? 'text-primary' : 
                                                event.category === 'absence' ? 'text-accent' : 'text-muted'
                                            )}>{event.time}</span>
                                            <h4 className="text-base font-bold text-ink leading-tight">{event.title}</h4>
                                            {event.assignee && (
                                                <p className="text-sm font-medium text-muted flex items-center gap-1.5 mt-1">
                                                    <Users className="size-3.5" /> {event.assignee}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-sm font-medium text-muted">등록된 일정이 없습니다.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
