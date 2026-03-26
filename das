<!DOCTYPE html>

<html class="light" lang="ko">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Student Directory | Academia Admin</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap"
        rel="stylesheet" />
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "tertiary-fixed": "#d3c8f9",
                        "primary-container": "#92c1fe",
                        "tertiary-dim": "#564d77",
                        "on-primary-fixed-variant": "#00457a",
                        "on-secondary": "#f7f9ff",
                        "error-container": "#fa746f",
                        "inverse-primary": "#92c1fe",
                        "primary-fixed-dim": "#84b4ef",
                        "background": "#f4faff",
                        "on-secondary-fixed-variant": "#505c6d",
                        "tertiary": "#625983",
                        "on-primary-fixed": "#002648",
                        "surface-variant": "#bde9ff",
                        "surface-dim": "#a6e3ff",
                        "on-surface": "#003748",
                        "on-error-container": "#6e0a12",
                        "on-background": "#003748",
                        "secondary-fixed": "#d7e3f8",
                        "error": "#a83836",
                        "error-dim": "#67040d",
                        "tertiary-fixed-dim": "#c5bbeb",
                        "outline": "#40839d",
                        "on-tertiary-container": "#484068",
                        "on-tertiary-fixed-variant": "#514972",
                        "on-secondary-fixed": "#344050",
                        "surface": "#f4faff",
                        "secondary": "#546071",
                        "primary": "#2d6197",
                        "on-tertiary-fixed": "#342d54",
                        "surface-container-highest": "#bde9ff",
                        "surface-container": "#d9f2ff",
                        "on-primary": "#f7f9ff",
                        "on-secondary-container": "#475363",
                        "surface-container-low": "#e6f6ff",
                        "secondary-dim": "#485465",
                        "on-primary-container": "#003c6b",
                        "secondary-fixed-dim": "#c9d5e9",
                        "primary-dim": "#1e558b",
                        "on-surface-variant": "#1e6680",
                        "surface-bright": "#f4faff",
                        "on-error": "#fff7f6",
                        "surface-tint": "#2d6197",
                        "surface-container-lowest": "#ffffff",
                        "primary-fixed": "#92c1fe",
                        "inverse-on-surface": "#84a1b0",
                        "secondary-container": "#d7e3f8",
                        "outline-variant": "#7abad7"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
                },
            },
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }

        body {
            font-family: 'Inter', sans-serif;
        }

        h1,
        h2,
        h3 {
            font-family: 'Manrope', sans-serif;
        }

        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
    </style>
    <style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
</head>

<body class="bg-surface text-on-surface min-h-screen flex overflow-hidden">
    <!-- NavigationDrawer (Shared Component) -->
    <aside
        class="fixed left-0 top-0 h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-950 flex flex-col py-4 z-50 hidden md:flex">
        <div class="text-blue-900 dark:text-blue-50 font-black tracking-widest text-lg px-6 py-8">
            ACADEMIA
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            <!-- Section: 메인 -->
            <div class="px-6 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">메인</div>
            <a class="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold shadow-sm rounded-l-none rounded-r-full mr-4 flex items-center px-6 py-3 transition-all"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="dashboard">dashboard</span>
                <span class="text-sm font-medium tracking-wide">Dashboard</span>
            </a>
            <!-- Section: 학생 / 학부모 -->
            <div class="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">학생 / 학부모</div>
            <a class="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-all hover:translate-x-1 duration-200"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="school">school</span>
                <span class="text-sm font-medium tracking-wide">Students</span>
            </a>
            <div class="pl-12 space-y-1">
                <a class="block py-2 text-xs text-blue-700 font-bold" href="#">학생 목록</a>
                <a class="block py-2 text-xs text-slate-500 hover:text-blue-600" href="#">학생 상세</a>
                <a class="block py-2 text-xs text-slate-500 hover:text-blue-600" href="#">학부모 목록</a>
            </div>
            <!-- Section: 수업 관리 -->
            <div class="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">수업 관리</div>
            <a class="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-all hover:translate-x-1 duration-200"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="menu_book">menu_book</span>
                <span class="text-sm font-medium tracking-wide">Academic</span>
            </a>
            <!-- Section: 재무 -->
            <div class="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">재무</div>
            <a class="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-all hover:translate-x-1 duration-200"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="payments">payments</span>
                <span class="text-sm font-medium tracking-wide">Finance</span>
            </a>
            <!-- Section: 보고서 -->
            <div class="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">보고서</div>
            <a class="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-all hover:translate-x-1 duration-200"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="analytics">analytics</span>
                <span class="text-sm font-medium tracking-wide">Reports</span>
            </a>
            <!-- Section: 설정 -->
            <div class="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">설정</div>
            <a class="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-all hover:translate-x-1 duration-200"
                href="#">
                <span class="material-symbols-outlined mr-3" data-icon="settings">settings</span>
                <span class="text-sm font-medium tracking-wide">Settings</span>
            </a>
        </nav>
        <!-- Profile Section -->
        <div class="px-6 py-6 mt-auto border-t border-slate-200/50">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden">
                    <img alt="Instructor Profile" data-alt="Avatar of Kim Ji-soo instructor"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx0j8xYqS4oblJoStZ77rIwMmI-p4OawDXxCWjZ8VYoccEBHOZ7C3429COATPieT_hMRGsio-S6QYyh473wPu2Y5jszEsPnSKimOpZCj8ug7aCBHCekPVTMENH5X0nQazPSAU_8WFDTLl8XGipN_QD4XD0QpmzI79ssodgkp0Yw3NpYsD8jaqPlcdrIpW6m6iI2VLimpZ7BTak2YiKXI5DsQ7-PnkzE8dKyg0nAOok3fEsHiU0b9ytP1PbEn939LU1JAghHMXbKnA" />
                </div>
                <div>
                    <div class="text-sm font-bold text-slate-800">김지수 강사</div>
                    <div class="text-[10px] text-slate-500 uppercase tracking-tighter">Senior Academic Lead</div>
                </div>
            </div>
        </div>
    </aside>
    <!-- Main Content Canvas -->
    <main class="flex-1 flex flex-col min-w-0 md:ml-64 relative overflow-y-auto h-screen bg-surface">
        <!-- TopAppBar (Shared Component) -->
        <header
            class="fixed top-0 right-0 left-0 md:left-64 z-40 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 shadow-[0_12px_40px_-10px_rgba(0,55,72,0.08)]">
            <div class="flex items-center gap-6">
                <!-- Breadcrumbs -->
                <nav class="hidden lg:flex items-center text-xs font-medium space-x-2 text-slate-500">
                    <span>Home</span>
                    <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Dashboards</span>
                    <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span class="text-blue-700 font-bold">Default</span>
                </nav>
                <!-- Search Bar -->
                <div class="relative group">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">search</span>
                    <input
                        class="pl-10 pr-4 py-1.5 bg-slate-100/50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="Quick search..." type="text" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button class="p-2 text-slate-500 hover:bg-blue-50/50 rounded-xl transition-colors">
                    <span class="material-symbols-outlined" data-icon="grid_view">grid_view</span>
                </button>
                <button class="p-2 text-slate-500 hover:bg-blue-50/50 rounded-xl transition-colors relative">
                    <span class="material-symbols-outlined" data-icon="notifications">notifications</span>
                    <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                </button>
                <button class="p-2 text-slate-500 hover:bg-blue-50/50 rounded-xl transition-colors">
                    <span class="material-symbols-outlined" data-icon="settings">settings</span>
                </button>
                <div class="h-6 w-px bg-slate-200 mx-2"></div>
                <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50/50 rounded-xl transition-all">
                    <div class="w-7 h-7 bg-slate-200 rounded-lg overflow-hidden">
                        <img alt="Admin Profile" data-alt="Admin user avatar thumbnail"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0YGZQ8NY8NXvWs4cFdfwEje2WwLZVGTpSR58PySn7x_6DIKtyl3gx-mZPlZoq2-5QKIXf6PX3KR-tn828XGAKw53HX4d1RXP_Vz-LQcQt6M16_A0QQ6osi0mQ9YRpafzMQHeRSQbl54r7WHrS_qQz_IP9QWRQm-A6oA3RW3ubJnHkR5IyHla8mlGFP7A1qW94jilSsnMYIQxOHBGHElQvR6Vu8E2mhN_I3KYG67uzl58c31ZU5RIunOAbnKQWdAsNd_NfVZeNnt0" />
                    </div>
                    <span class="text-sm font-semibold text-slate-700 hidden sm:block">Admin</span>
                </button>
            </div>
        </header>
        <!-- Page Content -->
        <div class="mt-16 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
            <!-- Page Header -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-blue-900 tracking-tight">학생조회 (Table View)</h1>
                    <p class="text-slate-500 text-sm mt-1">Manage and monitor all registered students within the
                        institution.</p>
                </div>
                <div class="flex gap-2">
                    <button
                        class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-dim transition-all active:scale-95">
                        <span class="material-symbols-outlined text-sm">person_add</span>
                        학생 등록
                    </button>
                </div>
            </div>
            <!-- Info Box (SCREEN_5 style) -->
            <section
                class="bg-surface-container-low p-6 rounded-xl border-l-[3px] border-primary flex items-start gap-4">
                <div
                    class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined" data-weight="fill">info</span>
                </div>
                <div>
                    <h3 class="font-bold text-on-surface-variant text-base">학생 정보 안내</h3>
                    <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                        학생 목록에서는 학번, 소속 학과, 학년 등 필수 정보를 한눈에 확인할 수 있습니다.
                        상세 조회를 원하시면 성명을 클릭하십시오. 개인정보 보호를 위해 휴대폰 번호와 이메일은 권한이 있는 사용자에게만 노출됩니다.
                    </p>
                </div>
            </section>
            <!-- Table Controls -->
            <div
                class="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm">
                <div class="flex items-center gap-4">
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium border border-slate-100">
                        <input class="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                        <span>전체 선택</span>
                    </div>
                    <div class="text-sm text-slate-500">
                        총 <span class="text-blue-700 font-bold">10</span> 건
                    </div>
                    <div class="h-4 w-px bg-slate-200"></div>
                    <div class="flex items-center gap-2 text-sm text-slate-600">
                        <select class="bg-transparent border-none focus:ring-0 text-sm font-bold p-0 pr-6">
                            <option>100</option>
                            <option>50</option>
                            <option>25</option>
                        </select>
                        <span>개씩 보기</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            class="pl-10 pr-4 py-2 bg-surface border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                            placeholder="학생명 또는 학번 검색" type="text" />
                    </div>
                    <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Download">
                        <span class="material-symbols-outlined">download</span>
                    </button>
                    <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Filter">
                        <span class="material-symbols-outlined">filter_list</span>
                    </button>
                    <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Columns">
                        <span class="material-symbols-outlined">view_column</span>
                    </button>
                </div>
            </div>
            <!-- Table Container (Editorial Style) -->
            <div
                class="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_-10px_rgba(0,55,72,0.08)] overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/50">
                                <th class="px-6 py-4 w-12">
                                    <input class="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox" />
                                </th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    성명</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    학번</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    대학</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    학과(부)</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    학년</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    성별</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    휴대폰번호</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                                    이메일</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100/50">
                            <!-- Row 1 -->
                            <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <td class="px-6 py-4">
                                    <input class="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                            KD</div>
                                        <span
                                            class="text-sm font-bold text-slate-900 group-hover:text-primary">강다니엘</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600 font-medium">20230001</td>
                                <td class="px-6 py-4 text-sm text-slate-600">공과대학</td>
                                <td class="px-6 py-4 text-sm text-slate-600">컴퓨터공학과</td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">3학년</span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600">남</td>
                                <td class="px-6 py-4 text-sm text-slate-600">010-1234-5678</td>
                                <td class="px-6 py-4 text-sm text-slate-600">daniel.k@academia.edu</td>
                            </tr>
                            <!-- Row 2 -->
                            <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <td class="px-6 py-4">
                                    <input class="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                            JS</div>
                                        <span
                                            class="text-sm font-bold text-slate-900 group-hover:text-primary">지수</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600 font-medium">20230002</td>
                                <td class="px-6 py-4 text-sm text-slate-600">예술대학</td>
                                <td class="px-6 py-4 text-sm text-slate-600">디자인학과</td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">2학년</span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600">여</td>
                                <td class="px-6 py-4 text-sm text-slate-600">010-9876-5432</td>
                                <td class="px-6 py-4 text-sm text-slate-600">jisoo.v@academia.edu</td>
                            </tr>
                            <!-- Row 3 (Example data) -->
                            <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <td class="px-6 py-4">
                                    <input class="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                            MH</div>
                                        <span
                                            class="text-sm font-bold text-slate-900 group-hover:text-primary">민호</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600 font-medium">20230003</td>
                                <td class="px-6 py-4 text-sm text-slate-600">경영대학</td>
                                <td class="px-6 py-4 text-sm text-slate-600">회계학과</td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">4학년</span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600">남</td>
                                <td class="px-6 py-4 text-sm text-slate-600">010-4455-6677</td>
                                <td class="px-6 py-4 text-sm text-slate-600">minho.park@academia.edu</td>
                            </tr>
                            <!-- Additional Rows Placeholder (Total 10) -->
                            <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <td class="px-6 py-4">
                                    <input class="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox" />
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                                            YJ</div>
                                        <span
                                            class="text-sm font-bold text-slate-900 group-hover:text-primary">윤지</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600 font-medium">20230004</td>
                                <td class="px-6 py-4 text-sm text-slate-600">인문대학</td>
                                <td class="px-6 py-4 text-sm text-slate-600">국어국문학과</td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">1학년</span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-600">여</td>
                                <td class="px-6 py-4 text-sm text-slate-600">010-8899-0011</td>
                                <td class="px-6 py-4 text-sm text-slate-600">yj.lee@academia.edu</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Pagination -->
                <div class="px-6 py-4 flex items-center justify-between bg-slate-50/50">
                    <div class="text-xs text-slate-500">Showing 1 to 10 of 10 results</div>
                    <div class="flex gap-1">
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400">
                            <span class="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">1</button>
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs">2</button>
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs">3</button>
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400">
                            <span class="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Dashboard Analytics Preview (Asymmetric Grid) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                <div
                    class="md:col-span-2 bg-primary rounded-xl p-8 text-on-primary relative overflow-hidden flex flex-col justify-between h-48 shadow-xl shadow-primary/10">
                    <div class="relative z-10">
                        <h4 class="text-xl font-bold opacity-90">Quick Enrollment Update</h4>
                        <p class="text-sm opacity-70 mt-1">There are 12 pending student applications requiring approval.
                        </p>
                    </div>
                    <div class="flex gap-4 relative z-10">
                        <button
                            class="px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">Review
                            Applications</button>
                        <button
                            class="px-4 py-2 bg-primary-dim text-white rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors">Dismiss</button>
                    </div>
                    <!-- Abstract Decorative Background -->
                    <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div
                    class="bg-surface-container-highest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/10">
                    <div class="flex items-center justify-between">
                        <span
                            class="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Attendance</span>
                        <span class="material-symbols-outlined text-blue-700">trending_up</span>
                    </div>
                    <div class="mt-4">
                        <div class="text-3xl font-black text-blue-900">94.8%</div>
                        <div class="text-xs text-slate-500 mt-1">+2.4% from last month</div>
                    </div>
                    <div class="mt-4 flex gap-1 items-end h-12">
                        <div class="flex-1 bg-primary/20 rounded-t-sm h-[40%]"></div>
                        <div class="flex-1 bg-primary/20 rounded-t-sm h-[60%]"></div>
                        <div class="flex-1 bg-primary/20 rounded-t-sm h-[50%]"></div>
                        <div class="flex-1 bg-primary/20 rounded-t-sm h-[80%]"></div>
                        <div class="flex-1 bg-primary/20 rounded-t-sm h-[90%]"></div>
                        <div class="flex-1 bg-primary rounded-t-sm h-[95%]"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Floating Action Button (FAB) Suppressed on List/Settings as per Mandate -->
    </main>
    <!-- Mobile Navigation Trigger (Hidden on Desktop) -->
    <button
        class="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center md:hidden z-50">
        <span class="material-symbols-outlined">menu</span>
    </button>
</body>

</html>
