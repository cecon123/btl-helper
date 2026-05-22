"use client";

import {
  Activity,
  BookOpen,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  GraduationCap,
  Layers3,
  Lock,
  Moon,
  Network,
  PlayCircle,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  TimerReset,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dbTables,
  lifecycleStates,
  mavenModules,
  milestones,
  placeBidFlow,
  readiness,
  redZones,
  repoRoot,
  rolePaths,
  scenarioFlows,
  theoryTopics,
  testCases,
  type PageKey,
  type RoleKey,
  type StudyStatus,
} from "./data";
import {
  generatedAt,
  generatedManualCases,
  generatedQuestions,
  projectCodeFiles,
  type GeneratedCodeFile,
  type GeneratedManualCase,
  type GeneratedQuestion,
} from "./generatedProjectData";

const nav = [
  { key: "dashboard", label: "Learning Cockpit", icon: GraduationCap, href: "/" },
  { key: "roles", label: "Role paths", icon: Users, href: "/roles" },
  { key: "flows", label: "Visualize", icon: GitBranch, href: "/visualize" },
  { key: "code", label: "Code map", icon: FileCode2, href: "/code-map" },
  { key: "theory", label: "Theory library", icon: BookOpen, href: "/theory" },
  { key: "tests", label: "Test lab", icon: ClipboardCheck, href: "/test-lab" },
  { key: "interview", label: "Vấn đáp", icon: Sparkles, href: "/interview" },
] satisfies { key: PageKey; label: string; icon: typeof GraduationCap; href: string }[];

const routeByPage = Object.fromEntries(nav.map((item) => [item.key, item.href])) as Record<PageKey, string>;

const iconByLane = {
  Client: Code2,
  Socket: Network,
  Service: Layers3,
  DAO: Database,
  Realtime: Activity,
};

const statusLabel: Record<StudyStatus, string> = {
  done: "Đã nắm",
  review: "Cần ôn",
  risk: "Rủi ro vấn đáp",
};

const statusClass: Record<StudyStatus, string> = {
  done: "status-done",
  review: "status-review",
  risk: "status-risk",
};

const interviewFilters = ["All", "Flow", "Design", "SOLID", "Pattern", "Debug", "Test", "Line code"] as const;
const flowStepFilters = ["All", "Client", "Socket", "Protocol", "Service", "DAO", "Realtime", "Test"] as const;
type ThemeMode = "light" | "dark";

export default function LearningApp({ page }: { page: PageKey }) {
  const router = useRouter();
  const [role, setRole] = useState<RoleKey>("Bidder");
  const [query, setQuery] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lockMode, setLockMode] = useState<"race" | "locked">("locked");
  const [scenarioId, setScenarioId] = useState("startup");
  const [expandedScenarioStep, setExpandedScenarioStep] = useState("startup-server-main");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("btl-viva-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("btl-viva-progress") ?? "{}");
    } catch {
      return {};
    }
  });

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const currentRole = rolePaths.find((item) => item.role === role)!;
  const currentQuestion = generatedQuestions[questionIndex] ?? generatedQuestions[0];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("btl-viva-theme", theme);
  }, [theme]);

  const filteredFiles = useMemo(() => {
    if (!deferredQuery) return projectCodeFiles;
    return projectCodeFiles.filter((file) =>
      [
        file.path,
        file.layer,
        file.module,
        file.summary,
        ...file.methods.map((method) => `${method.name} ${method.code}`),
        ...file.importantLines.map((line) => `${line.line} ${line.code} ${line.explain}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery),
    );
  }, [deferredQuery]);

  const filteredTopics = useMemo(() => {
    if (!deferredQuery) return theoryTopics;
    return theoryTopics.filter((topic) =>
      [topic.title, topic.category, topic.summary, topic.projectExample, ...topic.files]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery),
    );
  }, [deferredQuery]);

  function toggleProgress(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("btl-viva-progress", JSON.stringify(next));
      return next;
    });
  }

  function navigateToPage(nextPage: PageKey) {
    router.push(routeByPage[nextPage]);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <aside className="sidebar" aria-label="Điều hướng chính">
        <div className="brand">
          <div className="brand-mark">
            <img src="/ltnc-cat.png" alt="" className="brand-logo" />
          </div>
          <div>
            <strong>BTL Viva Helper</strong>
            <span>online-auction-system</span>
          </div>
        </div>

        <nav className="nav-list">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                className={page === item.key ? "nav-item active" : "nav-item"}
                href={item.href}
              >
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="theme-toggle sidebar-theme-toggle" type="button" onClick={toggleTheme} aria-label="Đổi light/dark mode">
          <ThemeIcon size={17} aria-hidden />
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>

        <div className="sidebar-note">
          <span className="eyebrow">Repo gốc</span>
          <code>{repoRoot}</code>
        </div>
      </aside>

      <main id="main-content" className="main-content">
        <TopBar query={query} setQuery={setQuery} />
        {page === "dashboard" && (
          <Dashboard checked={checked} toggleProgress={toggleProgress} setActivePage={navigateToPage} theme={theme} />
        )}
        {page === "roles" && <Roles role={role} setRole={setRole} currentRole={currentRole} />}
        {page === "flows" && (
          <Visualize
            lockMode={lockMode}
            setLockMode={setLockMode}
            setActivePage={navigateToPage}
            scenarioId={scenarioId}
            setScenarioId={setScenarioId}
            expandedScenarioStep={expandedScenarioStep}
            setExpandedScenarioStep={setExpandedScenarioStep}
          />
        )}
        {page === "code" && <CodeMap files={filteredFiles} query={query} setQuery={setQuery} />}
        {page === "theory" && <Theory topics={filteredTopics} />}
        {page === "tests" && <Tests checked={checked} toggleProgress={toggleProgress} />}
        {page === "interview" && (
          <Interview
            question={currentQuestion}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            questions={generatedQuestions}
          />
        )}
      </main>
    </div>
  );
}

function TopBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Mục tiêu bảo vệ</p>
        <h1>Nhìn vào là học được luồng, code, test và lý thuyết</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} aria-hidden />
          <span className="sr-only">Tìm kiếm file, theory, test</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm: BidService, socket, Maven..."
            type="search"
          />
        </label>
      </div>
    </header>
  );
}

function Dashboard({
  checked,
  toggleProgress,
  setActivePage,
  theme,
}: {
  checked: Record<string, boolean>;
  toggleProgress: (id: string) => void;
  setActivePage: (page: PageKey) => void;
  theme: ThemeMode;
}) {
  const doneCount = Object.values(checked).filter(Boolean).length;
  const chartColors = theme === "dark"
    ? {
        axis: "#7d8794",
        grid: "#34445c",
        primary: "#7d91cc",
        cursor: "#243247",
        tooltipBg: "#172033",
        tooltipText: "#a7adb8",
      }
    : {
        axis: "#475569",
        grid: "#d9e2ec",
        primary: "#3157d5",
        cursor: "#eef4ff",
        tooltipBg: "#ffffff",
        tooltipText: "#111827",
      };
  const today = [
    { id: "todo-bid", label: "Giải thích PLACE_BID end-to-end", page: "flows" as PageKey },
    { id: "todo-concurrency", label: "Ôn race condition + transaction rollback", page: "theory" as PageKey },
    { id: "todo-tests", label: "Chạy và đọc BidServiceConcurrencyTest", page: "tests" as PageKey },
    { id: "todo-admin", label: "Tập demo role Admin và authorization", page: "roles" as PageKey },
  ];

  return (
    <section className="page-stack">
      <div className="hero-grid">
        <div className="panel intro-panel">
          <span className="eyebrow">Learning cockpit</span>
          <h2>Đường học cho cả nhóm, ưu tiên đúng điểm dễ bị hỏi xoáy.</h2>
          <p>
            App gom repo Java thành các mô-đun học: role, flow, code map, theory, test lab và bộ
            câu hỏi vấn đáp. Mỗi phần đều nối tới file thật, rule thật, test thật.
          </p>
          <div className="coverage-strip">
            <span><strong>{projectCodeFiles.length}</strong> file repo</span>
            <span><strong>{generatedQuestions.length}</strong> câu vấn đáp</span>
            <span><strong>{generatedManualCases.length}</strong> manual UI case</span>
            <span><strong>{new Date(generatedAt).toLocaleDateString("vi-VN")}</strong> ngày index</span>
          </div>
          <div className="quick-actions">
            <button className="primary-button" type="button" onClick={() => setActivePage("flows")}>
              <PlayCircle size={18} aria-hidden />
              Học flow PLACE_BID
            </button>
            <button className="ghost-button" type="button" onClick={() => setActivePage("interview")}>
              <Sparkles size={18} aria-hidden />
              Luyện vấn đáp
            </button>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-title">
            <h3>Readiness radar</h3>
            <span>{doneCount} mục đã tick local</span>
          </div>
          <div className="radar-wrap">
            <ResponsiveContainer width="100%" height={245}>
              <RadarChart data={readiness}>
                <PolarGrid stroke={chartColors.grid} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: chartColors.axis, fontSize: 12 }} />
                <Radar dataKey="score" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.24} />
                <Tooltip
                  contentStyle={{ background: chartColors.tooltipBg, borderColor: chartColors.grid, color: chartColors.tooltipText }}
                  labelStyle={{ color: chartColors.tooltipText }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="panel-title">
            <h3>Checklist hôm nay</h3>
            <span>chống rủi ro 0 điểm nhóm</span>
          </div>
          <div className="check-list">
            {today.map((item) => (
              <label key={item.id} className="check-row">
                <input
                  type="checkbox"
                  checked={Boolean(checked[item.id])}
                  onChange={() => toggleProgress(item.id)}
                />
                <span>{item.label}</span>
                <button type="button" onClick={() => setActivePage(item.page)}>
                  Mở
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Vùng đỏ cần ôn</h3>
            <span>ưu tiên trước buổi mock</span>
          </div>
          <ul className="risk-list">
            {redZones.map((zone) => (
              <li key={zone}>
                <ShieldCheck size={16} aria-hidden />
                <span>{zone}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Tiến độ theo năng lực</h3>
          <span>đọc nhanh để chia ca học</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={milestones} layout="vertical" margin={{ left: 18, right: 28 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: chartColors.axis }} />
            <YAxis dataKey="label" type="category" width={150} tick={{ fill: chartColors.axis, fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: chartColors.tooltipBg, borderColor: chartColors.grid, color: chartColors.tooltipText }}
              labelStyle={{ color: chartColors.tooltipText }}
              cursor={{ fill: chartColors.cursor }}
            />
            <Bar dataKey="value" fill={chartColors.primary} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Roles({
  role,
  setRole,
  currentRole,
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  currentRole: (typeof rolePaths)[number];
}) {
  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Role learning paths"
        title="Học theo vai: bidder, seller, admin"
        text="Mỗi role có quyền, màn hình, message type và test/demo khác nhau. Người học chọn role để nhìn journey end-to-end."
      />
      <div className="segmented" role="tablist" aria-label="Chọn role">
        {rolePaths.map((path) => (
          <button
            key={path.role}
            type="button"
            className={role === path.role ? "active" : ""}
            onClick={() => setRole(path.role)}
          >
            {path.role}
          </button>
        ))}
      </div>

      <div className="grid role-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>{currentRole.role}</h3>
            <span>mục tiêu role</span>
          </div>
          <p className="lead">{currentRole.goal}</p>
          <h4>Quyền/message phải thuộc</h4>
          <div className="tag-cloud">
            {currentRole.permissions.map((permission) => (
              <code key={permission}>{permission}</code>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Điểm vấn đáp</h3>
            <span>đừng học lướt</span>
          </div>
          <ul className="clean-list">
            {currentRole.mustKnow.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Journey map</h3>
            <span>client to server to data</span>
        </div>
        <div className="journey">
          {currentRole.journey.map((step, index) => (
            <article key={step.step} className="journey-step">
              <span className="step-index">{index + 1}</span>
              <h4>{step.step}</h4>
              <p><strong>Client:</strong> {step.client}</p>
              <p><strong>Server:</strong> {step.server}</p>
              <p><strong>Data:</strong> {step.data}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visualize({
  lockMode,
  setLockMode,
  setActivePage,
  scenarioId,
  setScenarioId,
  expandedScenarioStep,
  setExpandedScenarioStep,
}: {
  lockMode: "race" | "locked";
  setLockMode: (mode: "race" | "locked") => void;
  setActivePage: (page: PageKey) => void;
  scenarioId: string;
  setScenarioId: (id: string) => void;
  expandedScenarioStep: string;
  setExpandedScenarioStep: (id: string) => void;
}) {
  const selectedScenario = scenarioFlows.find((flow) => flow.id === scenarioId) ?? scenarioFlows[0];
  const [flowFilter, setFlowFilter] = useState<(typeof flowStepFilters)[number]>("All");
  const filteredScenarioSteps = useMemo(() => {
    if (flowFilter === "All") return selectedScenario.steps;
    const needle = flowFilter.toLowerCase();
    return selectedScenario.steps.filter((step) =>
      [step.badge, step.layer, step.role, step.path, step.title].join(" ").toLowerCase().includes(needle),
    );
  }, [flowFilter, selectedScenario.steps]);

  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Visual lab"
        title="Component visualize để nhìn cơ chế chạy"
        text="Các sơ đồ này biến phần dễ nói mơ hồ như socket, lock, scheduler, transaction, Maven thành hình ảnh có thể chỉ tay giải thích."
      />

      <div className="panel scenario-panel">
        <div className="panel-title">
          <div>
            <h3>Scenario flow deck</h3>
            <span>tham khảo style học theo luồng: bước to file to code to liên kết</span>
          </div>
        </div>
        <div className="segmented scenario-tabs" role="tablist" aria-label="Chọn scenario flow">
          {scenarioFlows.map((flow) => (
            <button
              key={flow.id}
              type="button"
              className={selectedScenario.id === flow.id ? "active" : ""}
              onClick={() => {
                setScenarioId(flow.id);
                setExpandedScenarioStep(flow.steps[0]?.id ?? "");
              }}
            >
              {flow.label}
            </button>
          ))}
        </div>
        <div className="interview-filter-bar flow-filter-bar" aria-label="Lọc layer trong scenario">
          {flowStepFilters.map((filter) => (
            <button
              key={filter}
              className={flowFilter === filter ? "active" : ""}
              type="button"
              onClick={() => setFlowFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="scenario-heading">
          <h3>{selectedScenario.title}</h3>
          <p>{selectedScenario.subtitle}</p>
        </div>
        <div className="scenario-steps">
          {filteredScenarioSteps.map((step, index) => {
            const isOpen = expandedScenarioStep === step.id;
            return (
              <article key={step.id} className={`scenario-step ${isOpen ? "open" : ""}`}>
                <button type="button" onClick={() => setExpandedScenarioStep(isOpen ? "" : step.id)}>
                  <span className="step-index">{step.order}</span>
                  <span className={`module-chip module-${step.module}`}>{step.badge}</span>
                  <strong>{step.title}</strong>
                  <small>{step.summary}</small>
                </button>
                {isOpen && (
                  <div className="scenario-detail">
                    <div className="flow-detail-grid">
                      <div className="example-box">
                        <strong>Vai trò/layer:</strong>
                        <span>{step.role ?? step.module} · {step.layer ?? step.badge}</span>
                      </div>
                      <div className="example-box">
                        <strong>Bước này chạy khi nào:</strong>
                        <span>{step.trigger ?? step.summary}</span>
                      </div>
                      <div className="example-box">
                        <strong>Input:</strong>
                        <span>{step.input ?? "Dữ liệu từ bước trước trong luồng hoặc thao tác hiện tại của người dùng/server."}</span>
                      </div>
                      <div className="example-box">
                        <strong>Output:</strong>
                        <span>{step.output ?? "State/response/event được chuyển sang bước kế tiếp."}</span>
                      </div>
                    </div>
                    <div className="example-box">
                      <strong>Ý nghĩa file:</strong>
                      <span>{step.meaning}</span>
                    </div>
                    <div className="example-box">
                      <strong>Vì sao dòng code này quan trọng:</strong>
                      <span>{step.whyItMatters ?? step.summary}</span>
                    </div>
                    <LineRefList
                      path={step.path}
                      refs={step.codeNotes.map((note) => ({
                        line: note.line,
                        code: `${step.path}: ${note.code}`,
                        explain: note.note,
                      }))}
                    />
                    <div className="flow-detail-grid">
                      <div className="example-box">
                        <strong>Bước kế tiếp:</strong>
                        <span>{step.nextLinks?.length ? step.nextLinks.join(" -> ") : "Đây là bước cuối của luồng hiện tại."}</span>
                      </div>
                      <div className="example-box failure-box">
                        <strong>Nếu lỗi thì sao:</strong>
                        <span>{step.failureMode ?? "Luồng dừng ở bước này; cần trace lại response/log và file đang được mở trong Code map."}</span>
                      </div>
                    </div>
                    <button className="ghost-button" type="button" onClick={() => setActivePage("code")}>
                      Mở Code map và tìm path này
                    </button>
                    <div className="tag-cloud">
                      {step.links.map((link) => (
                        <code key={link}>{link}</code>
                      ))}
                    </div>
                  </div>
                )}
                {index < filteredScenarioSteps.length - 1 && <i aria-hidden />}
              </article>
            );
          })}
          {!filteredScenarioSteps.length && (
            <p className="hint">Không có bước nào khớp filter này trong luồng đang chọn.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Swimlane PLACE_BID</h3>
          <button type="button" onClick={() => setActivePage("code")}>
            Xem file liên quan
          </button>
        </div>
        <div className="swimlane">
          {placeBidFlow.map((step) => {
            const Icon = iconByLane[step.lane];
            return (
              <article key={step.id} className={`flow-card lane-${step.lane.toLowerCase()}`}>
                <div>
                  <Icon size={18} aria-hidden />
                  <span>{step.lane}</span>
                </div>
                <h4>{step.title}</h4>
                <p>{step.detail}</p>
                <code>{step.file}</code>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="panel-title">
            <h3>Concurrency timeline</h3>
            <div className="tiny-toggle" aria-label="Chọn chế độ lock">
              <button
                type="button"
                className={lockMode === "race" ? "active" : ""}
                onClick={() => setLockMode("race")}
              >
                Không lock
              </button>
              <button
                type="button"
                className={lockMode === "locked" ? "active" : ""}
                onClick={() => setLockMode("locked")}
              >
                Có lock
              </button>
            </div>
          </div>
          <ConcurrencyTimeline mode={lockMode} />
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Auction state machine</h3>
            <span>lifecycle + scheduler</span>
          </div>
          <div className="state-machine">
            {lifecycleStates.map((state, index) => (
              <div key={state.name} className="state-node">
                <span>{state.name}</span>
                <p>{state.note}</p>
                {index < lifecycleStates.length - 1 && <i aria-hidden />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid two">
        <DatabaseDiagram />
        <SocketInspector />
      </div>

      <div className="grid two">
        <MavenGraph />
        <SchedulerReplay />
      </div>
    </section>
  );
}

function ConcurrencyTimeline({ mode }: { mode: "race" | "locked" }) {
  const rows =
    mode === "race"
      ? [
          ["T1", "Bidder A đọc current_price = 100", "pass"],
          ["T2", "Bidder B cũng đọc current_price = 100", "warn"],
          ["T3", "A update 120", "pass"],
          ["T4", "B update 110 ghi sau", "fail"],
          ["Kết quả", "Lost update: giá cuối có thể sai", "fail"],
        ]
      : [
          ["T1", "Bidder A lấy lock auction#42", "pass"],
          ["T2", "Bidder B đợi lock cùng auction", "warn"],
          ["T3", "A transaction commit giá 120", "pass"],
          ["T4", "B đọc lại current_price = 120", "pass"],
          ["Kết quả", "Không lost update, rule được kiểm trên dữ liệu mới", "pass"],
        ];

  return (
    <div className="timeline">
      {rows.map(([time, text, tone]) => (
        <div key={`${time}-${text}`} className={`timeline-row ${tone}`}>
          <span>{time}</span>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

function DatabaseDiagram() {
  return (
    <div className="panel">
      <div className="panel-title">
        <h3>ERD + table inspector</h3>
        <span>SQLite server-side</span>
      </div>
      <div className="erd-grid">
        {dbTables.map((table) => (
          <article key={table.name} className="table-card" style={{ borderTopColor: table.color }}>
            <h4>{table.name}</h4>
            {table.columns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </article>
        ))}
      </div>
      <p className="hint">
        Quan hệ chính: users to items/auctions/bids, items to auctions, auctions to bids/auto_bids.
      </p>
    </div>
  );
}

function SocketInspector() {
  return (
    <div className="panel">
      <div className="panel-title">
        <h3>Socket message inspector</h3>
        <span>newline JSON</span>
      </div>
      <div className="code-sample">
        <pre>{`Request
{
  "type": "PLACE_BID",
  "token": "session-token",
  "payload": { "auctionId": 42, "amount": 150.0 }
}

Response
{
  "success": true,
  "message": "Bid placed",
  "payload": { "currentPrice": 150.0 }
}

Event
{
  "type": "BID_UPDATE",
  "payload": { "auctionId": 42, "bidder": "linh" }
}`}</pre>
      </div>
    </div>
  );
}

function MavenGraph() {
  return (
    <div className="panel">
      <div className="panel-title">
        <h3>Maven dependency graph</h3>
        <span>parent reactor</span>
      </div>
      <div className="maven-graph">
        {mavenModules.map((module) => (
          <article key={module.name} className={module.name === "root build" ? "maven-node maven-root" : "maven-node"}>
            <Boxes size={18} aria-hidden />
            {module.name === "root build" && <span className="node-eyebrow">root pom + reactor</span>}
            <h4>{module.name}</h4>
            <p>{module.purpose}</p>
            <div className="tag-cloud">
              {module.deps.map((dep) => (
                <code key={dep}>{dep}</code>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SchedulerReplay() {
  const data = [
    { tick: "00s", due: 0, closed: 0 },
    { tick: "10s", due: 2, closed: 1 },
    { tick: "20s", due: 3, closed: 3 },
    { tick: "retry", due: 1, closed: 1 },
  ];

  return (
    <div className="panel">
      <div className="panel-title">
        <h3>Scheduler replay</h3>
        <span>close + retry</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis dataKey="tick" tick={{ fill: "var(--muted)" }} />
          <YAxis tick={{ fill: "var(--muted)" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }}
            labelStyle={{ color: "var(--ink)" }}
          />
          <Line type="monotone" dataKey="due" stroke="var(--amber)" strokeWidth={2} />
          <Line type="monotone" dataKey="closed" stroke="var(--green)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <p className="hint">Ý cần nói: scheduler chạy server-side, retry settlement phải idempotent.</p>
    </div>
  );
}

function CodeMap({
  files,
  query,
  setQuery,
}: {
  files: GeneratedCodeFile[];
  query: string;
  setQuery: (value: string) => void;
}) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const [layerFilter, setLayerFilter] = useState("all");
  const [extensionFilter, setExtensionFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");

  const modules = useMemo(() => uniqueSorted(projectCodeFiles.map((file) => file.module)), []);
  const layers = useMemo(() => uniqueSorted(projectCodeFiles.map((file) => file.layer)), []);
  const extensions = useMemo(() => uniqueSorted(projectCodeFiles.map((file) => file.extension)), []);

  const visibleFiles = useMemo(
    () =>
      files.filter((file) => {
        if (moduleFilter !== "all" && file.module !== moduleFilter) return false;
        if (layerFilter !== "all" && file.layer !== layerFilter) return false;
        if (extensionFilter !== "all" && file.extension !== extensionFilter) return false;
        if (scopeFilter === "source" && !file.path.includes("/src/main/java/")) return false;
        if (scopeFilter === "ui" && !/(controller|resources\/fxml|resources\/css|client\/src\/main)/.test(file.path)) return false;
        if (scopeFilter === "tests" && !file.path.includes("/src/test/")) return false;
        if (scopeFilter === "docs" && !file.path.startsWith("docs/")) return false;
        if (scopeFilter === "build" && !/(pom\.xml|\.github|\.properties|\.sql|logback\.xml)/.test(file.path)) return false;
        return true;
      }),
    [extensionFilter, files, layerFilter, moduleFilter, scopeFilter],
  );
  const hasActiveFilters =
    moduleFilter !== "all" || layerFilter !== "all" || extensionFilter !== "all" || scopeFilter !== "all" || query.trim();

  const layerCounts = visibleFiles.reduce<Record<string, number>>((acc, file) => {
    acc[file.layer] = (acc[file.layer] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Code map"
        title="Toàn bộ code map sinh từ thư mục project"
        text={`Đang hiển thị ${visibleFiles.length}/${projectCodeFiles.length} file có nghĩa trong repo, gồm Java, FXML, CSS, Maven, SQL, docs và test. Mỗi file có line refs để mở đúng dòng khi vấn đáp.`}
      />
      <label className="wide-search">
        <Search size={18} aria-hidden />
        <span>Tìm trong code map</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: DAO, BidService, Authorization" />
      </label>

      <div className="panel code-filter-panel">
        <div className="filter-row">
          <label>
            <span>Module</span>
            <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
              <option value="all">Tất cả module</option>
              {modules.map((module) => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Layer</span>
            <select value={layerFilter} onChange={(event) => setLayerFilter(event.target.value)}>
              <option value="all">Tất cả layer</option>
              {layers.map((layer) => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Loại file</span>
            <select value={extensionFilter} onChange={(event) => setExtensionFilter(event.target.value)}>
              <option value="all">Tất cả extension</option>
              {extensions.map((extension) => (
                <option key={extension} value={extension}>{extension}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="scope-tabs" role="tablist" aria-label="Học theo từng phần code map">
          {[
            ["all", "Tất cả"],
            ["source", "Source Java"],
            ["ui", "Client UI"],
            ["tests", "Tests"],
            ["docs", "Docs"],
            ["build", "Build/DB/CI"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={scopeFilter === value ? "active" : ""}
              onClick={() => setScopeFilter(value)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={hasActiveFilters ? "reset-visible" : ""}
            onClick={() => {
              setModuleFilter("all");
              setLayerFilter("all");
              setExtensionFilter("all");
              setScopeFilter("all");
              setQuery("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="coverage-pills" aria-label="Thống kê layer trong code map">
        {Object.entries(layerCounts).map(([layer, count]) => (
          <span key={layer}>
            <strong>{count}</strong> {layer}
          </span>
        ))}
      </div>

      <div className="file-grid">
        {visibleFiles.map((file) => (
          <article key={file.path} className="panel file-card">
            <div className="file-head">
              <span>{file.layer}</span>
              <strong>{file.lineCount} dòng</strong>
            </div>
            <h3>{file.path}</h3>
            <p>{file.summary}</p>
            <h4>Line refs cần mở khi bị hỏi</h4>
            <LineRefList refs={file.importantLines.slice(0, 8)} path={file.path} />
            <div className="file-meta">
              <div>
                <span>Declarations</span>
                {file.declarations.slice(0, 4).map((item) => (
                  <code key={`${item.line}-${item.name}`}>L{item.line} {item.kind} {item.name}</code>
                ))}
              </div>
              <div>
                <span>Methods / actions</span>
                {[
                  ...file.methods.slice(0, 5).map((item) => `L${item.line} ${item.name}()`),
                  ...(file.fxml?.actions.slice(0, 5).map((item) => `L${item.line} #${item.action}`) ?? []),
                ].map((item) => (
                  <code key={item}>{item}</code>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function LineRefList({ refs, path }: { refs: { line: number; code: string; explain: string }[]; path?: string }) {
  if (!refs.length) {
    return <p className="hint">Generator chưa thấy line đặc biệt; mở file để đọc tuần tự từ dòng 1.</p>;
  }

  return (
    <div className="line-ref-list">
      {refs.map((ref) => (
        <div key={`${path}-${ref.line}-${ref.code}`} className="line-ref">
          <span>L{ref.line}</span>
          <code>{ref.code}</code>
          <p>{ref.explain}</p>
        </div>
      ))}
    </div>
  );
}

function Theory({ topics }: { topics: typeof theoryTopics }) {
  const grouped = topics.reduce<Record<string, typeof theoryTopics>>((acc, topic) => {
    acc[topic.category] ??= [];
    acc[topic.category].push(topic);
    return acc;
  }, {});

  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Theory library"
        title="Lý thuyết gắn trực tiếp vào repo"
        text="Không học khái niệm rời rạc. Mỗi thẻ cho biết định nghĩa, ví dụ trong online-auction-system, file cần mở và link đọc thêm."
      />
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="theory-group">
          <h3>{category}</h3>
          <div className="theory-grid">
            {items.map((topic) => (
              <article key={topic.id} className="panel theory-card">
                <div className="file-head">
                  <span>{topic.level}</span>
                  <strong className={statusClass[topic.status]}>{statusLabel[topic.status]}</strong>
                </div>
                {topic.category === "Design Principles & Patterns" && (
                  <span className="principle-badge">Pattern / SOLID / Principle</span>
                )}
                <h4>{topic.title}</h4>
                <p>{topic.summary}</p>
                <div className="example-box">
                  <strong>Trong project:</strong>
                  <span>{topic.projectExample}</span>
                </div>
                <div className="tag-cloud">
                  {topic.files.map((file) => (
                    <code key={file}>{file}</code>
                  ))}
                </div>
                <div className="learn-links">
                  {topic.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function Tests({
  checked,
  toggleProgress,
}: {
  checked: Record<string, boolean>;
  toggleProgress: (id: string) => void;
}) {
  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Test lab"
        title="Đọc test như đọc kịch bản bảo vệ"
        text="Mỗi test được chia Arrange, Act, Assert và câu hỏi vấn đáp tương ứng để thành viên biết chạy gì, chứng minh gì."
      />

      <div className="grid two">
        {testCases.map((test) => (
          <article key={test.name} className="panel test-card">
            <div className="panel-title">
              <h3>{test.name}</h3>
              <label className="mini-check">
                <input
                  type="checkbox"
                  checked={Boolean(checked[test.name])}
                  onChange={() => toggleProgress(test.name)}
                />
                Đã giải thích được
              </label>
            </div>
            <p>{test.target}</p>
            <code className="command">{test.command}</code>
            <div className="aaa">
              <p><strong>Arrange:</strong> {test.arrange}</p>
              <p><strong>Act:</strong> {test.act}</p>
              <p><strong>Assert:</strong> {test.assert}</p>
            </div>
            <div className="example-box">
              <strong>Câu hỏi vấn đáp:</strong>
              <span>{test.viva}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Manual UI cases sinh từ FXML/controller</h3>
          <span>{generatedManualCases.length} case: thao tác, kỳ vọng, dòng code chạy</span>
        </div>
        <div className="manual-grid generated-manual-grid">
          {generatedManualCases.map((script) => (
            <article key={script.id}>
              <div className="file-head">
                <span>{script.role}</span>
                <strong>{script.executionPath.length} refs</strong>
              </div>
              <h4>{script.title}</h4>
              <ol>
                {script.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p><strong>Kết quả đúng:</strong> {script.expected}</p>
              <LineRefList
                path={script.title}
                refs={script.executionPath.map((ref) => ({
                  line: ref.line,
                  code: `${"path" in ref && ref.path ? `${ref.path}: ` : ""}${ref.code}`,
                  explain: ref.explain,
                }))}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Interview({
  question,
  questionIndex,
  setQuestionIndex,
  showAnswer,
  setShowAnswer,
  questions,
}: {
  question: GeneratedQuestion;
  questionIndex: number;
  setQuestionIndex: (index: number) => void;
  showAnswer: boolean;
  setShowAnswer: (value: boolean) => void;
  questions: GeneratedQuestion[];
}) {
  const [bankQuery, setBankQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof interviewFilters)[number]>("All");
  const deferredBankQuery = useDeferredValue(bankQuery.trim().toLowerCase());
  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      const filterMatch =
        activeFilter === "All" ||
        item.tags.some((tag) => tag.toLowerCase().includes(activeFilter.toLowerCase())) ||
        item.topic.toLowerCase().includes(activeFilter.toLowerCase()) ||
        item.level.toLowerCase().includes(activeFilter.toLowerCase());
      if (!filterMatch) return false;
      if (!deferredBankQuery) return true;
      return [
        item.question,
        item.answer,
        item.intent,
        item.topic,
        item.level,
        item.filePath,
        ...item.answerBullets,
        ...item.mustMention,
        ...item.commonMistakes,
        ...item.tags,
        ...item.lineRefs.map((ref) => `${ref.code} ${ref.explain}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(deferredBankQuery);
    });
  }, [activeFilter, deferredBankQuery, questions]);
  const visibleQuestionButtons = useMemo(() => {
    const currentId = question.id;
    const topMatches = filteredQuestions.slice(0, 72);
    if (topMatches.some((item) => item.id === currentId)) return topMatches;
    return [question, ...topMatches].slice(0, 72);
  }, [filteredQuestions, question]);

  function nextQuestion(delta: number) {
    const next = (questionIndex + delta + questions.length) % questions.length;
    setQuestionIndex(next);
    setShowAnswer(false);
  }

  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="Mock viva"
        title={`Ngân hàng ${questions.length} câu vấn đáp có line code`}
        text="Câu hỏi được sinh theo kiểu giảng viên: hỏi luồng, nguyên lý thiết kế, debug, test, role và line code có ngữ cảnh."
      />

      <div className="interview-layout">
        <div className="panel question-panel">
          <div className="file-head">
            <span>{question.level}</span>
            <strong>{question.topic}</strong>
          </div>
          <div className="tag-row question-tags">
            {Array.from(new Set(question.tags)).slice(0, 6).map((tag, index) => (
              <span key={`${tag}-${index}`}>{tag}</span>
            ))}
          </div>
          <h2>{question.question}</h2>
          <div className="rubric-card intent-card">
            <div>
              <Sparkles size={18} aria-hidden />
              <strong>Mục tiêu câu hỏi</strong>
            </div>
            <p>{question.intent}</p>
          </div>
          <div className="example-box">
            <strong>File chính:</strong>
            <span>{question.filePath || "Flow tổng hợp nhiều file"}</span>
          </div>
          <LineRefList refs={question.lineRefs} path={question.filePath} />
          <div className="rubric-grid">
            <div className="rubric-card">
              <div>
                <ShieldCheck size={18} aria-hidden />
                <strong>Ý bắt buộc</strong>
              </div>
              <ul>
                {question.mustMention.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rubric-card">
              <div>
                <TimerReset size={18} aria-hidden />
                <strong>Follow-up nhanh</strong>
              </div>
              <ul>
                {question.followUps.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="quick-actions">
            <button className="primary-button" type="button" onClick={() => setShowAnswer(!showAnswer)}>
              <BookOpen size={18} aria-hidden />
              {showAnswer ? "Ẩn đáp án" : "Mở đáp án"}
            </button>
            <button className="ghost-button" type="button" onClick={() => nextQuestion(1)}>
              Câu tiếp
            </button>
            <button className="ghost-button" type="button" onClick={() => nextQuestion(-1)}>
              Câu trước
            </button>
          </div>
          {showAnswer && (
            <div className="answer-box">
              <h3>Đáp án mẫu</h3>
              <p>{question.answer}</p>
              <div className="answer-rubric">
                <div>
                  <h4>Cách trả lời đạt điểm</h4>
                  <ul>
                    {question.answerBullets.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={16} aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Sai lầm cần tránh</h4>
                  <ul>
                    {question.commonMistakes.map((item) => (
                      <li key={item}>
                        <TimerReset size={16} aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Follow-up</h3>
            <span>{questionIndex + 1}/{questions.length}</span>
          </div>
          <ul className="clean-list">
            {question.followUps.map((item) => (
              <li key={item}>
                <TimerReset size={16} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <label className="question-filter">
            <Search size={16} aria-hidden />
            <span className="sr-only">Tìm câu hỏi vấn đáp</span>
            <input
              value={bankQuery}
              onChange={(event) => setBankQuery(event.target.value)}
              placeholder="Lọc 300 câu theo file/topic..."
            />
          </label>
          <div className="interview-filter-bar" aria-label="Lọc nhóm câu hỏi vấn đáp">
            {interviewFilters.map((filter) => (
              <button
                key={filter}
                className={filter === activeFilter ? "active" : ""}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="question-jump">
            {visibleQuestionButtons.map((item) => {
              const originalIndex = questions.findIndex((questionItem) => questionItem.id === item.id);
              return (
              <button
                key={item.id}
                className={originalIndex === questionIndex ? "active" : ""}
                type="button"
                onClick={() => {
                  setQuestionIndex(originalIndex);
                  setShowAnswer(false);
                }}
                aria-label={`Mở câu hỏi ${originalIndex + 1}`}
              >
                {originalIndex + 1}
              </button>
              );
            })}
          </div>
          {filteredQuestions.length > visibleQuestionButtons.length && (
            <p className="hint question-hint">
              Đang hiện {visibleQuestionButtons.length}/{filteredQuestions.length} câu phù hợp. Gõ tên file, topic hoặc line code để lọc hẹp hơn.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
