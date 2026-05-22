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

function walkAll(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) return [];
      return walkAll(fullPath);
    }
    return [fullPath];
  });
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
  if (/(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|BEGIN|COMMIT|ROLLBACK)/.test(trimmed) && !/^run:/.test(trimmed)) return "Dòng SQL/transaction tác động trực tiếp lên SQLite.";
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
    /(class |interface |enum |record |@FXML|fx:id=|onAction=|MessageType\.|Response\.|sendRequest|CREATE TABLE|SELECT |INSERT |UPDATE |DELETE |BEGIN|COMMIT|ROLLBACK|lock\(|unlock\(|ReentrantLock|ConcurrentHashMap|ScheduledExecutorService|schedule|subscribe|broadcast|Platform\.runLater|CompletableFuture|throw new|validate|dependency>|artifactId>|module>)/;
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
  const vi = (value) => (typeof value === "string" ? viText(value) : value);
  const answerBullets = q.answerBullets?.length
    ? q.answerBullets.map(vi)
    : [vi(q.answer)].filter(Boolean);
  const mustMention = q.mustMention?.length
    ? q.mustMention
    : [q.filePath, q.topic].filter(Boolean).slice(0, 4);
  const commonMistakes = q.commonMistakes?.length
    ? q.commonMistakes.map(vi)
    : [
        "Chỉ đọc tên file/dòng code mà không nói được luồng chạy.",
        "Bỏ qua server là nguồn sự thật cho validation và phân quyền.",
      ];
  const rawTags = q.tags?.length
    ? q.tags
    : [q.level, q.topic].filter(Boolean);
  const tags = Array.from(new Set(rawTags));
  return {
    ...q,
    level: vi(q.level),
    topic: vi(q.topic),
    question: vi(q.question),
    intent: vi(q.intent ?? "Kiểm tra khả năng nối code với luồng chạy, business rule và rủi ro khi demo."),
    answer: vi(q.answer).length > 1000 ? `${vi(q.answer).slice(0, 997)}...` : vi(q.answer),
    answerBullets,
    mustMention,
    commonMistakes,
    followUps: q.followUps.map(vi),
    tags,
  };
}

function viText(text) {
  const replacements = [
    ["Kiem tra", "Kiểm tra"],
    ["kha nang", "khả năng"],
    ["noi code", "nối code"],
    ["voi luong", "với luồng"],
    ["rui ro", "rủi ro"],
    ["Neu thay yeu cau", "Nếu thấy yêu cầu"],
    ["em hay di tu", "em hãy đi từ"],
    ["man hinh", "màn hình"],
    ["dong thoi", "đồng thời"],
    ["chi ro", "chỉ rõ"],
    ["file nao can mo", "file nào cần mở"],
    [" den ", " đến "],
    [" va ", " và "],
    ["voi ", "với "],
    ["tra loi", "trả lời"],
    ["thuc hien", "thực hiện"],
    ["luồng nay", "luồng này"],
    ["flow nay", "flow này"],
    ["nay", "này"],
    ["Trong luong", "Trong luồng"],
    ["dau la boundary", "đâu là boundary"],
    ["Neu luong", "Nếu luồng"],
    ["bi loi giua chung", "bị lỗi giữa chừng"],
    ["theo thu tu nao", "theo thứ tự nào"],
    ["Tai sao", "Tại sao"],
    ["khong de", "không để"],
    ["thao tac truc tiep", "thao tác trực tiếp"],
    ["Hay giai thich", "Hãy giải thích"],
    ["Luong", "Luồng"],
    ["Thu tu", "Thứ tự"],
    ["nen mo", "nên mở"],
    ["Cach tra loi tot", "Cách trả lời tốt"],
    ["bat dau", "bắt đầu"],
    ["thao tac", "thao tác"],
    ["toi request", "tới request"],
    ["xu ly nghiep vu", "xử lý nghiệp vụ"],
    ["neu co", "nếu có"],
    ["quay ve", "quay về"],
    ["Quay ve", "Quay về"],
    ["Noi thao tac", "Nói thao tác"],
    ["Noi ", "Nói "],
    ["nguoi dung", "người dùng"],
    ["Nguoi dung", "Người dùng"],
    ["tren UI", "trên UI"],
    [" di qua", " đi qua"],
    ["Dang nhap", "Đăng nhập"],
    ["dang nhap", "đăng nhập"],
    ["Dang ky", "Đăng ký"],
    ["dang ky", "đăng ký"],
    ["tao token", "tạo token"],
    ["tao ", "tạo "],
    ["luu session", "lưu session"],
    ["de goi", "để gọi"],
    ["tiep theo", "tiếp theo"],
    ["chan tao", "chặn tạo"],
    ["tu public UI", "từ public UI"],
    ["danh sach", "danh sách"],
    ["danh dau", "đánh dấu"],
    ["phien dau gia", "phiên đấu giá"],
    ["dau gia", "đấu giá"],
    ["doc DB truc tiep", "đọc DB trực tiếp"],
    ["truc tiep", "trực tiếp"],
    ["Man detail", "Màn detail"],
    ["ghep thong tin", "ghép thông tin"],
    ["thoi gian", "thời gian"],
    [" và anh", " và ảnh"],
    ["gan cuoi phien", "gần cuối phiên"],
    ["keo dai", "kéo dài"],
    ["thong bao", "thông báo"],
    ["dang xem", "đang xem"],
    ["Nap/rut/giu tien", "Nạp/rút/giữ tiền"],
    ["phai di qua", "phải đi qua"],
    ["phai bao quanh", "phải bao quanh"],
    ["dung owner", "đúng owner"],
    ["dung loai", "đúng loại"],
    ["dung cách", "đúng cách"],
    ["dung cach", "đúng cách"],
    ["không dung", "không dùng"],
    ["Neu không dung", "Nếu không dùng"],
    ["ghi de nhau", "ghi đè nhau"],
    ["lam viec", "làm việc"],
    ["mo rong", "mở rộng"],
    ["o diem", "ở điểm"],
    ["lang nghe", "lắng nghe"],
    ["giu tien", "giữ tiền"],
    ["tang gia", "tăng giá"],
    [" đặt gia", " đặt giá"],
    [" gia,", " giá,"],
    [" gia.", " giá."],
    ["Cách trả lời tot", "Cách trả lời tốt"],
    ["Cau trả lời tot", "Câu trả lời tốt"],
    [" tot la", " tốt là"],
    ["bắt đầu tu", "bắt đầu từ"],
    [" roi ", " rồi "],
    [" hoac ", " hoặc "],
    [" co ", " có "],
    [" nao ", " nào "],
    ["ten file", "tên file"],
    ["thu tu", "thứ tự"],
    ["co che nao", "cơ chế nào"],
    ["có che nao", "cơ chế nào"],
    ["bang có che", "bằng cơ chế"],
    ["bang test/file", "bằng test/file"],
    ["trace tu", "trace từ"],
    ["Nguyen ly", "Nguyên lý"],
    ["nguyen ly", "nguyên lý"],
    ["dat ", "đặt "],
    ["tu dong", "tự động"],
    ["gioi han", "giới hạn"],
    ["dau tien", "đầu tiên"],
    ["Chi ra", "Chỉ ra"],
    ["Noi service", "Nói service"],
    ["that su", "thật sự"],
    ["Noi DAO", "Nói DAO"],
    ["Chi ke", "Chỉ kể"],
    ["nhung khong noi", "nhưng không nói"],
    ["Nhan lam", "Nhầm lẫn"],
    ["voi server", "với server"],
    ["Quen noi", "Quên nói"],
    ["Neu server", "Nếu server"],
    ["hien thi o dau", "hiển thị ở đâu"],
    ["Role nao duoc phep", "Role nào được phép"],
    ["Test nao gan nhat", "Test nào gần nhất"],
    ["chung minh", "chứng minh"],
    ["Tai sao thiet ke", "Tại sao thiết kế"],
    ["phu hop", "phù hợp"],
    ["bai dau gia", "bài đấu giá"],
    ["cua nhom", "của nhóm"],
    ["Neu bo", "Nếu bỏ"],
    ["se kho test", "sẽ khó test"],
    ["de loi", "dễ lỗi"],
    ["Hay chi file", "Hãy chỉ file"],
    ["the hien", "thể hiện"],
    ["trach nhiem", "trách nhiệm"],
    ["tung layer", "từng layer"],
    ["thanh vien", "thành viên"],
    ["chia viec", "chia việc"],
    ["bao ve van dap", "bảo vệ vấn đáp"],
    ["Khi co bug", "Khi có bug"],
    ["khoanh vung loi", "khoanh vùng lỗi"],
    ["den DB", "đến DB"],
    ["Trong repo, mo", "Trong repo, mở"],
    ["nguyen ly", "nguyên lý"],
    ["truoc", "trước"],
    ["sau do", "sau đó"],
    ["ap dung", "áp dụng"],
    ["cuoi cung", "cuối cùng"],
    ["duoc phong tranh", "được phòng tránh"],
    ["quan ly", "quản lý"],
    ["tach dependency", "tách dependency"],
    ["dung pham vi", "đúng phạm vi"],
    ["pham vi", "phạm vi"],
    ["thay vi", "thay vì"],
    ["hieu kien truc", "hiểu kiến trúc"],
    ["hoc thuoc", "học thuộc"],
    ["Dinh nghia", "Định nghĩa"],
    ["bang mot cau ngan", "bằng một câu ngắn"],
    ["Gan nguyen ly", "Gắn nguyên lý"],
    ["file that", "file thật"],
    ["Noi loi", "Nói lỗi"],
    ["co the", "có thể"],
    ["Tra loi", "Trả lời"],
    ["ly thuyet", "lý thuyết"],
    ["chung chung", "chung chung"],
    ["khong chi duoc", "không chỉ được"],
    ["Gom controller", "Gộp controller"],
    ["thanh mot vai tro", "thành một vai trò"],
    ["Khong noi", "Không nói"],
    ["thiet ke bi pha", "thiết kế bị phá"],
    ["Trong repo co file nao", "Trong repo có file nào"],
    ["vi pham nhe", "vi phạm nhẹ"],
    ["Neu them tinh nang moi", "Nếu thêm tính năng mới"],
    ["sua layer nao", "sửa layer nào"],
    ["lien quan", "liên quan"],
    ["Project dung", "Project dùng"],
    ["o dau", "ở đâu"],
    ["giai quyet", "giải quyết"],
    ["van de thiet ke", "vấn đề thiết kế"],
    ["code se bi lap", "code sẽ bị lặp"],
    ["dinh nghia sach giao khoa", "định nghĩa sách giáo khoa"],
    ["Khi van dap", "Khi vấn đáp"],
    ["se demo", "sẽ demo"],
    ["File nen mo", "File nên mở"],
    ["Cau tra loi tot", "Câu trả lời tốt"],
    ["lam giam", "làm giảm"],
    ["tang", "tăng"],
    ["kha nang mo rong", "khả năng mở rộng"],
    ["Noi ten", "Nói tên"],
    ["Chi file", "Chỉ file"],
    ["line neo", "line neo"],
    ["rui ro", "rủi ro"],
    ["dung sai", "dùng sai"],
    ["Noi pattern", "Nói pattern"],
    ["nhan dien", "nhận diện"],
    ["Nhan nham", "Nhầm"],
    ["voi DTO", "với DTO"],
    ["co lam", "có làm"],
    ["phuc tap", "phức tạp"],
    ["Co the thay", "Có thể thay"],
    ["don gian", "đơn giản"],
    ["giup sua it file nao", "giúp sửa ít file nào"],
    ["xay ra", "xảy ra"],
    ["em trace tu dau", "em trace từ đâu"],
    ["mong doi", "mong đợi"],
    ["thay doi", "thay đổi"],
    ["la loi nguy hiem", "là lỗi nguy hiểm"],
    ["he thong", "hệ thống"],
    ["hien tai", "hiện tại"],
    ["phong tranh", "phòng tránh"],
    ["co che", "cơ chế"],
    ["Neu test", "Nếu test"],
    ["doc file", "đọc file"],
    ["dua ra", "đưa ra"],
    ["mot cach tai hien", "một cách tái hiện"],
    ["tai hien", "tái hiện"],
    ["bang thao tac", "bằng thao tác"],
    ["Trace nen mo", "Trace nên mở"],
    ["trieu chung", "triệu chứng"],
    ["UI/server", "UI/server"],
    ["lam gi", "làm gì"],
    ["phai giu", "phải giữ"],
    ["bao ve", "bảo vệ"],
    ["nang luc debug", "năng lực debug"],
    ["thuan tuy", "thuần túy"],
    ["Mo ta symptom", "Mô tả symptom"],
    ["nghi ngo", "nghi ngờ"],
    ["Do loi", "Đổ lỗi"],
    ["nam o", "nằm ở"],
    ["Bo qua", "Bỏ qua"],
    ["da co san", "đã có sẵn"],
    ["Sau khi fix", "Sau khi fix"],
    ["can verify", "cần verify"],
    ["Thong bao", "Thông báo"],
    ["hien o client", "hiện ở client"],
    ["giang vien hoi", "giảng viên hỏi"],
    ["chung minh dieu gi", "chứng minh điều gì"],
    ["se giai thich", "sẽ giải thích"],
    ["du lieu dau vao", "dữ liệu đầu vào"],
    ["hanh dong", "hành động"],
    ["cuoi cung", "cuối cùng"],
    ["doc test", "đọc test"],
    ["chay lenh test", "chạy lệnh test"],
    ["setup du lieu", "setup dữ liệu"],
    ["goi class", "gọi class"],
    ["tinh nang", "tính năng"],
    ["co nguy co hong", "có nguy cơ hỏng"],
    ["Chi noi", "Chỉ nói"],
    ["Khong phan biet", "Không phân biệt"],
    ["Quen noi", "Quên nói"],
    ["Lenh Maven", "Lệnh Maven"],
    ["co dung", "có dùng"],
    ["Voi", "Với"],
    ["quyen", "quyền"],
    ["bao mat", "bảo mật"],
    ["mat diem", "mất điểm"],
    ["Cach", "Cách"],
    ["cach", "cách"],
    ["Hay ", "Hãy "],
    ["giai thich", "giải thích"],
    ["dinh nghia", "định nghĩa"],
    ["dieu gi", "điều gì"],
    ["nhu the nao", "như thế nào"],
    ["Mo ", "Mở "],
    ["rieng", "riêng"],
    ["that", "thật"],
    ["phia", "phía"],
    ["phai dam bao", "phải đảm bảo"],
    ["khong mat diem", "không mất điểm"],
    ["phan role", "phần role"],
    ["Can mo", "Cần mở"],
    ["co the an/hien", "có thể ẩn/hiện"],
    ["nhung server moi", "nhưng server mới"],
    ["kiem token", "kiểm token"],
    ["moi quyet dinh", "mới quyết định"],
    ["phan biet", "phân biệt"],
    ["duoc lam gi", "được làm gì"],
    ["bi cam", "bị cấm"],
    ["o dau", "ở đâu"],
    ["Cho rang", "Cho rằng"],
    ["du bao mat", "đủ bảo mật"],
    ["Neu bidder", "Nếu bidder"],
    ["xu ly sao", "xử lý sao"],
    ["can hien", "cần hiện"],
    ["cau hoi", "câu hỏi"],
    ["doc code", "đọc code"],
    ["ngu canh", "ngữ cảnh"],
    ["dich tung dong", "dịch từng dòng"],
    ["Doc dung", "Đọc đúng"],
    ["lien he", "liên hệ"],
    ["yeu cau de bai", "yêu cầu đề bài"],
    ["doi line", "đổi line"],
    ["can chay", "cần chạy"],
    ["hien ra", "hiện ra"],
    ["Y nghia", "Ý nghĩa"],
    ["File nay thuoc", "File này thuộc"],
    ["chinh", "chính"],
    ["ai goi no", "ai gọi nó"],
    ["loi se lan", "lỗi sẽ lan"],
    ["doc lai cu phap", "đọc lại cú pháp"],
    ["Lien quan", "Liên quan"],
    ["Hoi xoay", "Hỏi xoáy"],
    ["Kien truc", "Kiến trúc"],
    ["duoc", "được"],
    ["khong", "không"],
    ["luong", "luồng"],
    ["noi", "nói"],
  ];
  const wordMap = new Map([
    ["tu", "từ"],
    ["nao", "nào"],
    ["neu", "nếu"],
    ["moi", "mới"],
    ["chan", "chặn"],
    ["phai", "phải"],
    ["dung", "dùng"],
    ["loai", "loại"],
    ["chi", "chỉ"],
    ["sua", "sửa"],
    ["huy", "hủy"],
    ["trang", "trạng"],
    ["thai", "thái"],
    ["phep", "phép"],
    ["cap", "cập"],
    ["nhat", "nhật"],
    ["phat", "phát"],
    ["can", "cần"],
    ["dong", "đóng"],
    ["han", "hạn"],
    ["tien", "tiền"],
    ["loi", "lỗi"],
    ["tam", "tạm"],
    ["thoi", "thời"],
    ["luu", "lưu"],
    ["an", "ẩn"],
    ["nut", "nút"],
    ["cac", "các"],
    ["nhan", "nhận"],
    ["xu", "xử"],
    ["ly", "lý"],
    ["giup", "giúp"],
    ["lap", "lập"],
    ["mot", "một"],
    ["trach", "trách"],
    ["nhiem", "nhiệm"],
    ["giai", "giải"],
    ["thich", "thích"],
    ["nang", "năng"],
    ["luc", "lực"],
    ["ngu", "ngữ"],
    ["vao", "vào"],
    ["cuoi", "cuối"],
    ["cung", "cùng"],
    ["lenh", "lệnh"],
    ["that", "thật"],
    ["quyen", "quyền"],
    ["bang", "bằng"],
    ["it", "ít"],
    ["anh", "ảnh"],
    ["huong", "hưởng"],
    ["phu", "phụ"],
    ["thuoc", "thuộc"],
    ["nhom", "nhóm"],
    ["gia", "giá"],
    ["dau", "đấu"],
    ["doc", "đọc"],
    ["khong", "không"],
    ["the", "thể"],
    ["lam", "làm"],
    ["rong", "rộng"],
    ["diem", "điểm"],
    ["mo", "mở"],
    ["de", "để"],
    ["sai", "sai"],
  ]);
  const withPhrases = replacements.reduce((acc, [from, to]) => acc.replaceAll(from, to), text);
  return withPhrases.replace(/\b[A-Za-z]+\b/g, (word) => {
    const replacement = wordMap.get(word.toLowerCase());
    if (!replacement) return word;
    return word[0] === word[0].toUpperCase()
      ? `${replacement[0].toUpperCase()}${replacement.slice(1)}`
      : replacement;
  });
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

function filePriority(relativePath) {
  if (relativePath.includes("BidService.java")) return 0;
  if (relativePath.includes("RequestRouter.java") || relativePath.includes("ClientHandler.java")) return 1;
  if (relativePath.includes("AuctionManagerService.java") || relativePath.includes("AuctionService.java")) return 2;
  if (relativePath.includes("AuthService.java") || relativePath.includes("WalletService.java")) return 3;
  if (relativePath.includes("/controller/") || relativePath.includes("/socket/")) return 4;
  if (relativePath.includes("/service/")) return 5;
  if (relativePath.includes("/dao/")) return 6;
  if (relativePath.includes("/protocol/") || relativePath.includes("/dto/") || relativePath.includes("/model/")) return 7;
  if (relativePath.includes("/src/test/")) return 8;
  if (relativePath.includes("/resources/fxml/")) return 9;
  if (relativePath.includes("/resources/")) return 10;
  if (relativePath.endsWith("pom.xml") || relativePath.startsWith(".github/")) return 11;
  if (relativePath.startsWith("docs/")) return 12;
  return 20;
}

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
}).sort((a, b) => filePriority(a.path) - filePriority(b.path) || a.path.localeCompare(b.path));

const allRepoPaths = walkAll(repoRoot).sort((a, b) => rel(a).localeCompare(rel(b)));
const codeMapPathSet = new Set(codeFiles.map((file) => file.path));
const assetDocumentExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".docx", ".xlsx"]);
const textInventory = allRepoPaths
  .map((file) => rel(file))
  .filter((file) => includedExtensions.has(path.extname(file).toLowerCase()));
const assetDocumentInventory = allRepoPaths
  .map((file) => rel(file))
  .filter((file) => assetDocumentExtensions.has(path.extname(file).toLowerCase()));
const intentionallyNotCodeMapped = allRepoPaths
  .map((file) => rel(file))
  .filter((file) => !includedExtensions.has(path.extname(file).toLowerCase()));
const missingTextFiles = textInventory.filter((file) => !codeMapPathSet.has(file));
const projectAudit = {
  repoRoot,
  totalFilesScanned: allRepoPaths.length,
  codeMapFiles: codeFiles.length,
  textFilesInInventory: textInventory.length,
  assetDocumentFiles: assetDocumentInventory,
  intentionallyNotCodeMapped,
  missingTextFiles,
  excludedDirectories: Array.from(excludedDirs).sort(),
  includedExtensions: Array.from(includedExtensions).sort(),
  note: "Code map chỉ render source/text line-by-line. PDF/PNG/DOCX/binary được đưa vào inventory để chứng minh đã rà project gốc nhưng không render như code.",
};

const byPath = new Map(codeFiles.map((file) => [file.path, file]));
const controllerByClass = new Map();
codeFiles
  .filter((file) => file.layer === "JavaFX Controller")
  .forEach((file) => {
    const className = path.basename(file.path, ".java");
    controllerByClass.set(`com.auction.client.controller.${className}`, file);
  });

const questions = [];

const flowQuestionSeeds = [
  ["Login", ["LoginController.java", "AuthClientService.java", "AuthRequestHandler.java", "AuthService.java", "SessionManager.java"], "Bidder/Seller/Admin dang nhap, server tao token va client luu session de goi request tiep theo."],
  ["Register", ["RegisterController.java", "AuthClientService.java", "AuthRequestHandler.java", "AuthService.java", "SQLiteUserDao.java"], "Dang ky user moi, hash password va chan tao ADMIN tu public UI."],
  ["Auction list", ["AuctionListController.java", "AuctionClientService.java", "AuctionRequestHandler.java", "AuctionService.java", "SQLiteAuctionDao.java"], "Bidder/Seller xem danh sach phien dau gia, client khong doc DB truc tiep."],
  ["Auction detail", ["AuctionDetailController.java", "AuctionClientService.java", "BidTimeline.java", "ImageUrlUtil.java", "AuctionService.java"], "Man detail ghep thong tin item, gia, thoi gian, bid history va anh."],
  ["Place bid", ["AuctionDetailController.java", "LiveBiddingController.java", "BidRequestHandler.java", "BidService.java", "AuctionLockManager.java", "SQLiteBidDao.java"], "Bidder dat gia, server validate rule, lock auction, transaction va broadcast realtime."],
  ["Auto bidding", ["LiveBiddingController.java", "SetAutoBidRequest.java", "SQLiteAutoBidDao.java", "BidService.java", "AutoBidRule.java"], "Nguoi dung dat max bid/increment, server tu dong tang gia trong gioi han."],
  ["Anti-sniping", ["BidService.java", "AuctionService.java", "NotificationService.java", "AuctionManagerService.java"], "Bid gan cuoi phien keo dai endTime va thong bao cho client dang xem."],
  ["Wallet deposit", ["WalletController.java", "WalletClientService.java", "WalletRequestHandler.java", "WalletService.java", "SQLiteUserDao.java"], "Nap/rut/giu tien phai di qua server service va DAO user."],
  ["Seller create auction", ["CreateAuctionController.java", "CreateAuctionRequest.java", "AuctionRequestHandler.java", "AuctionService.java", "ItemFactory.java"], "Seller tao item va auction, server dung Factory de tao model dung loai."],
  ["Seller update/cancel", ["EditAuctionController.java", "AuctionRequestHandler.java", "AuctionService.java", "NotificationService.java"], "Seller chi duoc sua/huy khi dung owner va trang thai cho phep."],
  ["Admin block user", ["AdminPanelController.java", "AdminClientService.java", "AdminRequestHandler.java", "SQLiteUserDao.java", "NotificationService.java"], "Admin cap nhat active status va server phat thong bao neu can."],
  ["Scheduler close auction", ["AuctionManagerService.java", "AuctionSettlementTest.java", "WalletService.java", "NotificationService.java"], "Scheduler dong auction den han, settlement tien va retry neu loi tam thoi."],
  ["Realtime subscription", ["SocketClient.java", "SubscriptionRequestHandler.java", "NotificationService.java", "ClientHandler.java"], "Client subscribe auction, server push event BID_UPDATE/AUCTION_CLOSED/TIME_EXTENDED."],
];

function matchFiles(names) {
  return codeFiles.filter((file) => names.some((name) => file.path.endsWith(name) || file.path.includes(name)));
}

function refsFromFiles(files, max = 6) {
  return files
    .flatMap((file) => {
      const refs = file.importantLines.length
        ? file.importantLines
        : [
            ...file.declarations.map((item) => ({ line: item.line, code: item.code, explain: lineExplain(item.code, file.layer) })),
            ...file.methods.map((item) => ({ line: item.line, code: item.code, explain: lineExplain(item.code, file.layer) })),
          ];
      return refs.slice(0, 1);
    })
    .slice(0, max);
}

function primaryPath(files) {
  return files[0]?.path ?? "";
}

function fileList(files) {
  return files.map((file) => file.path).join(" -> ");
}

function addQuestion(category, q) {
  questions.push(
    normalizeQuestion({
      id: `${category}-${questions.length + 1}`,
      ...q,
      tags: [category, ...(q.tags ?? [])],
    }),
  );
}

const flowPrompts = [
  (name) => `Neu thay yeu cau demo ${name}, em hay di tu man hinh client den server va database, dong thoi chi ro file nao can mo.`,
  (name) => `Trong luong ${name}, dau la boundary giua UI, protocol, business rule va persistence?`,
  (name) => `Neu luong ${name} bi loi giua chung, em trace tu client sang server theo thu tu nao?`,
  (name) => `Tai sao luong ${name} khong de client thao tac truc tiep database?`,
  (name) => `Hay giai thich request/response hoac realtime event quay ve client trong luong ${name}.`,
];

for (let i = 0; i < 60; i += 1) {
  const [flowName, names, purpose] = flowQuestionSeeds[i % flowQuestionSeeds.length];
  const matched = matchFiles(names);
  const prompt = flowPrompts[Math.floor(i / flowQuestionSeeds.length) % flowPrompts.length](flowName);
  addQuestion("Flow", {
    level: i % 3 === 0 ? "Demo" : "Hoi xoay",
    topic: flowName,
    question: prompt,
    answer: `Luong ${flowName}: ${purpose} Thu tu file nen mo: ${fileList(matched)}. Cach tra loi tot la bat dau tu thao tac UI, qua client service/socket, toi request handler/router, service xu ly nghiep vu, DAO/DB neu co, roi quay ve response hoac realtime event.`,
    intent: "Kiem tra kha nang demo luong end-to-end va noi tung layer voi code that.",
    answerBullets: [
      "Noi thao tac nguoi dung tren UI dau tien.",
      "Chi ra DTO/MessageType/Request/Response di qua socket.",
      "Noi service nao la noi business rule that su.",
      "Noi DAO/database hoac NotificationService neu luong co persistence/realtime.",
    ],
    mustMention: [flowName, "Controller/FXML", "Client service/socket", "Handler/Service/DAO"],
    commonMistakes: [
      "Chi ke ten file nhung khong noi thu tu request di qua.",
      "Nhan lam client service voi server service.",
      "Quen noi response/event realtime quay ve UI.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Neu server tra loi error thi controller hien thi o dau?",
      "Role nao duoc phep thuc hien luong nay?",
      "Test nao gan nhat co the chung minh luong nay?",
    ],
    tags: ["Flow", flowName, "Client-server"],
  });
}

const architectureConcepts = [
  ["Client-server boundary", ["SocketClient.java", "ClientHandler.java", "RequestRouter.java"], "Client chi render UI va gui request; server giu quyen xu ly nghiep vu va database.", ["client-server", "Socket", "Boundary"]],
  ["MVC JavaFX", ["AuctionDetailController.java", "AuctionDetailView.fxml", "AuctionClientService.java"], "FXML la view, controller xu ly interaction, client service goi server.", ["MVC", "JavaFX", "Controller"]],
  ["Handler-Service-DAO", ["RequestRouter.java", "BidRequestHandler.java", "BidService.java", "BidDao.java"], "Handler nhan protocol, service xu ly rule, DAO che SQL.", ["Layered Architecture", "DAO", "Service"]],
  ["DTO/Protocol", ["Request.java", "Response.java", "MessageType.java", "PlaceBidRequest.java"], "DTO va protocol la hop dong giua client-server, giup hai module build doc lap.", ["DTO", "Protocol", "Gson"]],
  ["Maven multi-module", ["pom.xml", "server/pom.xml", "client/pom.xml", "common/pom.xml"], "Parent pom quản lý version; common/server/client tách dependency đúng phạm vi. Khi build toàn bộ repo dùng lệnh mvn clean package từ thư mục gốc.", ["Maven", "Module", "Dependency scope", "mvn clean package"]],
  ["Separation of concerns", ["AuctionListController.java", "AuctionClientService.java", "AuctionService.java", "SQLiteAuctionDao.java"], "Moi lop giu mot vai tro de team de chia viec va test.", ["SoC", "SRP", "Layer"]],
  ["Transaction boundary", ["Database.java", "BidService.java", "AuctionService.java"], "Transaction phai bao quanh cac update lien quan de tranh trang thai nua voi.", ["Transaction", "ACID", "Rollback"]],
  ["Authorization boundary", ["RequestRouter.java", "AuthService.java", "SessionManager.java"], "Server kiem session/role/owner, UI an nut khong du bao mat.", ["Auth", "Role", "Security"]],
  ["Realtime event model", ["NotificationService.java", "SocketClient.java", "BidUpdateEvent.java"], "Server push event cho subscriber thay vi bat client polling lien tuc.", ["Realtime", "Observer", "Event"]],
  ["Testability by interfaces", ["BidDao.java", "AuctionDao.java", "BidServiceTransactionTest.java"], "Service phu thuoc interface DAO nen test co the dung fake/failing DAO.", ["DIP", "Testability", "Interface"]],
  ["Domain model boundary", ["User.java", "Bidder.java", "Seller.java", "Admin.java", "Item.java", "ItemFactory.java"], "OOP model mo ta role/item, con DTO dung de truyen qua mang.", ["OOP", "Domain Model", "DTO"]],
];

const architecturePrompts = [
  (name) => `Tai sao thiet ke ${name} phu hop voi bai dau gia online cua nhom?`,
  (name) => `Neu bo ${name}, code se kho test hoac de loi o dau?`,
  (name) => `Hay chi file the hien ro nhat ${name} va giai thich trach nhiem tung layer.`,
  (name) => `${name} giup thanh vien trong nhom chia viec va bao ve van dap nhu the nao?`,
  (name) => `Khi co bug, ${name} giup em khoanh vung loi tu UI den DB ra sao?`,
];

for (let i = 0; i < 55; i += 1) {
  const [concept, names, explanation, tags] = architectureConcepts[i % architectureConcepts.length];
  const matched = matchFiles(names);
  addQuestion("Design", {
    level: i % 4 === 0 ? "Defense" : "Kien truc",
    topic: concept,
    question: architecturePrompts[Math.floor(i / architectureConcepts.length) % architecturePrompts.length](concept),
    answer: `${concept}: ${explanation} Trong repo, mo cac file ${fileList(matched)}. Khi tra loi, noi nguyen ly truoc, sau do noi code ap dung, cuoi cung noi loi nao duoc phong tranh.`,
    intent: "Kiem tra hieu kien truc, khong chi hoc thuoc ten file.",
    answerBullets: [
      "Dinh nghia nguyen ly bang mot cau ngan.",
      "Gan nguyen ly voi file that trong repo.",
      "Noi loi/rui ro ma thiet ke nay phong tranh.",
      "Noi test hoac demo nao co the chung minh.",
    ],
    mustMention: [concept, ...tags, ...matched.slice(0, 2).map((file) => file.path)],
    commonMistakes: [
      "Tra loi ly thuyet chung chung nhung khong chi duoc file.",
      "Gom controller, service va DAO thanh mot vai tro.",
      "Khong noi tradeoff hoac loi neu thiet ke bi pha.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Trong repo co file nao vi pham nhe nguyen ly nay khong?",
      "Neu them tinh nang moi, em sua layer nao truoc?",
      "Nguyen ly nay lien quan SOLID nao?",
    ],
    tags: ["Architecture", ...tags],
  });
}

const patternConcepts = [
  ["Factory Method", ["ItemFactory.java", "ItemFactoryTest.java", "ItemType.java"], "ItemFactory tao Electronics/Art/Vehicle theo ItemType, giup AuctionService khong phai biet tung constructor.", ["Factory", "OCP", "SRP"]],
  ["Observer", ["NotificationService.java", "SubscriptionRequestHandler.java", "SocketClient.java"], "NotificationService giu subscribers va broadcast event realtime cho client dang quan sat auction.", ["Observer", "Realtime", "Event"]],
  ["Singleton", ["Database.java", "JsonMapper.java", "NotificationService.java", "SessionManager.java", "AuctionLockManager.java"], "Cac tai nguyen chia se co getInstance de thong nhat cau hinh va registry.", ["Singleton", "Shared resource"]],
  ["DAO/Repository", ["UserDao.java", "AuctionDao.java", "SQLiteAuctionDao.java", "SQLiteBidDao.java"], "DAO interface che SQL, service lam viec voi abstraction thay vi query truc tiep.", ["DAO", "Repository", "DIP"]],
  ["Dependency Inversion", ["BidService.java", "BidDao.java", "AuctionDao.java", "UserDao.java"], "Service phu thuoc interface DAO, giup test bang fake DAO va thay doi SQLite it anh huong.", ["DIP", "SOLID", "Testability"]],
  ["Single Responsibility", ["AuctionListController.java", "AuctionClientService.java", "AuctionService.java", "SQLiteAuctionDao.java"], "Controller lo UI, client service lo protocol, server service lo rule, DAO lo SQL.", ["SRP", "SOLID", "Layer"]],
  ["Open/Closed", ["ItemFactory.java", "Item.java", "Electronics.java", "Art.java", "Vehicle.java"], "Them loai item nen mo rong subclass/factory mapping thay vi sua toan bo luong dau gia.", ["OCP", "SOLID", "Inheritance"]],
  ["Liskov Substitution", ["Item.java", "Electronics.java", "Art.java", "Vehicle.java", "ModelInheritanceTest.java"], "Cac subclass Item phai dung duoc o noi code mong doi Item.", ["LSP", "SOLID", "OOP"]],
  ["Interface Segregation", ["BidDao.java", "AuctionDao.java", "UserDao.java", "AutoBidDao.java", "ItemDao.java"], "DAO tach theo aggregate giup service chi phu thuoc nhom method can dung.", ["ISP", "SOLID", "DAO"]],
];

const patternPrompts = [
  (name) => `Project dung ${name} o dau, va no giai quyet van de thiet ke nao?`,
  (name) => `Neu khong dung ${name}, code se bi lap hoac coupling nhu the nao?`,
  (name) => `Hay giai thich ${name} bang file that, khong chi noi dinh nghia sach giao khoa.`,
  (name) => `${name} lien quan toi SOLID nao trong project nay?`,
  (name) => `Khi van dap, em se demo ${name} bang test/file nao?`,
];

for (let i = 0; i < 45; i += 1) {
  const [pattern, names, explanation, tags] = patternConcepts[i % patternConcepts.length];
  const matched = matchFiles(names);
  addQuestion("Pattern", {
    level: "Defense",
    topic: pattern,
    question: patternPrompts[Math.floor(i / patternConcepts.length) % patternPrompts.length](pattern),
    answer: `${pattern}: ${explanation} File nen mo: ${fileList(matched)}. Cau tra loi tot phai noi pattern nay lam giam coupling/tang testability/tang kha nang mo rong o diem nao.`,
    intent: "Kiem tra kha nang nhan dien design pattern va SOLID trong code that.",
    answerBullets: [
      "Noi ten pattern/principle.",
      "Chi file va line neo.",
      "Noi van de no giai quyet.",
      "Noi tradeoff hoac rui ro neu dung sai.",
    ],
    mustMention: [pattern, ...tags, ...matched.slice(0, 2).map((file) => file.path)],
    commonMistakes: [
      "Noi pattern theo dinh nghia tren mang nhung khong gan code.",
      "Nhan nham DAO voi DTO hoac Observer voi polling.",
      "Khong noi loi thiet ke neu bo pattern.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Pattern nay co lam code phuc tap hon khong?",
      "Co the thay bang cach don gian hon khong?",
      "Neu them feature moi, pattern nay giup sua it file nao?",
    ],
    tags: ["Pattern", "SOLID", ...tags],
  });
}

const debugConcepts = [
  ["race condition khi hai bidder dat gia", ["BidService.java", "AuctionLockManager.java", "LockRegistry.java", "BidServiceConcurrencyTest.java"], "Khong lock theo auction co the lam hai request cung doc current price cu va ghi de nhau.", ["Race condition", "Concurrency", "Lost update"]],
  ["transaction rollback khi bid persistence fail", ["BidService.java", "Database.java", "BidServiceTransactionTest.java"], "Neu insert bid loi, wallet/auction phai rollback de khong mat tien hoac sai current price.", ["Transaction", "Rollback", "ACID"]],
  ["disconnect socket khi dang subscribe", ["ClientHandler.java", "NotificationService.java", "SocketClient.java", "ClientHandlerIntegrationTest.java"], "Server phai unsubscribe writer khi socket disconnect de tranh gui vao connection chet.", ["Socket", "Disconnect", "Realtime"]],
  ["request sai role", ["RequestRouter.java", "SessionManager.java", "RequestRouterAuthorizationTest.java"], "Router/server phai chan message type theo role, khong tin UI an nut.", ["Authorization", "Role", "Security"]],
  ["malformed JSON/request", ["ClientHandler.java", "JsonMapper.java", "Response.java"], "ClientHandler phai parse an toan va tra Response error thay vi crash thread.", ["Protocol", "JSON", "Error handling"]],
  ["stale UI sau realtime event", ["SocketClient.java", "NotificationManager.java", "AuctionDetailController.java", "BidTimeline.java"], "Client can lang nghe event va cap nhat UI thread dung cach.", ["JavaFX", "Realtime", "UI state"]],
  ["scheduler settlement fail", ["AuctionManagerService.java", "AuctionDao.java", "AuctionManagerServiceTest.java"], "Settlement loi tam thoi phai luu attempts/nextRetryAt de retry thay vi danh dau PAID sai.", ["Scheduler", "Retry", "Settlement"]],
  ["wallet insufficient funds", ["WalletService.java", "BidService.java", "BidServiceTest.java"], "Server service phai check balance/locked funds truoc khi chap nhan bid.", ["Wallet", "Business rule", "Validation"]],
  ["image/asset URL sai", ["AssetServer.java", "ImageUrlUtil.java", "AuctionRequestHandler.java"], "Anh upload duoc serve qua HTTP asset server, client can normalize URL.", ["HTTP", "Asset", "Client"]],
];

const debugPrompts = [
  (name) => `Neu bug ${name} xay ra trong demo, em trace tu dau va mong doi log/file nao thay doi?`,
  (name) => `Tai sao ${name} la loi nguy hiem trong he thong dau gia?`,
  (name) => `Code hien tai phong tranh ${name} bang co che nao?`,
  (name) => `Neu test cho ${name} fail, em doc file nao truoc?`,
  (name) => `Hay dua ra mot cach tai hien ${name} bang thao tac UI hoac unit test.`,
];

for (let i = 0; i < 45; i += 1) {
  const [debugName, names, explanation, tags] = debugConcepts[i % debugConcepts.length];
  const matched = matchFiles(names);
  addQuestion("Debug", {
    level: "Debug",
    topic: debugName,
    question: debugPrompts[Math.floor(i / debugConcepts.length) % debugPrompts.length](debugName),
    answer: `${debugName}: ${explanation} Trace nen mo ${fileList(matched)}. Khi tra loi, noi trieu chung nguoi dung thay, server/client lam gi, invariant nao phai giu va test nao bao ve.`,
    intent: "Kiem tra nang luc debug, khong chi doc code thuan tuy.",
    answerBullets: [
      "Mo ta symptom tren UI/server.",
      "Khoanh vung layer nghi ngo.",
      "Chi co che phong tranh trong code.",
      "Noi test/manual case tai hien loi.",
    ],
    mustMention: [debugName, ...tags, ...matched.slice(0, 2).map((file) => file.path)],
    commonMistakes: [
      "Do loi cho UI trong khi rule nam o server.",
      "Khong noi invariant can giu sau loi.",
      "Bo qua log/test da co san.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Neu loi chi xay ra khi nhieu client cung bid thi test nao can chay?",
      "Sau khi fix, em can verify bang manual case nao?",
      "Thong bao loi nen hien o client hay log server?",
    ],
    tags: ["Debug", ...tags],
  });
}

const testingConcepts = [
  ["BidServiceConcurrencyTest", ["BidServiceConcurrencyTest.java", "ConcurrentBidTest.java", "BidService.java"], "Chung minh nhieu bid song song khong gay lost update.", ["Concurrency", "JUnit", "Service test"]],
  ["BidServiceTransactionTest", ["BidServiceTransactionTest.java", "Database.java", "BidService.java"], "Dung failing DAO de chung minh rollback khi persistence fail.", ["Transaction", "Rollback", "Fake DAO"]],
  ["RequestRouterAuthorizationTest", ["RequestRouterAuthorizationTest.java", "RequestRouter.java", "SessionManager.java"], "Chung minh server chan request sai role.", ["Authorization", "Router", "Security"]],
  ["ClientHandlerIntegrationTest", ["ClientHandlerIntegrationTest.java", "ClientHandler.java", "NotificationService.java"], "Test socket integration, subscribe/unsubscribe va response JSON.", ["Socket", "Integration test", "Realtime"]],
  ["ItemFactoryTest", ["ItemFactoryTest.java", "ItemFactory.java", "ItemType.java"], "Chung minh Factory tao dung subclass item.", ["Factory", "OOP", "Unit test"]],
  ["DAO SQLite tests", ["SQLiteAuctionDaoTest.java", "SQLiteBidDaoTest.java", "SQLiteUserDaoTest.java"], "Kiem tra SQL mapping voi SQLite that.", ["DAO", "SQLite", "Persistence test"]],
  ["Client util tests", ["BidTimelineTest.java", "AuctionStatusUiTest.java", "SocketClientIntegrationTest.java"], "Kiem tra logic hien thi/timeline/socket phia client.", ["Client", "UI logic", "Integration"]],
];

for (let i = 0; i < 35; i += 1) {
  const [testName, names, explanation, tags] = testingConcepts[i % testingConcepts.length];
  const matched = matchFiles(names);
  addQuestion("Test", {
    level: "Demo",
    topic: testName,
    question: `Neu giang vien hoi test ${testName} chung minh dieu gi, em se giai thich arrange-act-assert nhu the nao?`,
    answer: `${testName}: ${explanation} Mo file ${fileList(matched)}. Tra loi theo Arrange-Act-Assert: du lieu dau vao, hanh dong goi service/socket/DAO, va invariant/assert cuoi cung.`,
    intent: "Kiem tra kha nang doc test de bao ve behavior, khong chi chay lenh test.",
    answerBullets: [
      "Noi test setup du lieu gi.",
      "Noi action goi class/method nao.",
      "Noi assert bao ve rule nao.",
      "Noi neu test fail thi tinh nang nao co nguy co hong.",
    ],
    mustMention: [testName, ...tags],
    commonMistakes: [
      "Chi noi test pass/fail ma khong noi behavior.",
      "Khong phan biet unit test voi integration test.",
      "Quen noi test lien quan manual demo nao.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Lenh Maven nao chay rieng test nay?",
      "Test nay co dung mock/fake hay SQLite that?",
      "Manual case nao tuong ung voi test nay?",
    ],
    tags: ["Test", ...tags],
  });
}

const roleConcepts = [
  ["Bidder boundary", ["BidService.java", "WalletService.java", "LiveBiddingController.java", "RequestRouter.java"], "Bidder duoc xem/dau gia/nap vi, nhung khong duoc sua auction cua seller hay admin action.", ["Bidder", "Role", "Authorization"]],
  ["Seller boundary", ["CreateAuctionController.java", "AuctionService.java", "EditAuctionController.java", "RequestRouter.java"], "Seller tao/sua/huy auction cua minh trong dieu kien server cho phep.", ["Seller", "Owner", "Business rule"]],
  ["Admin boundary", ["AdminPanelController.java", "AdminRequestHandler.java", "RequestRouter.java", "SQLiteUserDao.java"], "Admin quan ly user/auction va phai bi chan voi token khong phai ADMIN.", ["Admin", "Role", "Security"]],
  ["Session and ownership", ["SessionManager.java", "AuthService.java", "RequestRouter.java"], "Token xac dinh userId; service can kiem owner/resource rieng.", ["Session", "Authentication", "Authorization"]],
  ["Wallet and settlement", ["WalletService.java", "AuctionManagerService.java", "AuctionSettlementTest.java"], "Tien bidder/seller phai xu ly dung khi bid, refund, settlement va retry.", ["Wallet", "Settlement", "Business rule"]],
];

for (let i = 0; i < 20; i += 1) {
  const [roleName, names, explanation, tags] = roleConcepts[i % roleConcepts.length];
  const matched = matchFiles(names);
  addQuestion("Role", {
    level: "Hoi xoay",
    topic: roleName,
    question: `Voi ${roleName}, server phai dam bao rule nao de khong mat diem phan role/bao mat?`,
    answer: `${roleName}: ${explanation} Can mo ${fileList(matched)}. Tra loi theo thu tu: UI co the an/hien nut, nhung server moi kiem token/role/owner va service moi quyet dinh business rule.`,
    intent: "Kiem tra kha nang phan biet UI permission va server authorization.",
    answerBullets: [
      "Noi role duoc lam gi.",
      "Noi role bi cam lam gi.",
      "Noi server check o dau.",
      "Noi test/manual case can demo.",
    ],
    mustMention: [roleName, "server authorization", ...tags],
    commonMistakes: [
      "Cho rang UI an nut la du bao mat.",
      "Khong noi owner/resource check.",
      "Quen wallet/settlement la rule server.",
    ],
    filePath: primaryPath(matched),
    lineRefs: refsFromFiles(matched),
    followUps: [
      "Neu bidder gui request admin bang tool rieng thi server xu ly sao?",
      "UI can hien thong bao gi khi bi Unauthorized?",
      "Test nao bao ve role nay?",
    ],
    tags: ["Role", "Security", ...tags],
  });
}

const anchorFiles = codeFiles.filter((file) =>
  ["Server Service", "Socket/Handler", "JavaFX Controller", "SQLite DAO", "DAO Interface", "Protocol", "Factory", "Concurrency", "Test"].includes(file.layer),
);
let anchorIndex = 0;
while (questions.length < 300) {
  const file = anchorFiles[anchorIndex % anchorFiles.length] ?? codeFiles[anchorIndex % codeFiles.length];
  const anchors = [...file.declarations, ...file.methods, ...file.importantLines].filter(Boolean);
  const anchor = anchors[anchorIndex % Math.max(anchors.length, 1)] ?? {
    line: 1,
    code: path.basename(file.path),
    explain: file.summary,
  };
  const ref = {
    line: anchor.line,
    code: anchor.code,
    explain: anchor.explain ?? lineExplain(anchor.code, file.layer),
  };
  addQuestion("Line code", {
    level: file.layer.includes("Test") ? "Test" : file.layer.includes("Service") ? "Hoi xoay" : "Code",
    topic: `${file.layer} line ${ref.line}`,
    question: `Vì sao line ${ref.line} trong ${file.path} quan trọng trong luồng chạy, và nếu sửa sai thì rủi ro gì?`,
    answer: `Line ${ref.line}: ${ref.code}. Y nghia: ${ref.explain}. File nay thuoc ${file.layer}; trach nhiem chinh: ${file.summary}. Tra loi tot la noi input, output, ai goi no, va loi se lan ra UI/server/test nao.`,
    intent: "Kiem tra doc code co ngu canh, khong phai chi dich tung dong.",
    answerBullets: [
      "Doc dung line va file.",
      "Noi trach nhiem file trong layer.",
      "Noi line lien quan luong nao.",
      "Noi rui ro neu sua sai.",
    ],
    mustMention: [file.path, `line ${ref.line}`, file.layer],
    commonMistakes: [
      "Chi doc lai cu phap Java.",
      "Khong noi ai goi line nay.",
      "Khong noi test/manual case lien quan.",
    ],
    filePath: file.path,
    lineRefs: [ref],
    followUps: [
      "Line nay lien he gi voi yeu cau de bai?",
      "Neu doi line nay thi can chay test nao?",
      "Loi o day hien ra client nhu the nao?",
    ],
    tags: ["Line code", file.layer, file.module],
  });
  anchorIndex += 1;
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
  intent: string;
  answerBullets: string[];
  mustMention: string[];
  commonMistakes: string[];
  tags: string[];
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
export type ProjectAudit = {
  repoRoot: string;
  totalFilesScanned: number;
  codeMapFiles: number;
  textFilesInInventory: number;
  assetDocumentFiles: string[];
  intentionallyNotCodeMapped: string[];
  missingTextFiles: string[];
  excludedDirectories: string[];
  includedExtensions: string[];
  note: string;
};

export const generatedAt = ${JSON.stringify(new Date().toISOString())};
export const projectCodeFiles: GeneratedCodeFile[] = ${JSON.stringify(codeFiles, null, 2)};
export const generatedQuestions: GeneratedQuestion[] = ${JSON.stringify(questions.slice(0, 300), null, 2)};
export const generatedManualCases: GeneratedManualCase[] = ${JSON.stringify(manualCases, null, 2)};
export const projectAudit: ProjectAudit = ${JSON.stringify(projectAudit, null, 2)};
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
      audit: {
        totalFilesScanned: projectAudit.totalFilesScanned,
        codeMapFiles: projectAudit.codeMapFiles,
        textFilesInInventory: projectAudit.textFilesInInventory,
        missingTextFiles: projectAudit.missingTextFiles.length,
        assetDocumentFiles: projectAudit.assetDocumentFiles.length,
        intentionallyNotCodeMapped: projectAudit.intentionallyNotCodeMapped.length,
      },
    },
    null,
    2,
  ),
);
