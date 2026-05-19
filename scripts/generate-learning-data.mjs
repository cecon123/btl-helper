import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = "D:\\Code\\java\\online-auction-system";
const outFile = path.resolve("src/generatedProjectData.ts");

const excludedDirs = new Set([
  ".git",
  ".gitnexus",
  ".agents",
  ".claude",
  ".gemini",
  "target",
  "uploads",
  ".idea",
  ".vscode",
]);
const includedExtensions = new Set([
  ".java",
  ".fxml",
  ".css",
  ".xml",
  ".properties",
  ".sql",
  ".md",
  ".json",
  ".yml",
  ".yaml",
]);

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) return [];
      return walk(fullPath);
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!includedExtensions.has(ext)) return [];
    return [fullPath];
  });
}

function rel(fullPath) {
  return path.relative(repoRoot, fullPath).replaceAll(path.sep, "/");
}

function layerFor(relativePath) {
  if (relativePath.endsWith("pom.xml")) return "Maven";
  if (relativePath.startsWith("common/src/main/java")) {
    if (relativePath.includes("/dto/")) return "Common DTO";
    if (relativePath.includes("/model/")) return "Common Model";
    if (relativePath.includes("/protocol/")) return "Protocol";
    if (relativePath.includes("/enums/")) return "Enum";
    return "Common";
  }
  if (relativePath.startsWith("server/src/main/java")) {
    if (relativePath.includes("/service/")) return "Server Service";
    if (relativePath.includes("/dao/sqlite/")) return "SQLite DAO";
    if (relativePath.includes("/dao/")) return "DAO Interface";
    if (relativePath.includes("/socket/")) return "Socket/Handler";
    if (relativePath.includes("/concurrency/")) return "Concurrency";
    if (relativePath.includes("/exception/")) return "Exception";
    if (relativePath.includes("/config/")) return "Config";
    if (relativePath.includes("/factory/")) return "Factory";
    return "Server";
  }
  if (relativePath.startsWith("client/src/main/java")) {
    if (relativePath.includes("/controller/")) return "JavaFX Controller";
    if (relativePath.includes("/service/")) return "Client Service";
    if (relativePath.includes("/socket/")) return "Client Socket";
    if (relativePath.includes("/util/")) return "Client Utility";
    return "Client";
  }
  if (relativePath.includes("/src/test/")) return "Test";
  if (relativePath.includes("/resources/fxml/")) return "FXML View";
  if (relativePath.includes("/resources/css/")) return "CSS";
  if (relativePath.includes("/resources/db/")) return "Database Script";
  if (relativePath.includes("/resources/")) return "Resource";
  if (relativePath.startsWith("docs/")) return "Documentation";
  return "Project File";
}

function summaryFor(relativePath, layer, lines) {
  const base = path.basename(relativePath);
  const name = base.replace(/\.(java|fxml|css|xml|properties|sql|md|json|ya?ml)$/i, "");
  const joined = lines.slice(0, 80).join(" ");
  if (layer === "JavaFX Controller") return `Controller JavaFX cho màn ${name.replace("Controller", "")}: nhận event UI, validate input, gọi client service và cập nhật view.`;
  if (layer === "FXML View") return `FXML khai báo layout, fx:id và onAction cho màn ${name.replace("View", "")}.`;
  if (layer === "Client Service") return `Service phía client đóng gói request socket cho các controller, không truy cập database.`;
  if (layer === "Client Socket") return `Lớp socket phía client quản lý kết nối, request/response JSON và event realtime.`;
  if (layer === "Server Service") return `Service server chứa business rule chính, phối hợp DAO, transaction, lock hoặc notification nếu cần.`;
  if (layer === "Socket/Handler") return `Handler/router socket nhận MessageType, kiểm session/role và gọi service tương ứng.`;
  if (layer === "SQLite DAO") return `DAO SQLite map SQL sang model/record và là nơi server đọc/ghi database.`;
  if (layer === "DAO Interface") return `Interface DAO tách service khỏi cài đặt SQLite cụ thể để dễ test và thay thế.`;
  if (layer === "Common DTO") return `DTO dùng làm payload giữa client và server qua Gson JSON.`;
  if (layer === "Common Model") return `Model domain/OOP của hệ thống đấu giá, dùng trong server, common và test.`;
  if (layer === "Protocol") return `Protocol chung định nghĩa Request/Response/MessageType cho socket JSON.`;
  if (layer === "Maven") return `Cấu hình Maven cho module, dependency, plugin build/test/checkstyle.`;
  if (layer === "Test") return `JUnit test kiểm chứng hành vi của ${name}.`;
  if (layer === "Database Script" || joined.includes("CREATE TABLE")) return `Script database/schema/seed cho SQLite server.`;
  if (layer === "Documentation") return `Tài liệu dự án hỗ trợ setup, kiến trúc, testing hoặc vấn đáp.`;
  return `File ${base} thuộc layer ${layer}.`;
}

function lineExplain(code, layer) {
  const trimmed = code.trim();
  if (trimmed.startsWith("package ")) return "Khai báo package, giúp xác định module và namespace của class.";
  if (trimmed.startsWith("import ")) return "Import dependency được file sử dụng; khi vấn đáp có thể hỏi vì sao cần thư viện này.";
  if (/public\s+(class|interface|enum|record)\s+/.test(trimmed)) return "Khai báo type chính của file và trách nhiệm lớp.";
  if (/(@FXML|fx:id|onAction)/.test(trimmed)) return "Liên kết JavaFX/FXML giữa view và controller hoặc handler UI.";
  if (/MessageType\./.test(trimmed)) return "Điểm nối protocol: xác định message client-server đang được gửi hoặc xử lý.";
  if (/Response\.(ok|error)/.test(trimmed)) return "Tạo response trả về client, gồm trạng thái, message và payload.";
  if (/sendRequest|connect|Socket|PrintWriter|BufferedReader/.test(trimmed)) return "Liên quan luồng socket client-server và JSON newline.";
  if (/SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|BEGIN|COMMIT|ROLLBACK/i.test(trimmed)) return "Dòng SQL/transaction tác động trực tiếp lên SQLite.";
  if (/lock\(|unlock\(|ReentrantLock|synchronized|ConcurrentHashMap|ScheduledExecutorService|schedule/i.test(trimmed)) return "Dòng concurrency/scheduler cần giải thích khi bị hỏi race condition.";
  if (/Platform\.runLater|CompletableFuture|thenAccept|exceptionally/.test(trimmed)) return "Dòng async/UI-thread, giải thích cách cập nhật JavaFX an toàn.";
  if (/validate|throw new|Exception|IllegalArgumentException/.test(trimmed)) return "Validation hoặc exception path, quyết định lỗi được báo cho client ra sao.";
  if (layer === "FXML View") return "Dòng layout/control FXML quyết định người dùng nhìn thấy hoặc bấm gì.";
  if (layer === "CSS") return "Dòng style ảnh hưởng giao diện JavaFX.";
  if (layer === "Maven") return "Dòng cấu hình build/dependency/plugin trong Maven.";
  return "Dòng quan trọng để giải thích trách nhiệm file và luồng chạy.";
}

function parseJava(lines) {
  const declarations = [];
  const methods = [];
  const methodRegex =
    /^\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:(?:public|private|protected|static|final|synchronized|abstract)\s+)*(?:<[^>]+>\s*)?[\w<>\[\].?,\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*(?:throws\s+[^{]+)?\{/;
  const typeRegex = /^\s*(?:public\s+)?(?:final\s+|abstract\s+)?(class|interface|enum|record)\s+([A-Za-z_][A-Za-z0-9_]*)/;
  lines.forEach((line, index) => {
    const typeMatch = line.match(typeRegex);
    if (typeMatch) declarations.push({ line: index + 1, kind: typeMatch[1], name: typeMatch[2], code: line.trim() });
    const methodMatch = line.match(methodRegex);
    if (methodMatch && !["if", "for", "while", "switch", "catch", "new"].includes(methodMatch[1])) {
      methods.push({ line: index + 1, name: methodMatch[1], code: line.trim() });
    }
  });
  return { declarations, methods };
}

function importantLineCandidates(lines, layer) {
  const pattern =
    /(class |interface |enum |record |@FXML|fx:id=|onAction=|MessageType\.|Response\.|sendRequest|CREATE TABLE|SELECT |INSERT |UPDATE |DELETE |BEGIN|COMMIT|ROLLBACK|lock\(|unlock\(|ReentrantLock|ConcurrentHashMap|ScheduledExecutorService|schedule|subscribe|broadcast|Platform\.runLater|CompletableFuture|throw new|validate|dependency>|artifactId>|module>)/i;
  const refs = [];
  lines.forEach((line, index) => {
    if (pattern.test(line) && line.trim()) {
      refs.push({
        line: index + 1,
        code: line.trim().slice(0, 220),
        explain: lineExplain(line, layer),
      });
    }
  });
  return refs.slice(0, 14);
}

function extractFxmlActions(file) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const controllerLine = lines.findIndex((line) => line.includes("fx:controller"));
  const controllerMatch = text.match(/fx:controller="([^"]+)"/);
  const actions = [];
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/onAction="#([^"]+)"/g)) {
      actions.push({ action: match[1], line: index + 1, code: line.trim() });
    }
  });
  return {
    controller: controllerMatch?.[1] ?? "",
    controllerLine: controllerLine >= 0 ? controllerLine + 1 : null,
    actions,
  };
}

function normalizeQuestion(q) {
  return {
    ...q,
    answer: q.answer.length > 1000 ? `${q.answer.slice(0, 997)}...` : q.answer,
  };
}

const files = walk(repoRoot)
  .sort((a, b) => rel(a).localeCompare(rel(b)))
  .filter((file) => {
    try {
      return statSync(file).size < 600_000;
    } catch {
      return false;
    }
  });

const codeFiles = files.map((file) => {
  const relativePath = rel(file);
  const ext = path.extname(file).toLowerCase();
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const layer = layerFor(relativePath);
  const parsed = ext === ".java" ? parseJava(lines) : { declarations: [], methods: [] };
  const fxml = ext === ".fxml" ? extractFxmlActions(file) : null;
  return {
    path: relativePath,
    absolutePath: file.replaceAll(path.sep, "\\"),
    layer,
    module: relativePath.split("/")[0],
    extension: ext || "none",
    lineCount: lines.length,
    summary: summaryFor(relativePath, layer, lines),
    declarations: parsed.declarations,
    methods: parsed.methods.slice(0, 24),
    importantLines: importantLineCandidates(lines, layer),
    fxml,
  };
});

const byPath = new Map(codeFiles.map((file) => [file.path, file]));
const controllerByClass = new Map();
codeFiles
  .filter((file) => file.layer === "JavaFX Controller")
  .forEach((file) => {
    const className = path.basename(file.path, ".java");
    controllerByClass.set(`com.auction.client.controller.${className}`, file);
  });

const questions = [];

for (const file of codeFiles) {
  if (questions.length >= 300) break;
  const firstRefs = file.importantLines.slice(0, 4);
  questions.push(
    normalizeQuestion({
      id: `file-${questions.length + 1}`,
      level: file.layer.includes("Service") || file.layer.includes("Socket") ? "Hỏi xoáy" : "Cơ bản",
      topic: file.layer,
      question: `File ${file.path} chịu trách nhiệm gì, nằm ở layer nào và khi demo sẽ liên quan luồng nào?`,
      answer: `${file.summary} Khi trả lời, nói rõ module ${file.module}, số dòng ${file.lineCount}, layer ${file.layer}. Các line cần chỉ: ${firstRefs
        .map((ref) => `line ${ref.line}: ${ref.code} (${ref.explain})`)
        .join("; ") || "file này ít điểm neo tự động, hãy mở toàn file để đọc context."}`,
      filePath: file.path,
      lineRefs: firstRefs,
      followUps: [
        "Nếu sửa file này thì layer nào bị ảnh hưởng?",
        "Có test nào nên chạy sau khi sửa không?",
        "File này có thuộc client, server hay common boundary?",
      ],
    }),
  );
}

for (const file of codeFiles.filter((f) => f.methods.length || f.declarations.length)) {
  const anchors = [...file.declarations, ...file.methods].slice(0, 6);
  for (const anchor of anchors) {
    if (questions.length >= 300) break;
    questions.push(
      normalizeQuestion({
        id: `line-${questions.length + 1}`,
        level: anchor.kind ? "Cơ bản" : "Debug",
        topic: `${file.layer} line ${anchor.line}`,
        question: `Giải thích dòng ${anchor.line} trong ${file.path}: ${anchor.code}`,
        answer: `Dòng này khai báo ${anchor.kind ? `${anchor.kind} ${anchor.name}` : `method ${anchor.name}`} trong layer ${file.layer}. Ý nghĩa: ${lineExplain(anchor.code, file.layer)}. Khi vấn đáp, mở đúng path ${file.path}, chỉ line ${anchor.line}, rồi nối với trách nhiệm file: ${file.summary}`,
        filePath: file.path,
        lineRefs: [{ line: anchor.line, code: anchor.code, explain: lineExplain(anchor.code, file.layer) }],
        followUps: [
          "Input/output của đoạn này là gì?",
          "Ai gọi đoạn này trong luồng chạy?",
          "Nếu đoạn này lỗi thì user/server thấy gì?",
        ],
      }),
    );
  }
  if (questions.length >= 300) break;
}

const flowQuestionSeeds = [
  ["Login", ["LoginController.java", "AuthClientService.java", "AuthRequestHandler.java", "AuthService.java", "SessionManager.java"]],
  ["Register", ["RegisterController.java", "AuthClientService.java", "AuthRequestHandler.java", "AuthService.java", "SQLiteUserDao.java"]],
  ["Auction list", ["AuctionListController.java", "AuctionClientService.java", "AuctionRequestHandler.java", "AuctionService.java", "SQLiteAuctionDao.java"]],
  ["Auction detail", ["AuctionDetailController.java", "AuctionClientService.java", "BidTimeline.java", "ImageUrlUtil.java"]],
  ["Place bid", ["AuctionDetailController.java", "LiveBiddingController.java", "BidRequestHandler.java", "BidService.java", "AuctionLockManager.java", "SQLiteBidDao.java"]],
  ["Auto bidding", ["LiveBiddingController.java", "SetAutoBidRequest.java", "SQLiteAutoBidDao.java", "BidService.java"]],
  ["Anti-sniping", ["BidService.java", "AuctionService.java", "NotificationService.java", "AuctionManagerService.java"]],
  ["Wallet deposit", ["WalletController.java", "WalletClientService.java", "WalletRequestHandler.java", "WalletService.java", "SQLiteUserDao.java"]],
  ["Seller create auction", ["CreateAuctionController.java", "CreateAuctionRequest.java", "AuctionRequestHandler.java", "AuctionService.java", "ItemFactory.java"]],
  ["Admin block user", ["AdminPanelController.java", "AdminClientService.java", "AdminRequestHandler.java", "SQLiteUserDao.java", "NotificationService.java"]],
  ["Scheduler close auction", ["AuctionManagerService.java", "AuctionSettlementTest.java", "WalletService.java", "NotificationService.java"]],
  ["Realtime subscription", ["SocketClient.java", "SubscriptionRequestHandler.java", "NotificationService.java", "ClientHandler.java"]],
];

for (const [flowName, names] of flowQuestionSeeds) {
  if (questions.length >= 300) break;
  const matched = codeFiles.filter((file) => names.some((name) => file.path.endsWith(name)));
  questions.push(
    normalizeQuestion({
      id: `flow-${questions.length + 1}`,
      level: "Demo",
      topic: flowName,
      question: `Trình bày luồng ${flowName} từ UI tới server/database và chỉ line code cần mở.`,
      answer: `Luồng ${flowName} đi qua các file: ${matched
        .map((file) => `${file.path}${file.importantLines[0] ? ` line ${file.importantLines[0].line}` : ""}`)
        .join(" -> ")}. Khi demo, bắt đầu từ controller/FXML, sang client service/socket, tới handler/router server, service business rule, DAO/database, rồi quay lại response hoặc event realtime.`,
      filePath: matched[0]?.path ?? "",
      lineRefs: matched.flatMap((file) => file.importantLines.slice(0, 1)).slice(0, 6),
      followUps: [
        "Client có truy cập DB trực tiếp không?",
        "Response/event nào quay về UI?",
        "Test nào chứng minh luồng này chạy đúng?",
      ],
    }),
  );
}

while (questions.length < 300) {
  const file = codeFiles[questions.length % codeFiles.length];
  const ref = file.importantLines[questions.length % Math.max(file.importantLines.length, 1)] ?? {
    line: 1,
    code: path.basename(file.path),
    explain: file.summary,
  };
  questions.push(
    normalizeQuestion({
      id: `coverage-${questions.length + 1}`,
      level: "Cơ bản",
      topic: `Coverage ${file.layer}`,
      question: `Nếu giảng viên mở ${file.path} và hỏi line ${ref.line}, em giải thích thế nào?`,
      answer: `Line ${ref.line}: ${ref.code}. Ý nghĩa: ${ref.explain}. File này thuộc ${file.layer}; trách nhiệm chính là: ${file.summary}. Cách trả lời tốt là nói input, output, ai gọi nó, và lỗi sẽ lan ra UI/server ra sao.`,
      filePath: file.path,
      lineRefs: [ref],
      followUps: [
        "Line này liên hệ gì với yêu cầu đề bài?",
        "Có thể viết test nào cho hành vi này?",
        "Nếu đổi dòng này thì rủi ro regression là gì?",
      ],
    }),
  );
}

const manualCases = [];
const fxmlFiles = codeFiles.filter((file) => file.layer === "FXML View" && file.fxml);

for (const file of fxmlFiles) {
  const controller = controllerByClass.get(file.fxml.controller);
  for (const action of file.fxml.actions) {
    const controllerMethod = controller?.methods.find((method) => method.name === action.action);
    manualCases.push({
      id: `ui-${manualCases.length + 1}`,
      title: `${path.basename(file.path, ".fxml")} - ${action.action}`,
      screen: file.path,
      role: inferRoleFromName(file.path + action.action),
      steps: [
        `Mở màn ${path.basename(file.path, ".fxml")}.`,
        `Thực hiện control có onAction ${action.action}.`,
        "Quan sát message, table, form hoặc navigation sau thao tác.",
      ],
      expected: "UI không crash; controller validate input, gọi service/client socket hoặc đổi scene đúng.",
      executionPath: [
        { path: file.path, line: action.line, code: action.code, explain: "FXML gắn button/control với method controller." },
        controllerMethod
          ? {
              path: controller.path,
              line: controllerMethod.line,
              code: controllerMethod.code,
              explain: "Controller method chạy khi user thao tác trên giao diện.",
            }
          : null,
      ].filter(Boolean),
    });
  }
}

const curatedManual = [
  ["Login thành công", "Bidder/Seller/Admin", ["Nhập username/password", "Bấm Login", "Kiểm sidebar và topbar role/balance"], ["LoginView.fxml", "LoginController.java", "AuthClientService.java", "SocketClient.java", "AuthRequestHandler.java", "AuthService.java"]],
  ["Register bidder/seller", "Guest", ["Chọn role", "Nhập full name, username, password", "Bấm Create Account"], ["RegisterView.fxml", "RegisterController.java", "RegisterRequest.java", "AuthRequestHandler.java", "SQLiteUserDao.java"]],
  ["Refresh auction list", "Bidder", ["Mở Auction List", "Bấm Refresh hoặc reload màn", "Kiểm card auction"], ["AuctionListView.fxml", "AuctionListController.java", "AuctionClientService.java", "AuctionRequestHandler.java", "AuctionService.java"]],
  ["Mở detail auction", "Bidder", ["Chọn auction trong list", "Mở detail", "Kiểm giá hiện tại, seller, end time, bid history"], ["AuctionDetailView.fxml", "AuctionDetailController.java", "AuctionDetailDto.java", "BidTimeline.java"]],
  ["Place bid hợp lệ", "Bidder", ["Mở auction ACTIVE", "Nhập giá cao hơn current price", "Bấm Place Bid"], ["AuctionDetailController.java", "PlaceBidRequest.java", "BidRequestHandler.java", "BidService.java", "SQLiteBidDao.java", "NotificationService.java"]],
  ["Place bid lỗi thiếu tiền", "Bidder", ["Đặt bid cao hơn available balance", "Bấm Place Bid", "Đọc lỗi"], ["WalletService.java", "BidService.java", "InsufficientFundsException.java", "Response.java"]],
  ["Auto-bid dưới max", "Bidder", ["Cấu hình maxBid", "Bidder khác bid thấp hơn max", "Quan sát hệ thống tự phản hồi"], ["LiveBiddingController.java", "SetAutoBidRequest.java", "BidService.java", "SQLiteAutoBidDao.java"]],
  ["Anti-sniping kéo dài giờ", "Bidder", ["Tạo auction gần hết giờ", "Bid trong cửa sổ cuối", "Quan sát countdown tăng"], ["BidService.java", "AuctionService.java", "BidUpdateEvent.java", "NotificationService.java"]],
  ["Wallet quick deposit", "Bidder", ["Mở Wallet", "Bấm 50/100/500 USD", "Kiểm balance/available"], ["WalletView.fxml", "WalletController.java", "WalletClientService.java", "WalletRequestHandler.java", "WalletService.java"]],
  ["Withdraw vượt available", "Bidder", ["Nhập amount lớn hơn available", "Bấm Withdraw", "Đọc message lỗi"], ["WalletController.java", "WalletService.java", "InsufficientFundsException.java"]],
  ["Seller tạo auction", "Seller", ["Mở Seller Center", "Bấm Create Auction", "Nhập item + time + price + image", "Submit"], ["SellerCenterView.fxml", "CreateAuctionView.fxml", "CreateAuctionController.java", "AuctionService.java", "ItemFactory.java"]],
  ["Seller xem stats", "Seller", ["Mở Seller Center", "Bấm Refresh", "So sánh Expected/Total revenue"], ["SellerCenterController.java", "SellerStatsDto.java", "AuctionService.java", "SQLiteAuctionDao.java"]],
  ["Admin refresh dashboard", "Admin", ["Mở Admin Panel", "Bấm Refresh", "Kiểm user/auction stats"], ["AdminPanelView.fxml", "AdminPanelController.java", "AdminClientService.java", "AdminRequestHandler.java"]],
  ["Admin disable user", "Admin", ["Chọn user", "Bấm Disable", "Kiểm status đổi"], ["AdminPanelController.java", "UpdateUserStatusRequest.java", "AdminRequestHandler.java", "SQLiteUserDao.java"]],
  ["Admin cancel auction", "Admin", ["Chọn auction đang chạy", "Bấm Cancel", "Kiểm event/status"], ["AdminPanelController.java", "AdminRequestHandler.java", "AuctionService.java", "NotificationService.java"]],
  ["Mất kết nối socket", "Client", ["Tắt server khi client đang mở", "Quan sát disconnected banner", "Logout/login lại"], ["AppShell.fxml", "AppShellController.java", "SocketClient.java", "ConnectionState.java"]],
];

for (const [title, role, steps, names] of curatedManual) {
  const matched = codeFiles.filter((file) => names.some((name) => file.path.endsWith(name)));
  manualCases.push({
    id: `manual-${manualCases.length + 1}`,
    title,
    screen: matched[0]?.path ?? "",
    role,
    steps,
    expected: `Khi ${title}, UI phải phản hồi rõ, server trả Response đúng và dữ liệu/event khớp với rule nghiệp vụ.`,
    executionPath: matched
      .map((file) => {
        const ref = file.importantLines[0] ?? file.methods[0] ?? file.declarations[0];
        return ref ? { path: file.path, line: ref.line, code: ref.code, explain: ref.explain ?? lineExplain(ref.code, file.layer) } : null;
      })
      .filter(Boolean),
  });
}

function inferRoleFromName(text) {
  const lower = text.toLowerCase();
  if (lower.includes("admin")) return "Admin";
  if (lower.includes("seller") || lower.includes("auction") || lower.includes("create")) return "Seller/Bidder";
  if (lower.includes("wallet") || lower.includes("bid")) return "Bidder";
  if (lower.includes("login") || lower.includes("register")) return "Guest";
  return "All roles";
}

const payload = `/* Auto-generated by scripts/generate-learning-data.mjs from ${repoRoot}. */
export type GeneratedLineRef = { line: number; code: string; explain: string };
export type GeneratedCodeFile = {
  path: string;
  absolutePath: string;
  layer: string;
  module: string;
  extension: string;
  lineCount: number;
  summary: string;
  declarations: { line: number; kind: string; name: string; code: string }[];
  methods: { line: number; name: string; code: string }[];
  importantLines: GeneratedLineRef[];
  fxml: null | { controller: string; controllerLine: number | null; actions: { action: string; line: number; code: string }[] };
};
export type GeneratedQuestion = {
  id: string;
  level: string;
  topic: string;
  question: string;
  answer: string;
  filePath: string;
  lineRefs: GeneratedLineRef[];
  followUps: string[];
};
export type GeneratedManualCase = {
  id: string;
  title: string;
  screen: string;
  role: string;
  steps: string[];
  expected: string;
  executionPath: GeneratedLineRef[] & { path?: string }[];
};

export const generatedAt = ${JSON.stringify(new Date().toISOString())};
export const projectCodeFiles: GeneratedCodeFile[] = ${JSON.stringify(codeFiles, null, 2)};
export const generatedQuestions: GeneratedQuestion[] = ${JSON.stringify(questions.slice(0, 300), null, 2)};
export const generatedManualCases: GeneratedManualCase[] = ${JSON.stringify(manualCases, null, 2)};
`;

if (!existsSync(path.dirname(outFile))) mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, payload, "utf8");

console.log(
  JSON.stringify(
    {
      outFile,
      files: codeFiles.length,
      questions: Math.min(questions.length, 300),
      manualCases: manualCases.length,
    },
    null,
    2,
  ),
);
