# Plan xây dựng web hỗ trợ học vấn đáp BTL LTNC 2026

## 1. Mục tiêu

Xây dựng một web học vấn đáp cho dự án `online-auction-system` tại `D:\Code\java\online-auction-system`, phục vụ mục tiêu quan trọng nhất của đề: mọi thành viên phải giải thích được toàn bộ mã nguồn, từ ý nghĩa từng file, từng luồng chạy, từng test case, Maven, thư viện, GUI JavaFX, socket, concurrency, database đến các chức năng nâng cao như auto-bidding, anti-sniping và realtime chart.

Web không chỉ là tài liệu tĩnh. Nó cần là một hệ thống luyện bảo vệ có kiểm tra hiểu biết:

- Học theo đề bài và thang điểm.
- Học theo cây thư mục và từng file.
- Học theo luồng nghiệp vụ thật: login, tạo auction, bid, auto-bid, anti-sniping, close auction, wallet settlement, admin.
- Học theo test case và cách tự tạo test.
- Luyện vấn đáp với câu hỏi theo mức: cơ bản, hỏi xoáy, debug, giải thích code, demo.
- Theo dõi tiến độ từng thành viên để tránh rủi ro "một người không hiểu thì cả nhóm 0 điểm".

## 2. Căn cứ từ đề và repo hiện tại

Nguồn đầu vào:

- `D:\Code\bunjs\btl-helper\2026-Bài tập lớn.pdf`
- `D:\Code\bunjs\btl-helper\Hướng dẫn BTL LTNC-2026.pdf`
- `D:\Code\java\online-auction-system`

Các yêu cầu đề nhấn mạnh:

- Java, JavaFX, MVC, Client-Server.
- Socket hoặc REST, hiện repo dùng TCP Socket JSON một dòng.
- Chỉ server truy cập database.
- OOP: `Entity`, `Item`, `Electronics`, `Art`, `Vehicle`, `User`, `Bidder`, `Seller`, `Admin`, `Auction`, `BidTransaction`.
- Pattern: Singleton, Factory Method, Observer; có thể thêm Strategy/Command nếu giải thích được.
- Concurrency: tránh lost update, rollback sai, race condition, hai người cùng thắng.
- Realtime update: không polling liên tục.
- Unit test JUnit, CI/CD GitHub Actions.
- Chức năng nâng cao: Auto-Bidding, Anti-sniping, Bid History Visualization.

Repo hiện tại đã có nền tốt:

- Maven multi-module: `common`, `server`, `client`.
- `common`: model, DTO, enum, protocol.
- `server`: DAO, service, socket handlers, concurrency, SQLite.
- `client`: JavaFX controller, service proxy, socket client, FXML, CSS.
- `docs`: có sẵn overview, protocol, testing, onboarding, mock interview và các chủ đề interview.

## 3. Người dùng của web

Vai trò trong web học:

- `Leader`: tạo kế hoạch học, gán module, xem heatmap điểm yếu.
- `Member`: học code, trả lời quiz, ghi chú "mình giải thích được/chưa".
- `Mock examiner`: người hỏi thử, dùng bộ câu hỏi và chấm câu trả lời.

Không cần đăng nhập phức tạp ở MVP. Có thể dùng profile local: `memberName`, `roleInTeam`, `assignedModules`.

## 4. Stack đề xuất

Vì workspace là `D:\Code\bunjs\btl-helper`, nên chọn stack gọn, chạy nhanh:

- Runtime: Bun.
- Frontend: Vite + React + TypeScript.
- UI: Tailwind CSS hoặc CSS module thuần nếu muốn ít dependency.
- Data local: SQLite qua `bun:sqlite`, hoặc JSON files trong `data/generated` cho MVP.
- Code indexing: script Bun/Node đọc repo Java, PDF text, Markdown docs và tạo dữ liệu học.
- Search: ban đầu dùng Fuse.js hoặc MiniSearch; sau đó có thể thêm SQLite FTS.
- Test web: Vitest cho parser/service, Playwright cho luồng UI học.

Lý do: web này là công cụ học offline/local, ưu tiên tốc độ build, dễ chạy, dễ sửa. Không cần backend nặng ngay từ đầu.

### 4.1 Design system và nguyên tắc UX/UI

Định vị sản phẩm: web học nội bộ dạng educational dashboard, không phải landing page. Màn đầu tiên phải là "Learning Cockpit": người học thấy ngay mình cần học gì, còn yếu ở đâu, hôm nay nên bấm vào luồng/file/câu hỏi nào.

Thiết kế nên theo hướng rõ, scan nhanh, ít trang trí:

- Layout desktop 3 vùng: sidebar trái cho chủ đề, vùng giữa cho bài học, panel phải cho "câu hỏi vấn đáp + checklist + file liên quan".
- Layout tablet/mobile: sidebar thành drawer, panel phải chuyển thành tab dưới nội dung.
- Mỗi màn chỉ có một CTA chính: `Học luồng này`, `Tự kiểm tra`, `Chạy demo`, `Đánh dấu giải thích được`.
- Dùng icon thống nhất từ Lucide/Heroicons, không dùng emoji làm icon UI.
- Card bán kính tối đa 8px để giữ cảm giác công cụ học/kỹ thuật, không dùng card lồng card.
- Màu chủ đạo không được một màu đơn điệu: nền sáng trung tính, primary indigo cho điều hướng, green cho "đã hiểu", amber cho "cần ôn", red cho "rủi ro bảo vệ", blue cho realtime/network.
- Font: `Fira Sans` cho nội dung học, `Fira Code` cho code, JSON, command Maven.
- Text code luôn có nút `copy`, nhưng phần học phải có giải thích bằng tiếng Việt ngay cạnh, tránh bắt thành viên tự đọc raw code dài.
- Tất cả nút/card click được cần `cursor-pointer`, hover/focus rõ, transition 150-300ms.
- Hỗ trợ keyboard: tab order đúng, có skip link tới nội dung chính, focus ring nhìn rõ.
- Có breadcrumb ở các trang sâu: `Dashboard > Flows > Place Bid > BidService.java`.
- Có progress indicator cho mọi lộ trình nhiều bước: `Bước 2/5: Server xử lý request`.
- Responsive cần kiểm ở 375px, 768px, 1024px, 1440px; không để horizontal scroll.

Các chart nên dùng:

- Line/area chart: tiến độ học theo ngày, giá bid theo thời gian, timeline realtime.
- Horizontal bar chart: module nào còn yếu, file nào nhiều câu sai.
- Radar chart: độ sẵn sàng theo chủ đề `OOP`, `Socket`, `Concurrency`, `Database`, `JavaFX`, `Testing`; chỉ dùng 5-8 trục và luôn kèm bảng số liệu.

### 4.2 Nguyên tắc "nhìn là học được ngay"

Mỗi đơn vị học, dù là file, role, flow hay test, đều theo cùng một khuôn:

1. `Nó dùng để làm gì?` Một đoạn 2-4 câu, không thuật ngữ quá sớm.
2. `Nằm ở đâu?` File path, method chính, module.
3. `Khi chạy thật thì ai gọi nó?` UI -> client service -> socket -> server handler -> service -> DAO -> DB -> event.
4. `Lý thuyết liên quan` OOP, pattern, thread, socket, transaction, JavaFX thread.
5. `Giải thích code` Theo block trước, dòng quan trọng sau.
6. `Demo được không?` Kịch bản bấm tay và expected result.
7. `Test nào chứng minh?` Unit/integration/manual test.
8. `Giảng viên có thể hỏi gì?` 5-10 câu hỏi kèm đáp án mẫu.
9. `Mình đã hiểu chưa?` Nút tự chấm: chưa đọc, đã đọc, giải thích được, mock passed.

## 5. Kiến trúc tổng thể của web

```text
btl-helper/
  src/
    app/                 # React routes/pages
    components/          # UI dùng chung
    features/
      syllabus/          # đề bài, thang điểm, checklist
      code-map/          # cây file, giải thích từng file/từng dòng
      flows/             # luồng hoạt động server-client-db-ui
      tests/             # test cases tự động và thủ công
      interview/         # bộ câu hỏi vấn đáp
      progress/          # tiến độ từng thành viên
    lib/
      repo-index.ts      # đọc index đã sinh
      search.ts          # tìm kiếm
      scoring.ts         # chấm mức hiểu
  scripts/
    extract-pdf.ts       # trích PDF thành text
    index-repo.ts        # quét file Java/FXML/CSS/pom/docs
    build-learning-db.ts # sinh dữ liệu học
  data/
    source/              # text PDF, docs đã trích
    generated/           # code index, questions, flows
```

Web chỉ đọc dữ liệu đã index, không sửa repo Java. Các script index có thể chạy lại khi `online-auction-system` thay đổi.

## 6. Data model học tập

Các bảng hoặc JSON chính:

```ts
type SourceFile = {
  id: string;
  path: string;
  module: "common" | "server" | "client" | "docs" | "root";
  kind: "java" | "fxml" | "css" | "pom" | "md" | "sql" | "properties";
  purpose: string;
  dependencies: string[];
  exportedConcepts: string[];
  riskLevel: "low" | "medium" | "high";
};

type CodeLineNote = {
  fileId: string;
  line: number;
  code: string;
  plainMeaning: string;
  theory: string[];
  vivaQuestions: string[];
};

type FlowCard = {
  id: string;
  title: string;
  roleView: ("seller" | "bidder" | "admin" | "server" | "client")[];
  actors: string[];
  messageTypes: string[];
  steps: FlowStep[];
  relatedFiles: string[];
  theoryCards: string[];
  manualTests: string[];
  automatedTests: string[];
};

type TheoryCard = {
  id: string;
  topic: string;
  explainLikeStudent: string;
  projectExample: string;
  relatedMessageTypes: string[];
  commonMistakes: string[];
  learnMoreLinks: { label: string; url: string }[];
};

type RoleLearningPath = {
  role: "seller" | "bidder" | "admin";
  features: string[];
  screens: string[];
  serverFiles: string[];
  clientFiles: string[];
  demoScripts: string[];
  vivaQuestions: string[];
};

type VisualComponentSpec = {
  id: string;
  type:
    | "swimlane"
    | "sequence-player"
    | "state-machine"
    | "erd"
    | "concurrency-timeline"
    | "socket-inspector"
    | "maven-graph"
    | "test-flow"
    | "role-journey"
    | "failure-replay";
  title: string;
  learningGoal: string;
  relatedFlows: string[];
  relatedFiles: string[];
  relatedTheoryCards: string[];
  requiredInteractions: string[];
};

type InterviewQuestion = {
  id: string;
  topic: string;
  difficulty: "basic" | "intermediate" | "hard" | "trap";
  question: string;
  expectedAnswer: string;
  followUps: string[];
  relatedFiles: string[];
};

type MemberProgress = {
  member: string;
  fileId: string;
  status: "not-started" | "read" | "can-explain" | "mock-passed";
  lastScore: number;
  weakPoints: string[];
};
```

## 7. Trang chính cần có

### 7.1 Dashboard ôn bảo vệ

Mục tiêu: biết nhóm đang yếu ở đâu.

Hiển thị:

- Khối `Học ngay hôm nay`: 3 đề xuất tự động, ví dụ `Place bid`, `BidService.java`, `Concurrency traps`.
- Tỉ lệ file đã học.
- Tỉ lệ luồng đã demo được.
- Tỉ lệ câu hỏi vấn đáp đã trả lời đúng.
- Cảnh báo file "sống còn": `BidService.java`, `SocketClient.java`, `ClientHandler.java`, `RequestRouter.java`, `Database.java`, `AuctionManagerService.java`, `NotificationService.java`, `pom.xml`.
- Checklist theo thang điểm 10+1.
- Heatmap theo thành viên: hàng là thành viên, cột là chủ đề, màu thể hiện mức sẵn sàng.
- "Red zone": file/luồng mà bất kỳ thành viên nào chưa `mock-passed`.

### 7.2 Đề bài và rubric

Nội dung:

- Tóm tắt yêu cầu bắt buộc.
- Tóm tắt yêu cầu nâng cao.
- Mapping yêu cầu đề bài sang file trong repo.
- Mỗi mục có trạng thái: đã implement, cần kiểm chứng, cần bổ sung demo.

Ví dụ mapping:

- Quản lý người dùng: `AuthService`, `AuthRequestHandler`, `LoginController`, `RegisterController`, `UserDao`, `SQLiteUserDao`.
- Đấu giá: `BidService`, `AuctionService`, `AuctionManagerService`, `BidRequestHandler`.
- Realtime: `NotificationService`, `SocketClient`, `SubscriptionRequestHandler`, `LiveBiddingController`.
- Concurrency: `AuctionLockManager`, `LockRegistry`, `BidService`, `ConcurrentBidTest`.
- Maven/CI: root `pom.xml`, module POM, `.github/workflows/maven.yml`.

### 7.3 Code Map theo từng file

Đây là lõi của web.

Mỗi file có một card:

- File làm gì.
- Thuộc module nào.
- Ai gọi file này.
- File này gọi ai.
- Luồng nào dùng file này.
- Các dòng quan trọng.
- Lý thuyết liên quan.
- Câu hỏi vấn đáp.
- Test nào bảo vệ file này.
- Demo thủ công nào chạm tới file này.
- Nút `Explain to me`: hiện bản giải thích dễ hiểu trước, sau đó mới mở phần kỹ thuật.
- Nút `Why this matters`: nối file đó với thang điểm đề bài.

Với yêu cầu "ý nghĩa các dòng code của từng file", cách làm thực tế:

1. MVP giải thích theo block: package/import/field/constructor/method/branch/exception.
2. Sau đó sinh `CodeLineNote` cho từng dòng không rỗng.
3. Gộp dòng lặp lại như getter/setter, import, FXML attribute thành nhóm giải thích để học không bị ngập.
4. File rủi ro cao bắt buộc có line-by-line trước: `BidService.java`, `SocketClient.java`, `ClientHandler.java`, `RequestRouter.java`, `AuctionManagerService.java`, `Database.java`.

### 7.4 Flow Visualizer

Mỗi luồng cần có:

- Diagram server-client-db.
- Timeline từng bước.
- Request/Response JSON.
- UI nào kích hoạt.
- Service nào xử lý.
- DAO nào ghi DB.
- Event nào bắn ngược về client.
- Test nào chứng minh.
- Câu hỏi "nếu lỗi ở bước này thì debug đâu".
- Toggle góc nhìn: `Người dùng`, `Client JavaFX`, `Server`, `Database`, `Realtime event`.
- Swimlane diagram: Seller/Bidder/Admin ở trên, Client/Socket/Server/DB ở dưới.
- Step card có 4 tab cố định: `Hành động`, `Code`, `Lý thuyết`, `Câu hỏi`.

Các luồng bắt buộc:

1. Đăng ký.
2. Đăng nhập và lưu token.
3. Logout và token invalidation.
4. Dashboard theo role và cập nhật balance.
5. Seller tạo auction có item và ảnh.
6. Seller xem danh sách auction và seller stats.
7. Bidder xem danh sách auction.
8. Bidder mở detail/live room và subscribe.
9. Place bid hợp lệ.
10. Place bid không hợp lệ: giá thấp, hết tiền, phiên đóng, bid sản phẩm của chính mình.
11. Hai client bid cùng lúc.
12. Auto-bidding.
13. Anti-sniping.
14. Realtime chart cập nhật.
15. Auction tự chuyển `OPEN -> RUNNING -> FINISHED -> PAID/CANCELED`.
16. Wallet lock, release, settlement.
17. Admin khóa user hoặc cancel auction.
18. Legacy item messages `CREATE_ITEM/UPDATE_ITEM/DELETE_ITEM` trả unsupported.
19. Server mất kết nối, client fail pending request.
20. Troubleshooting: connection refused, database locked, image not found.

### 7.5 Test Lab

Chia thành 3 nhóm:

- Unit test: service logic, mock DAO.
- Integration test: SQLite thật, socket thật/fake server.
- Manual test: chạy server + nhiều client.

Mỗi test case có:

- Mục tiêu.
- File test.
- Arrange/Act/Assert.
- Vì sao test này liên quan thang điểm.
- Cách sửa nếu fail.
- Cách tạo test mới tương tự.

### 7.6 Maven & Dependency Lab

Nội dung cần học:

- Root `pom.xml` là parent aggregator, packaging `pom`, có modules `common`, `server`, `client`.
- `dependencyManagement` quản lý version chung.
- Module POM khai báo dependency cần dùng.
- `pluginManagement` quản lý compiler, surefire, javafx, exec, shade.
- Checkstyle chạy ở phase `verify`.
- Lệnh chính:
  - `mvn clean install -DskipTests`
  - `mvn test`
  - `mvn verify`
  - `mvn -pl server exec:java`
  - `mvn -pl client javafx:run`

Web cần có phần giải thích "khi thêm thư viện thì thêm ở đâu":

- Version chung: thêm property ở root.
- Dependency dùng chung: thêm vào `dependencyManagement`.
- Module nào dùng thì khai báo trong module POM.
- Test dependency đặt `scope` là `test`.
- Plugin chỉ cần cấu hình ở parent nếu dùng chung.

### 7.7 Interview Simulator

Chế độ luyện:

- Random theo chủ đề.
- Random theo file.
- Random theo luồng demo.
- Hỏi xoáy kiểu giảng viên: "Tại sao không polling?", "Nếu 2 người bid cùng lúc?", "Nếu server trả response chậm?", "Nếu auto-bid A và B cùng maxBid?".
- Chấm theo rubric: đúng ý, chỉ được file, chỉ được dòng/method, giải thích được lý thuyết, demo được.

### 7.8 Manual Demo Scripts

Mỗi demo script là một kịch bản bấm tay:

- Chuẩn bị dữ liệu.
- Mở server.
- Mở 2-3 client.
- Tài khoản nào đăng nhập.
- Bấm gì.
- Kỳ vọng server log.
- Kỳ vọng client UI.
- Kỳ vọng database.
- Câu hỏi vấn đáp đi kèm.

### 7.9 Visualize Components bắt buộc

Web phải có các component trực quan để người học hiểu cơ chế bằng mắt trước khi đọc code. Mỗi component cần có chế độ `Explain`, `Code links`, `Quiz me`.

#### 7.9.1 Swimlane Flow Diagram

Dùng cho mọi luồng nghiệp vụ quan trọng.

Lane bắt buộc:

- User role: Seller/Bidder/Admin.
- JavaFX View/FXML.
- Controller.
- ClientService.
- SocketClient.
- ClientHandler/RequestRouter.
- Server Handler.
- Service.
- DAO/Database.
- Notification/Event.

Ví dụ áp dụng:

- Login.
- Create auction.
- Place bid.
- Auto-bid.
- Anti-sniping.
- Admin cancel auction.
- Scheduler close auction.

Tương tác:

- Click một step để mở file/method liên quan.
- Hover hiện request/response JSON.
- Toggle `happy path`, `error path`, `concurrency path`.

#### 7.9.2 Sequence Diagram Player

Dùng để chạy từng bước như animation.

Tính năng:

- Nút play/pause/next/previous.
- Tốc độ chậm để thành viên tự kể lại.
- Marker màu đỏ ở điểm dễ lỗi: auth fail, invalid bid, insufficient funds, database rollback, disconnect.
- Hiển thị `MessageType`, `requestId`, token có/không, payload DTO.

Ví dụ:

- `PLACE_BID`: `LiveBiddingController -> AuctionClientService -> SocketClient -> ClientHandler -> RequestRouter -> BidRequestHandler -> BidService -> AuctionDao/BidDao/UserDao -> NotificationService -> SocketClient event listener`.

#### 7.9.3 State Machine Viewer

Dùng cho các trạng thái có lifecycle.

State machines bắt buộc:

- Auction: `OPEN -> RUNNING -> FINISHED -> PAID/CANCELED`.
- Socket connection: `DISCONNECTED -> CONNECTING -> CONNECTED`, `RECONNECTING` là trạng thái dự phòng hiện chưa dùng tự động.
- Session token: `created -> valid -> expired/logout/invalid`.
- Auto-bid rule: inactive/active/deleted.
- Bid result in My Bids: `WINNING`, `OUTBID`, `WON`, `LOST`, `WON_PENDING_PAYMENT`, `CANCELED`.

Mỗi transition phải có:

- Điều kiện chuyển.
- File/method quyết định transition.
- Event bắn ra nếu có.
- Test/manual demo chứng minh.

#### 7.9.4 Database ERD + Table Inspector

Dùng để hiểu schema SQLite.

Hiển thị:

- Bảng `users`, `items`, `auctions`, `bids`, `auto_bids`.
- Foreign key với hướng quan hệ.
- Indexes.
- Soft delete `items.deleted`.
- Settlement columns trong `auctions`.
- Sample rows từ `seed.sql`.

Tương tác:

- Click bảng để xem DAO tương ứng.
- Click cột để xem model/DTO field mapping.
- Toggle "bid accepted" để xem record nào thay đổi: auction price, bid row, locked balance.

#### 7.9.5 Concurrency Timeline Simulator

Dùng riêng cho race condition/lost update/auction lock.

Kịch bản bắt buộc:

- Không lock: Bidder A và B cùng đọc giá cũ, cùng ghi đè.
- Có `AuctionLockManager`: A xử lý xong rồi B đọc giá mới.
- Transaction rollback: lock funds fail/update fail thì state quay lại.
- Rate limit: cùng user spam bid dưới 1 giây.

Hiển thị:

- Threads A/B.
- Lock acquire/release.
- DB transaction begin/commit/rollback.
- Current price before/after.
- Highest bidder before/after.

#### 7.9.6 Socket Message Inspector

Dùng để hiểu protocol.

Hiển thị:

- Raw JSON một dòng.
- Parsed `Request`/`Response`.
- `requestId` matching.
- Token status.
- Event messages: `BID_UPDATE`, `TIME_EXTENDED`, `AUCTION_CLOSED`, `AUCTION_CANCELED`, `AUCTION_LIST_UPDATED`, `USER_LIST_UPDATED`, `SYSTEM_NOTIFICATION`.
- Unsupported legacy messages: `CREATE_ITEM`, `UPDATE_ITEM`, `DELETE_ITEM`.

Tương tác:

- Copy JSON.
- Highlight field nào do client tạo, field nào do server trả.
- Toggle pretty display nhưng nhắc rõ qua socket vẫn gửi một dòng.

#### 7.9.7 Maven Dependency Graph

Dùng để hiểu multi-module và thư viện.

Hiển thị:

- Root `online-auction-system` parent.
- Modules: `common`, `server`, `client`.
- Dependency direction: `server -> common`, `client -> common`, `common` không phụ thuộc ngược.
- Library badges: Gson, SQLite JDBC, JUnit, Mockito, jBCrypt, SLF4J, Logback, JavaFX, Ikonli.
- Plugin badges: compiler, surefire, javafx, exec, shade, checkstyle.

Tương tác:

- Click dependency để xem "dùng ở file nào".
- Click plugin để xem "lệnh Maven nào kích hoạt".

#### 7.9.8 Test Flow Visualizer

Dùng để học test case.

Hiển thị:

- Arrange/Act/Assert theo 3 cột.
- Mocked DAO vs real SQLite.
- Expected exception.
- Expected DB/event/state.
- Coverage link tới function/rubric.

Ví dụ:

- `BidServiceConcurrencyTest`: setup auction, chạy nhiều thread, assert một winner hợp lệ.
- `SocketClientIntegrationTest`: fake TCP server, send request, match response, event dispatch, disconnect.

#### 7.9.9 Role Journey Map

Dùng để học theo Seller/Bidder/Admin.

Hiển thị:

- Journey theo bước người dùng.
- Mỗi bước có màn hình JavaFX, controller, message type, service, DAO, test.
- Badge lý thuyết liên quan.

Ví dụ:

- Seller: login -> seller center -> create auction -> upload image -> receive first bid notification -> auction sold/canceled.
- Bidder: login -> deposit -> browse -> live bidding -> auto-bid -> my bids -> result.
- Admin: login -> user list -> deactivate user -> auction list -> cancel auction -> clients receive update.

#### 7.9.10 Failure Replay Debugger

Dùng để học debug và troubleshooting.

Kịch bản bắt buộc:

- Server chưa chạy: connection refused.
- Server tắt giữa request: pending future fail, token clear.
- Database locked.
- Image not found.
- Invalid token.
- Bid lower than current price.
- Auction closed.
- Insufficient funds.

Mỗi replay có:

- Symptom trên UI.
- Log server/client dự kiến.
- File cần mở để debug.
- Câu hỏi vấn đáp "em xử lý lỗi này ở đâu?".

### 7.10 Role Learning Paths

Web phải có 3 learning path riêng cho `Seller`, `Bidder`, `Admin`, vì khi bảo vệ giảng viên thường hỏi theo vai trò người dùng trước rồi mới khoan vào code.

#### Seller path

Mục tiêu học: người bán tạo và quản lý phiên đấu giá.

Chức năng cần cover:

- Đăng ký/đăng nhập với role `SELLER`.
- Logout và hiểu token bị invalidate phía server.
- Tạo sản phẩm/auction, bao gồm loại item, ảnh, start/end time, reserve price.
- Xem danh sách auction của mình.
- Xem seller dashboard/stats: doanh thu, số phiên, số lượt bid.
- Sửa auction trước khi chạy.
- Không được sửa khi auction đã `RUNNING`.
- Cancel auction và hiểu tác động tới bidder/wallet/event.
- Nhận notification khi có bid đầu tiên và khi auction bán thành công/thất bại.

Trang học Seller phải hiển thị:

- Screens: `SellerCenterView.fxml`, `CreateAuctionView.fxml`, `EditAuctionView.fxml`.
- Client controllers: `SellerCenterController`, `CreateAuctionController`, `EditAuctionController`.
- Client service: `AuctionClientService`.
- Server path: `AuctionRequestHandler` -> `AuctionService` -> `ItemFactory` -> `SQLiteItemDao`/`SQLiteAuctionDao`.
- Theory cards: MVC JavaFX, Factory Method, validation, transaction, role authorization.
- Demo: seller tạo auction, bidder bid, seller nhận notification, auction close.

#### Bidder path

Mục tiêu học: người mua tham gia đấu giá an toàn và realtime.

Chức năng cần cover:

- Đăng ký/đăng nhập với role `BIDDER`.
- Logout và hiểu vì sao request sau logout không còn hợp lệ.
- Xem danh sách phiên, xem detail, vào live bidding.
- Xem dashboard balance/locked balance.
- Subscribe realtime event.
- Nạp tiền/rút tiền.
- Place bid thường.
- Set auto-bid.
- Xem my bids/history/result.
- Hiểu locked balance và release funds khi bị outbid.
- Hiểu anti-sniping và chart giá.

Trang học Bidder phải hiển thị:

- Screens: `AuctionListView.fxml`, `AuctionDetailView.fxml`, `LiveBiddingView.fxml`, `WalletView.fxml`, `MyBidsView.fxml`.
- Client controllers: `AuctionListController`, `AuctionDetailController`, `LiveBiddingController`, `WalletController`, `MyBidsController`.
- Client services: `AuctionClientService`, `WalletClientService`.
- Server path: `BidRequestHandler` -> `BidService` -> `WalletService` -> `AuctionDao`/`BidDao`/`AutoBidDao` -> `NotificationService`.
- Theory cards: socket event, concurrency lock, transaction, JavaFX thread, CompletableFuture, proxy bidding.
- Demo: 2 bidder cùng phòng, bid realtime, auto-bid phản ứng, anti-sniping extend time.

#### Admin path

Mục tiêu học: quản trị hệ thống và chứng minh phân quyền.

Chức năng cần cover:

- Đăng nhập admin.
- Logout admin.
- Xem danh sách user.
- Active/deactivate user.
- Xem toàn bộ auction.
- Cancel auction với quyền admin.
- Quan sát system notification/list update.
- Hiểu vì sao admin không đi qua luồng seller thường.

Trang học Admin phải hiển thị:

- Screens: `AdminPanelView.fxml`.
- Client controllers/services: `AdminPanelController`, `AdminClientService`.
- Server path: `AdminRequestHandler` -> `RequestRouter` authorization -> DAO/service tương ứng.
- Theory cards: authorization vs authentication, role enum, admin boundary, audit/demo evidence.
- Demo: admin khóa bidder, bidder thao tác lại bị reject; admin cancel auction, các client nhận event.

### 7.11 Function Coverage Matrix

Web cần có bảng coverage toàn bộ chức năng project, mỗi hàng là một chức năng, mỗi cột là bằng chứng học:

| Chức năng | Role | UI | Client code | Server code | DB/DAO | Test | Manual demo | Lý thuyết |
|---|---|---|---|---|---|---|---|---|
| Register/Login | All | Login/Register | AuthClientService | AuthService/AuthRequestHandler | UserDao | AuthServiceTest | login success/fail | BCrypt, token |
| Logout | All | TopBar/AppShell | AuthClientService/SocketClient | AuthRequestHandler/SessionManager | none | AuthorizationTest cần cover | logout then request | session lifecycle |
| Dashboard | All | AppShell/TopBar/Wallet | AuctionClientService | WalletRequestHandler | User/Auction/Bid DAO | service tests | login then view balances | state management |
| Create auction | Seller | CreateAuctionView | CreateAuctionController | AuctionService | Item/Auction DAO | AuctionServiceTest | seller create | Factory, validation |
| Seller stats | Seller | SellerCenterView | AuctionClientService | AuctionRequestHandler | Auction/Bid DAO | AuctionServiceTest | seller dashboard | aggregation |
| Place bid | Bidder | LiveBiddingView | AuctionClientService | BidService | Auction/Bid/User DAO | BidServiceTest | two clients bid | transaction, lock |
| Auto-bid | Bidder | LiveBiddingView | AuctionClientService | BidService | AutoBidDao | BidServiceTest | proxy bidding | algorithm |
| Anti-sniping | Bidder | LiveBiddingView | event listener | BidService | AuctionDao | BidServiceTest | last-second bid | time logic |
| Scheduler close | Server | status update | event listener | AuctionManagerService | AuctionDao/UserDao | AuctionSettlementTest | wait close | ScheduledExecutorService |
| Realtime update | All | Live/Admin/List | SocketClient | NotificationService | none/indirect | SocketClientIntegrationTest | no refresh update | Observer/socket |
| Wallet | Bidder/Seller | WalletView | WalletClientService | WalletService | UserDao | WalletServiceTest | deposit/withdraw/settle | consistency |
| Admin control | Admin | AdminPanel | AdminClientService | AdminRequestHandler | User/Auction DAO | AuthorizationTest | deactivate/cancel | RBAC |
| Image upload/view | Seller/Bidder | Create/Detail | FileUtil/ImageUrlUtil | ImageUtil/AssetServer | item image path | manual | upload image | base64/static asset |
| Error handling | All | toast/dialog | GlobalExceptionHandler | BusinessException subclasses | rollback | transaction tests | invalid bid | exception design |
| Maven/CI | Dev | docs page | none | build config | none | GitHub Actions | mvn test | dependency management |
| Unsupported legacy item messages | Dev | none/current UI không dùng | none | RequestRouter default fail | none | router test nên cover | send CREATE_ITEM manually | protocol compatibility |
| Connection state | All | TopBar/AppShell | SocketClient/ConnectionState | ClientHandler cleanup | none | SocketClientIntegrationTest | kill server | lifecycle/failure mode |
| Git workflow | Dev | docs page | none | none | none | CI status | feature branch PR | collaboration evidence |
| Troubleshooting | Dev | docs page | none | logs/config | auction.db/uploads | manual | reproduce common errors | operational readiness |

### 7.12 Theory Library

Mỗi theory card phải vừa ngắn vừa đủ sâu để thành viên trả lời vấn đáp. Cấu trúc:

- `Khái niệm`: định nghĩa bằng lời dễ hiểu.
- `Trong project này`: chỉ file/method cụ thể.
- `Tại sao chọn cách này`: tradeoff.
- `Nếu không làm vậy thì lỗi gì`: race condition, UI freeze, duplicate response, SQL inconsistency.
- `Câu hỏi vấn đáp`: 5 câu.
- `Link học thêm`: nguồn chính thống hoặc tài liệu tốt.

Các card bắt buộc:

- JavaFX MVC và FXML.
- JavaFX Application Thread và `Platform.runLater`.
- TCP Socket, newline-delimited JSON.
- `CompletableFuture` và request/response async.
- Observer Pattern qua `NotificationService`.
- Singleton.
- Factory Method.
- DAO Pattern.
- Transaction và rollback.
- `ReentrantLock`, `ConcurrentHashMap`, race condition, lost update.
- `ScheduledExecutorService`.
- BCrypt/password hashing.
- Maven multi-module, `dependencyManagement`, plugin lifecycle.
- JUnit 5, unit vs integration test.
- SQLite WAL/busy timeout.
- SLF4J/Logback logging.

## 8. File inventory ưu tiên phải giải thích

### 8.1 Root và Maven

- `pom.xml`: parent POM, module list, Java 21, dependency/plugin management, Checkstyle.
- `common/pom.xml`: dependency cho shared model/protocol.
- `server/pom.xml`: SQLite, BCrypt, Gson, Logback, exec/shade.
- `client/pom.xml`: JavaFX, Ikonli, module dependency.
- `.github/workflows/maven.yml`: CI build/test.

### 8.2 Common: model và OOP

- `Entity.java`: abstract base, encapsulation identity/time.
- `User.java`: abstract user chung.
- `Bidder.java`, `Seller.java`, `Admin.java`: inheritance và role behavior.
- `Item.java`: abstract item.
- `Electronics.java`, `Art.java`, `Vehicle.java`: polymorphism qua `categoryDescription`.
- `Auction.java`: state trung tâm của phiên đấu giá.
- `BidTransaction.java`: lịch sử bid.
- `AutoBidRule.java`: rule proxy bidding.
- `AuctionStatus.java`, `Role.java`, `ItemType.java`: enum trạng thái/quyền/loại hàng.

### 8.3 Common: DTO và protocol

- `Request.java`, `Response.java`, `MessageType.java`: hợp đồng client-server.
- `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`, `UserDto`.
- `CreateAuctionRequest`, `UpdateAuctionRequest`, `AuctionSummaryDto`, `AuctionDetailDto`, `AuctionEventDto`.
- `PlaceBidRequest`, `PlaceBidResponse`, `BidUpdateEvent`, `SetAutoBidRequest`, `AutoBidDto`, `BidHistoryDto`.
- `DashboardDto`, `SellerStatsDto`, `SystemNotificationDto`.

### 8.4 Server: bootstrap, config, database

- `ServerMain.java`: wiring DAO/service/handler/server, khởi động asset server và auction manager.
- `AppProperties.java`: đọc config.
- `application.properties`: port, database URL, WAL, asset dir.
- `Database.java`: Singleton, connection, transaction, rollback, WAL/busy timeout.
- `SchemaInitializer.java`: tạo schema.
- `schema.sql`, `seed.sql`: bảng và dữ liệu mẫu.

### 8.5 Server: DAO

- Interface: `UserDao`, `ItemDao`, `AuctionDao`, `BidDao`, `AutoBidDao`.
- Implementation SQLite: `SQLiteUserDao`, `SQLiteItemDao`, `SQLiteAuctionDao`, `SQLiteBidDao`, `SQLiteAutoBidDao`.

Nội dung cần giải thích:

- DAO tách SQL khỏi service.
- `Optional` dùng cho tìm kiếm có thể không có.
- Transaction thuộc `Database`, service quyết định nghiệp vụ.
- Vì sao chỉ server truy cập DB.

### 8.6 Server: service

- `AuthService`: register/login, BCrypt, validation, session.
- `SessionManager`: token, hết hạn, Singleton.
- `AuctionService`: create/update/cancel auction, role/seller validation.
- `BidService`: validate bid, lock funds, update auction, anti-sniping, auto-bid trigger, notify.
- `WalletService`: deposit/withdraw/lock/release/settle.
- `AuctionManagerService`: background scheduler, status transition, settlement retry.
- `NotificationService`: Observer qua socket writer list.

### 8.7 Server: concurrency

- `AuctionLockManager`: lock theo `auctionId`.
- `LockRegistry`: quản lý map lock.
- `IdempotencyManager`: chống xử lý trùng request.

Điểm vấn đáp cần thuộc:

- Lock theo auction tốt hơn lock toàn hệ thống vì giảm nghẽn.
- Transaction bảo vệ DB consistency.
- `ConcurrentHashMap`, `ReentrantLock`, `ScheduledExecutorService` liên quan bài đa luồng.

### 8.8 Server: socket layer

- `SocketServer`: accept client.
- `ClientHandler`: mỗi client một thread, đọc JSON bằng `readLine`, cleanup khi disconnect.
- `RequestRouter`: phân tuyến theo `MessageType`, xác thực token và quyền.
- `AuthRequestHandler`, `AuctionRequestHandler`, `BidRequestHandler`, `WalletRequestHandler`, `AdminRequestHandler`, `SubscriptionRequestHandler`.
- `RouterContext`: dependency container nhẹ cho handler.
- `AssetServer`: phục vụ ảnh upload.

### 8.9 Client: JavaFX app shell

- `ClientMain`: entrypoint JavaFX.
- `SceneManager`: điều hướng màn hình, current user/balance.
- `AppShellController`, `SidebarController`, `TopBarController`.
- FXML tương ứng: `AppShell.fxml`, `components/Sidebar.fxml`, `components/TopBar.fxml`.

### 8.10 Client: auth và role screens

- `LoginController`, `RegisterController`.
- `AuthClientService`.
- `LoginView.fxml`, `RegisterView.fxml`.

### 8.11 Client: auction screens

- `AuctionListController`, `AuctionDetailController`, `LiveBiddingController`.
- `CreateAuctionController`, `EditAuctionController`, `SellerCenterController`.
- `AuctionClientService`.
- FXML: `AuctionListView.fxml`, `AuctionDetailView.fxml`, `LiveBiddingView.fxml`, `CreateAuctionView.fxml`, `EditAuctionView.fxml`, `SellerCenterView.fxml`.

### 8.12 Client: wallet/admin/my bids

- `WalletController`, `WalletClientService`, `WalletView.fxml`.
- `AdminPanelController`, `AdminClientService`, `AdminPanelView.fxml`.
- `MyBidsController`, `MyBidsView.fxml`.

### 8.13 Client: socket/util

- `SocketClient`: Singleton, connect/disconnect, `CompletableFuture`, pending requests, event listeners, JavaFX thread.
- `ConnectionState`: trạng thái kết nối.
- `NotificationManager`: toast và realtime notification.
- `BidTimeline`: merge bid history và event.
- `PriceChartManager`: realtime price curve.
- `AuctionStatusUi`: map status sang UI.
- `FileUtil`, `ImageUrlUtil`, `JsonMapper`, `GlobalExceptionHandler`.

## 9. Luồng hoạt động chi tiết cần mô phỏng trong web

### 9.1 Login

Client:

1. `LoginController` đọc username/password.
2. Gọi `AuthClientService.login`.
3. Service tạo `Request<LoginRequest>` type `LOGIN`.
4. `SocketClient.sendRequest` gắn `requestId`, gửi JSON một dòng.
5. Khi response về, `SocketClient` match `requestId` trong `pendingRequests`.
6. Nếu OK, lưu token, `SceneManager.showAppShell`.

Server:

1. `ClientHandler` đọc line JSON.
2. `RequestRouter` route type `LOGIN`.
3. `AuthRequestHandler` gọi `AuthService.login`.
4. `AuthService` tìm user, check BCrypt, tạo session token.
5. Trả `LoginResponse`.

Câu hỏi dễ bị hỏi:

- Vì sao dùng token?
- Vì sao request/response cần `requestId`?
- Nếu server gửi response cho request cũ thì client xử lý thế nào?

### 9.2 Place bid

Client:

1. User nhập amount ở `LiveBiddingController`.
2. `AuctionClientService.placeBid` gửi `PLACE_BID`.
3. UI chờ `CompletableFuture`.

Server:

1. `RequestRouter` xác thực token.
2. `BidRequestHandler` gọi `BidService.placeBid`.
3. `BidService` lock theo auction, mở transaction.
4. Validate: không bid của chính mình, auction RUNNING, giá đủ min increment, tiền đủ.
5. Lock tiền người mới, release tiền leader cũ nếu bị vượt.
6. Update auction, insert bid transaction.
7. Nếu bid trong 30 giây cuối, kéo dài thêm 60 giây.
8. Broadcast `BID_UPDATE` và có thể `TIME_EXTENDED`.
9. Sau bid thủ công, trigger auto-bid.

Client realtime:

1. Client đã subscribe nhận `BID_UPDATE`.
2. `SocketClient.handleEvent` gọi listener bằng `Platform.runLater`.
3. `LiveBiddingController` cập nhật giá, lịch sử, chart.

### 9.3 Auto-bidding

Luồng học cần giải thích:

1. User đặt `maxBid`, `increment`, `active`.
2. `BidService.setAutoBid` validate maxBid >= current + increment.
3. Kiểm tra ví đủ tiền cho max bid.
4. Lưu `AutoBidRule`.
5. Trigger `triggerAutoBids`.
6. Lấy tất cả rule active.
7. Chọn rule có `maxBid` cao nhất.
8. Tính `secondBestMax`.
9. `nextBid = max(currentPrice, secondBestMax) + increment`, nhưng không vượt `maxBid`.
10. `placeAutoStep` cập nhật leader, lock full max bid, ghi bid, broadcast.

Câu hỏi xoáy:

- Nếu hai auto-bid cùng `maxBid` thì xử lý ưu tiên thời điểm chưa rõ trong code hiện tại hay đã có?
- Vì sao không gọi đệ quy vô hạn?
- Vì sao lock full max bid chứ không chỉ current price?
- Nếu auto-bid fail do hết tiền thì rule bị xóa để tránh lặp lỗi.

### 9.4 Anti-sniping

Logic hiện tại:

- Window: 30 giây cuối.
- Extension: thêm 60 giây.
- Áp dụng trong manual bid và auto bid.
- Broadcast `TIME_EXTENDED` để client cập nhật.

Manual test:

1. Tạo auction sắp hết hạn.
2. Mở 2 client vào live bidding.
3. Bid trong 30 giây cuối.
4. Kiểm tra end time tăng thêm 60 giây trên cả 2 client.
5. Kiểm tra server log có "extended".

### 9.5 Auction settlement

`AuctionManagerService` chạy scheduler 5 giây:

1. `OPEN` đến start time chuyển `RUNNING`.
2. `RUNNING` quá end time chuyển `FINISHED`.
3. `FINISHED` không có bidder thì `CANCELED`.
4. Có bidder nhưng không đạt reserve thì `CANCELED` và refund.
5. Có bidder và đạt reserve thì `PAID`, settle ví: chuyển tiền winner -> seller, release leftover proxy funds.
6. Nếu settlement lỗi, retry theo backoff.

## 10. Bộ manual test cần đưa vào web

### Auth

- Register Bidder/Seller/Admin thành công.
- Register username trùng.
- Login đúng.
- Login sai password.
- User bị admin vô hiệu hóa không login được hoặc không thao tác được.

### Auction CRUD

- Seller tạo auction với item Electronics/Art/Vehicle.
- Seller sửa auction trước khi running.
- Seller không sửa auction đã running.
- Seller cancel auction của mình.
- Seller không thao tác auction của seller khác.

### Bid

- Bidder bid giá khởi điểm khi chưa có leader.
- Bidder bid thấp hơn min required bị reject.
- Seller tự bid auction của mình bị reject.
- Bidder hết tiền bị reject.
- Bidder tăng bid của chính mình chỉ lock phần chênh.
- Người bị outbid được release funds.

### Realtime

- Mở 2 client cùng auction, client A bid, client B cập nhật không refresh.
- Mở client admin, bid mới làm dashboard/list thay đổi.
- Unsubscribe hoặc rời màn hình không nhận event cũ.

### Auto-bid

- B đặt auto-bid max 500 increment 10.
- A bid 100, B tự nhảy lên 110.
- A bid 490, B lên 500.
- A bid 510, B không vượt max.
- Hai auto-bid cạnh tranh, người max cao hơn thắng theo bước giá.

### Anti-sniping

- Bid trước cửa sổ 30 giây: không extend.
- Bid trong 30 giây cuối: extend 60 giây.
- Auto-bid trong 30 giây cuối cũng extend.

### Wallet

- Deposit.
- Withdraw hợp lệ.
- Withdraw khi có locked balance không đủ available.
- Settle auction chuyển tiền seller và giảm locked winner.

### Connection

- Tắt server khi client đang login.
- Pending request fail.
- Token client bị clear.
- Bật lại server, user login lại.

## 11. Automated test guide cần hiển thị

Các test quan trọng cần giải thích trong web:

- `AuthServiceTest`: register/login, BCrypt, validation.
- `AuctionServiceTest`: create/update/cancel, role checks.
- `BidServiceTest`: bid hợp lệ/không hợp lệ, min increment.
- `BidServiceConcurrencyTest`, `ConcurrentBidTest`: nhiều thread bid cùng lúc.
- `BidServiceTransactionTest`: rollback và tiền không bị sai.
- `AuctionSettlementTest`: close, paid/canceled, wallet settlement.
- `WalletServiceTest`: deposit, withdraw, lock, release, settle.
- `SessionManagerTest`: token lifecycle.
- `SQLiteUserDaoTest`, `SQLiteItemDaoTest`, `SQLiteAuctionDaoTest`, `SQLiteBidDaoTest`: SQL và mapping.
- `ClientHandlerIntegrationTest`: socket JSON thật, subscribe/broadcast/cleanup.
- `RequestRouterAuthorizationTest`: quyền và auth.
- `SocketClientIntegrationTest`: fake TCP server, requestId, event dispatch, disconnect.
- `BidTimelineTest`, `AuctionStatusUiTest`: client utility.
- `ModelInheritanceTest`: OOP inheritance/model behavior.
- `ItemFactoryTest`: Factory Method.

Các khoảng trống test nên nhắc web cảnh báo:

- `LOGOUT` cần có test rõ: sau logout, token cũ không dùng được cho request cần auth.
- `CREATE_ITEM`, `UPDATE_ITEM`, `DELETE_ITEM` là message legacy không route; nên có router test xác nhận trả unsupported thay vì im lặng.
- Dashboard/seller stats nên có test hoặc manual assertion vì đang là phần dễ bị bỏ sót trong demo.
- Troubleshooting scenarios như server down, database locked, image missing nên nằm trong manual regression checklist.

Mẫu tạo test mới:

1. Xác định logic cần bảo vệ.
2. Nếu là service: mock DAO bằng Mockito.
3. Nếu là DAO: dùng SQLite test DB riêng.
4. Nếu là socket: dùng fake server hoặc `ServerSocket(0)`.
5. Arrange dữ liệu.
6. Act đúng một hành động.
7. Assert state, exception, event, DB record.
8. Đặt tên test theo hành vi: `placeBidRejectsClosedAuction`.

## 12. Bộ câu hỏi vấn đáp cốt lõi

### Kiến trúc

- Dự án chia `common`, `server`, `client` để làm gì?
- Vì sao `common` không được phụ thuộc `server` hoặc `client`?
- Vì sao chỉ server truy cập database?
- Client-Server khác gì so với app desktop đọc DB trực tiếp?
- Request/Response JSON một dòng hoạt động thế nào?
- Tại sao pretty JSON nhiều dòng làm hỏng protocol?

### OOP

- `Entity` abstract class giải quyết vấn đề gì?
- `Item` và `User` thể hiện abstraction như thế nào?
- Kế thừa ở `Electronics`, `Art`, `Vehicle` có ích gì?
- Polymorphism trong dự án nằm ở đâu?
- Encapsulation được thể hiện ra sao?
- Nếu thêm loại item `Book` cần sửa những file nào?

### Pattern

- Singleton nằm ở đâu? Lợi ích và rủi ro?
- Factory Method nằm ở `ItemFactory` như thế nào?
- Observer được hiện thực bằng `NotificationService` và socket ra sao?
- DAO pattern tách trách nhiệm thế nào?
- MVC trong client JavaFX thể hiện ở FXML, Controller, Service ra sao?

### Concurrency

- Race condition trong bidding là gì?
- Lost update có thể xảy ra như thế nào?
- Vì sao lock theo `auctionId`?
- `ConcurrentHashMap` dùng ở đâu?
- Transaction SQLite và `ReentrantLock` khác vai trò như thế nào?
- Nếu hai bidder bid cùng amount cùng lúc thì ai thắng?
- Nếu một request bị gửi lại 2 lần thì hệ thống chống thế nào?

### Socket và realtime

- `ClientHandler` đọc request như thế nào?
- `SocketClient` match response bằng `requestId` ra sao?
- Event realtime khác response thường ở điểm nào?
- Vì sao UI update phải qua `Platform.runLater`?
- Nếu client disconnect thì server cleanup subscription ở đâu?

### Bid logic

- Min increment đang là bao nhiêu và nằm ở đâu?
- Khi người mới vượt bid, tiền người cũ xử lý thế nào?
- Vì sao cần `lockedBalance`?
- Vì sao seller không được bid sản phẩm của mình?
- Nếu auction hết hạn nhưng client vẫn bấm bid, server xử lý thế nào?

### Auto-bid và anti-sniping

- Auto-bid chọn người thắng như thế nào?
- `maxBid`, `increment`, `secondBestMax` có ý nghĩa gì?
- Vì sao auto-bid không vượt `maxBid`?
- Anti-sniping window và extension duration nằm ở đâu?
- Nếu bid tự động xảy ra trong 30 giây cuối thì có extend không?

### Maven và CI

- Root POM và module POM khác nhau thế nào?
- `dependencyManagement` khác `dependencies` thế nào?
- Vì sao dùng `maven-surefire-plugin`?
- Checkstyle chạy lúc nào?
- GitHub Actions chứng minh điều gì khi bảo vệ?

## 13. Link học thêm theo chủ đề

Trang `Theory Library` nên gắn link ở cuối từng card. Ưu tiên tài liệu chính thống để thành viên không học lệch.

| Chủ đề | Dùng khi học phần nào | Link |
|---|---|---|
| JavaFX setup, Maven, Scene Builder | Client JavaFX, FXML, chạy `mvn -pl client javafx:run` | [OpenJFX Getting Started](https://openjfx.io/openjfx-docs/) |
| JavaFX `Platform.runLater` | Realtime event cập nhật UI từ socket thread | [Oracle JavaFX Platform API](https://docs.oracle.com/javafx/2/api/javafx/application/Platform.html) |
| Java concurrency tổng quan | Race condition, thread, lock, server nhiều client | [Oracle Java Concurrency Tutorial](https://docs.oracle.com/javase/tutorial/essential/concurrency/) |
| Java SE 21 concurrency APIs | Java 21, thread pool, blocking queue, concurrent utilities | [Oracle Java SE 21 Concurrency](https://docs.oracle.com/en/java/javase/21/core/concurrency.html) |
| `ReentrantLock` | `AuctionLockManager`, lock theo `auctionId` | [Oracle ReentrantLock API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html) |
| `ScheduledExecutorService` | `AuctionManagerService`, auto close/settlement retry | [Oracle ScheduledExecutorService API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html) |
| `CompletableFuture` | `SocketClient.pendingRequests`, async request/response | [Oracle CompletableFuture API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html) |
| Maven POM | Root `pom.xml`, module POM, lifecycle | [Maven POM Reference](https://maven.apache.org/maven2/pom.html) |
| Maven dependency management | `dependencyManagement`, version chung, transitive dependency | [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html) |
| JUnit 5 | Unit/integration tests, assertions, lifecycle | [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/) |
| Gson | JSON serialize/deserialize `Request`/`Response` | [Gson User Guide](https://google.github.io/gson/UserGuide.html) |
| SQLite JDBC | DAO SQLite, JDBC connection | [xerial sqlite-jdbc](https://github.com/xerial/sqlite-jdbc) |
| SLF4J | Logging server/client | [SLF4J Manual](https://www.slf4j.org/manual.html) |
| React controlled forms | Web học: quiz, filter, progress form | [React input docs](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) |
| React lazy state init | Web học: load index/search data hiệu quả | [React useState docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state) |

## 14. UX spec chi tiết cho từng màn hình

### 14.1 Learning Cockpit

Mục tiêu: thành viên vào web là biết học gì ngay.

Các vùng:

- Header: tên project, nút chọn thành viên, search global, trạng thái repo index mới/cũ.
- Sidebar: `Dashboard`, `Rubric`, `Roles`, `Flows`, `Code Map`, `Tests`, `Theory`, `Interview`, `Progress`.
- Main: 3 thẻ học đề xuất hôm nay, rubric progress, red zone, recent mistakes.
- Right panel: câu hỏi vấn đáp nhanh, file sống còn, nút bắt đầu mock interview.

Không đặt hero marketing. Không có đoạn giới thiệu dài. Nội dung đầu tiên phải là dữ liệu học thật.

### 14.2 Role Explorer

Mục tiêu: học theo góc nhìn Seller/Bidder/Admin.

UI:

- Segmented control 3 role: `Seller`, `Bidder`, `Admin`.
- Mỗi role có timeline nghiệp vụ: login -> action chính -> event/result.
- Bảng `UI -> Controller -> ClientService -> MessageType -> Handler -> Service -> DAO`.
- Panel "Giảng viên hỏi role này": câu hỏi và đáp án mẫu.
- Nút `Chạy demo thủ công` mở checklist từng bước.

### 14.3 Flow Visualizer

Mục tiêu: hiểu server/client hoạt động ra sao khi một chức năng chạy.

UI:

- Swimlane dạng dọc: User, JavaFX Controller, SocketClient, ClientHandler/Router, Service, DAO/DB, Notification.
- Mỗi step có mã màu theo layer.
- Click step mở drawer: code snippet, giải thích, lý thuyết, lỗi thường gặp.
- Có toggle `normal path`, `error path`, `concurrency path`.
- Có nút `Tự kể lại luồng này` để mở prompt vấn đáp.

### 14.4 Code Map

Mục tiêu: học từng file mà không ngợp.

UI:

- Cây thư mục bên trái, filter theo module/kind/risk.
- Vùng giữa: file summary, dependency graph nhỏ, outline class/method.
- Vùng phải: câu hỏi vấn đáp, test liên quan, flow liên quan.
- Mode học:
  - `Overview`: file làm gì.
  - `Block by block`: giải thích theo method/khối.
  - `Line focus`: dòng quan trọng.
  - `Ask me`: quiz theo file.

Quy tắc trình bày code:

- Không hiện quá 80-120 dòng một lúc.
- Getter/setter/import được collapse mặc định.
- Method dài như `BidService.placeBid` chia thành các phase: rate limit, fetch, validate, wallet, update, anti-sniping, persist, notify, auto-bid.

### 14.5 Theory Library

Mục tiêu: lý thuyết gắn trực tiếp với code.

UI:

- Card theo chủ đề, mỗi card có nhãn `OOP`, `Network`, `Concurrency`, `Database`, `Testing`, `JavaFX`.
- Mỗi card có "Trong project này" trỏ tới file/method.
- Có quiz 3 câu nhanh cuối card.
- Có link học thêm mở tab mới.

### 14.6 Test Lab

Mục tiêu: thành viên hiểu test case hoạt động ra sao và tự viết thêm được.

UI:

- Tab `Unit`, `Integration`, `Manual`, `CI`.
- Mỗi test có visual Arrange/Act/Assert.
- Có mapping test -> requirement -> file.
- Có command runner note: `mvn test`, `mvn -pl server test`, `mvn verify`.
- Có "failure story": nếu test fail thì có thể do service, DAO, transaction, mock setup hay timing.

### 14.7 Interview Simulator

Mục tiêu: luyện nói như lúc bảo vệ.

UI:

- Chọn chế độ: theo role, theo file, theo luồng, random trap questions.
- Mỗi câu có timer 60-120 giây.
- Rubric chấm: đúng khái niệm, chỉ được file, kể được flow, nêu được test, nêu được lỗi nếu thiếu.
- Sau session có báo cáo: câu sai, file yếu, lý thuyết cần đọc lại.

## 15. Theory Coverage Map cho toàn bộ project

Web phải có một khu `Theory Coverage Map` bao phủ toàn bộ lý thuyết dùng trong `D:\Code\java\online-auction-system`, không chỉ concurrency và scheduler. Mỗi chủ đề phải nối được tới file thật, luồng thật, test thật và câu hỏi vấn đáp thật.

### 15.1 Client-Server Architecture

Nội dung cần học:

- Client JavaFX chỉ hiển thị UI, nhận input, gửi request.
- Server giữ business logic, database, session, permission, settlement.
- `common` chứa hợp đồng chung để client và server hiểu cùng model/DTO/protocol.
- Chỉ server truy cập SQLite để tránh client sửa dữ liệu trực tiếp.

File cần gắn:

- `client/src/main/java/com/auction/client/ClientMain.java`
- `client/src/main/java/com/auction/client/service/*ClientService.java`
- `server/src/main/java/com/auction/server/ServerMain.java`
- `server/src/main/java/com/auction/server/socket/SocketServer.java`
- `common/src/main/java/com/auction/common/protocol/*`

Câu hỏi vấn đáp:

- Vì sao không cho JavaFX client kết nối SQLite trực tiếp?
- `common` giải quyết vấn đề gì trong kiến trúc client-server?
- Nếu đổi socket sang REST thì tầng nào thay đổi nhiều nhất?

### 15.2 TCP Socket và newline-delimited JSON

Nội dung cần học:

- Project dùng TCP socket cho nghiệp vụ chính, không dùng HTTP REST cho bid/login.
- Mỗi request/response là một dòng JSON, kết thúc bằng newline.
- `ClientHandler` dùng `readLine()`, nên pretty JSON nhiều dòng sẽ làm hỏng protocol.
- Client tạo `requestId`; server trả cùng `requestId`; `SocketClient` dùng map pending future để khớp response.
- Realtime event là server push, có `requestId` dạng event hoặc null.

File cần gắn:

- `common/protocol/Request.java`
- `common/protocol/Response.java`
- `common/protocol/MessageType.java`
- `client/socket/SocketClient.java`
- `server/socket/ClientHandler.java`
- `server/socket/RequestRouter.java`
- `docs/protocol.md`

Demo cần có:

- Gửi login request, xem JSON request/response.
- Subscribe auction, place bid, thấy `BID_UPDATE` không cần refresh.

### 15.3 HTTP asset server

Nội dung cần học:

- Project vẫn có HTTP nhưng chỉ cho static assets, cụ thể là ảnh sản phẩm.
- `AssetServer` dùng `com.sun.net.httpserver.HttpServer`.
- Có `StaticFileHandler` đọc file từ thư mục upload và trả content type.
- Có check chống directory traversal bằng `..` và canonical path.
- Đây không phải REST API nghiệp vụ.

File cần gắn:

- `server/socket/AssetServer.java`
- `server/util/ImageUtil.java`
- `client/util/FileUtil.java`
- `client/util/ImageUrlUtil.java`
- `server/resources/application.properties`

Câu hỏi vấn đáp:

- Socket và HTTP trong project khác nhiệm vụ thế nào?
- Vì sao ảnh không gửi qua socket mỗi lần hiển thị?
- Vì sao cần chống đường dẫn `..`?

### 15.4 MVC JavaFX, FXML và UI state

Nội dung cần học:

- FXML mô tả layout; Controller xử lý event UI; ClientService gửi request.
- `SceneManager` quản lý chuyển màn và current user state.
- Không nhét business logic server vào controller.
- CSS tách style khỏi logic.
- JavaFX UI chỉ được update trên JavaFX Application Thread.

File cần gắn:

- `client/resources/fxml/*.fxml`
- `client/controller/*Controller.java`
- `client/service/*ClientService.java`
- `client/util/SceneManager.java`
- `client/resources/css/*.css`

Câu hỏi vấn đáp:

- MVC trong JavaFX của nhóm thể hiện ở đâu?
- Vì sao controller không gọi DAO trực tiếp?
- Vì sao phải dùng FXML thay vì code UI thuần Java?

### 15.5 DTO, protocol và serialization/deserialization

Nội dung cần học:

- DTO là object vận chuyển dữ liệu qua network, tách khỏi entity/domain.
- `Request<T>` và `Response<T>` là wrapper protocol.
- `MessageType` là enum định tuyến nghiệp vụ.
- Gson serialize/deserialize object sang JSON.
- `JsonMapper` có adapter cho `LocalDateTime`.
- Record DTO giúp dữ liệu request/response ngắn, immutable-ish, dễ test.
- Có legacy message types `CREATE_ITEM`, `UPDATE_ITEM`, `DELETE_ITEM` để tương thích/đặt chỗ, nhưng hiện không route nghiệp vụ; web phải giải thích rõ để thành viên không demo nhầm item CRUD độc lập.

File cần gắn:

- `common/dto/**`
- `common/protocol/**`
- `client/util/JsonMapper.java`
- `server/util/JsonMapper.java`
- `server/socket/*RequestHandler.java`

Câu hỏi vấn đáp:

- DTO khác Entity như thế nào?
- Vì sao không gửi thẳng `Auction` entity cho mọi API?
- `MessageType` giúp router hoạt động thế nào?

### 15.6 Layered backend: Handler, Service, DAO

Nội dung cần học:

- Handler nhận request socket và đổi payload sang DTO.
- Service xử lý nghiệp vụ, validate, transaction, gọi DAO.
- DAO chỉ biết SQL/JDBC, không quyết định business rule.
- Exception nghiệp vụ được ném từ service và đổi thành response fail.

File cần gắn:

- `server/socket/*RequestHandler.java`
- `server/service/*.java`
- `server/dao/*.java`
- `server/dao/sqlite/*.java`
- `server/exception/*.java`

Câu hỏi vấn đáp:

- Nếu viết SQL trong controller/handler thì có vấn đề gì?
- Service khác DAO ở đâu?
- Vì sao validation giá bid nằm ở `BidService` chứ không nằm trong client?

### 15.7 DAO, JDBC, SQLite schema và SQL mapping

Nội dung cần học:

- DAO interface giúp service không phụ thuộc trực tiếp SQLite implementation.
- SQLite implementation dùng JDBC `Connection`, `PreparedStatement`, `ResultSet`.
- Schema định nghĩa bảng `users`, `items`, `auctions`, `bids`, `auto_bids`.
- Mapping DB row -> model/record phải đúng kiểu dữ liệu: BigDecimal, LocalDateTime, enum.
- `Optional` biểu diễn "có thể không tìm thấy".
- Foreign key bảo vệ quan hệ user-item-auction-bid; `ON DELETE CASCADE` hoặc `SET NULL` phải giải thích bằng ví dụ.
- Index như `idx_auctions_status`, `idx_bids_auction_id`, `idx_auto_bids_auction_id` giúp truy vấn danh sách/status/history nhanh hơn.
- `items.deleted` là soft delete flag, cần giải thích khác gì xóa record khỏi DB.
- `auctions.version` là nền cho optimistic locking/phiên bản hóa, dù luồng chính còn dựa nhiều vào lock + transaction.
- Các cột `settlement_attempts`, `settlement_last_error`, `settlement_next_retry_at` phục vụ retry settlement.

File cần gắn:

- `server/dao/Database.java`
- `server/dao/SchemaInitializer.java`
- `server/resources/db/schema.sql`
- `server/resources/db/seed.sql`
- `server/dao/sqlite/SQLiteUserDao.java`
- `server/dao/sqlite/SQLiteItemDao.java`
- `server/dao/sqlite/SQLiteAuctionDao.java`
- `server/dao/sqlite/SQLiteBidDao.java`
- `server/dao/sqlite/SQLiteAutoBidDao.java`

Test cần gắn:

- `SQLiteUserDaoTest`
- `SQLiteItemDaoTest`
- `SQLiteAuctionDaoTest`
- `SQLiteBidDaoTest`

### 15.8 Transaction, ACID, rollback và consistency

Nội dung cần học:

- Một bid hợp lệ không chỉ update price; còn lock/release ví, insert bid history, update highest bidder.
- Nếu một bước fail, toàn bộ phải rollback để không sai tiền.
- `Database.runInTransaction` gom các thao tác SQL thành một transaction.
- Transaction bảo vệ consistency, còn lock bảo vệ thứ tự xử lý giữa threads.

File cần gắn:

- `server/dao/Database.java`
- `server/service/BidService.java`
- `server/service/WalletService.java`
- `server/service/AuctionManagerService.java`
- `server/test/.../BidServiceTransactionTest.java`
- `server/test/.../AuctionSettlementTest.java`

Câu hỏi vấn đáp:

- Transaction có thay thế lock không?
- Nếu lock tiền xong nhưng insert bid fail thì điều gì phải xảy ra?
- Vì sao wallet settlement phải trong transaction?

### 15.9 Authentication, authorization và session token

Nội dung cần học:

- Authentication: xác minh username/password.
- Authorization: user đã đăng nhập có quyền làm hành động không.
- BCrypt hash password, không lưu password plain text.
- `SessionManager` tạo token và map token -> userId.
- `RequestRouter`/handler dùng token để biết user nào đang gọi.
- Role `BIDDER`, `SELLER`, `ADMIN` quyết định quyền.

File cần gắn:

- `server/service/AuthService.java`
- `server/service/SessionManager.java`
- `server/socket/AuthRequestHandler.java`
- `server/socket/RequestRouter.java`
- `common/enums/Role.java`
- `common/dto/auth/*`
- `server/test/.../AuthServiceTest.java`
- `server/test/.../RequestRouterAuthorizationTest.java`

### 15.10 OOP principles

Nội dung cần học:

- Encapsulation: field private/protected, getter/setter kiểm soát dữ liệu.
- Abstraction: `Entity`, `Item`, `User` là abstract base.
- Inheritance: `Bidder/Seller/Admin`, `Electronics/Art/Vehicle`.
- Polymorphism: override `displayName`, `categoryDescription`, behavior theo subclass.
- Enum state: `AuctionStatus`, `Role`, `ItemType`.

File cần gắn:

- `common/model/Entity.java`
- `common/model/User.java`
- `common/model/Bidder.java`
- `common/model/Seller.java`
- `common/model/Admin.java`
- `common/model/Item.java`
- `common/model/Electronics.java`
- `common/model/Art.java`
- `common/model/Vehicle.java`
- `common/model/Auction.java`
- `common/model/BidTransaction.java`
- `common/model/AutoBidRule.java`

### 15.11 Design patterns

Nội dung cần học:

- Singleton: `Database`, `SessionManager`, `NotificationService`, `SocketClient`, `AppProperties`.
- Factory Method: `ItemFactory` tạo item theo `ItemType`.
- Observer: `NotificationService` quản lý subscribers và broadcast event.
- DAO Pattern: interface DAO + SQLite implementation.
- Front Controller/Router style: `RequestRouter` phân tuyến message type.
- Facade/proxy nhẹ ở client service: `AuthClientService`, `AuctionClientService`, `WalletClientService`, `AdminClientService`.

File cần gắn:

- `server/factory/ItemFactory.java`
- `server/service/NotificationService.java`
- `server/dao/*.java`
- `server/socket/RequestRouter.java`
- `client/socket/SocketClient.java`
- `client/service/*.java`

### 15.12 Concurrency module

Phải giải thích bằng ví dụ cụ thể:

- Nếu không lock: hai bidder cùng đọc `currentPrice = 100`, cả hai đều thấy hợp lệ, cả hai ghi kết quả, gây lost update.
- Với lock theo `auctionId`: chỉ một thread xử lý một auction tại một thời điểm, nhưng auction khác vẫn chạy song song.
- Với transaction: nếu lock tiền thành công nhưng update auction fail thì rollback để ví không bị sai.
- Với `ConcurrentHashMap`: map shared giữa threads an toàn hơn `HashMap` thường trong các cấu trúc như pending request/subscription/last bid time.
- Với rate limit: `lastBidTimes` chống user spam bid quá nhanh.

Screen cần có:

- Animation timeline 2 bidder gửi bid cùng lúc.
- So sánh `without lock` vs `with auction lock`.
- Code spotlight: `AuctionLockManager`, `LockRegistry`, `BidService.placeBid`, `BidServiceConcurrencyTest`, `ConcurrentBidTest`.
- Câu hỏi vấn đáp: "Lock theo auction khác gì synchronized toàn method?", "Transaction có thay thế lock không?", "SQLite có đủ để chống race không?".

### 15.13 Scheduler module

Phải giải thích `AuctionManagerService` như một background worker:

- Dùng `ScheduledExecutorService`.
- Chạy `checkStatuses` định kỳ 5 giây.
- Quét auction và chuyển trạng thái theo thời gian.
- Khi `FINISHED`, quyết định `PAID` hay `CANCELED`.
- Nếu `PAID`, gọi `WalletService.settleAuction`.
- Nếu settlement lỗi, retry theo backoff `5, 15, 60, 300, 900` giây.
- Broadcast `AUCTION_CLOSED` và `AUCTION_LIST_UPDATED`.

Screen cần có:

- Timeline trạng thái `OPEN -> RUNNING -> FINISHED -> PAID/CANCELED`.
- Bảng điều kiện chuyển trạng thái.
- Panel "server đang làm gì dù client không bấm gì".
- Manual demo: tạo auction thời gian ngắn, đợi scheduler close, quan sát UI/event/log.

### 15.14 Realtime notification và event-driven UI

Nội dung cần học:

- Client subscribe vào auction room.
- Server giữ danh sách writer theo auction/user.
- Khi có bid/status/admin event, server push response event xuống client.
- Client phân biệt response thường và event qua `requestId`.
- JavaFX listener update UI bằng `Platform.runLater`.
- Không polling liên tục, tiết kiệm request và realtime hơn.
- `ConnectionState` trên client có `DISCONNECTED`, `CONNECTING`, `CONNECTED`, `RECONNECTING`; hiện code chưa tự retry reconnect/silent re-auth, nên demo phải nói đúng giới hạn.
- Khi disconnect, server cleanup subscription/user connection; client fail pending requests và clear token.

File cần gắn:

- `server/service/NotificationService.java`
- `server/socket/SubscriptionRequestHandler.java`
- `client/socket/SocketClient.java`
- `client/controller/LiveBiddingController.java`
- `client/util/NotificationManager.java`
- `client/util/BidTimeline.java`
- `client/util/PriceChartManager.java`
- `docs/architecture/state-management.md`

### 15.15 Business rules: auction lifecycle, bidding, wallet

Nội dung cần học:

- Auction lifecycle: `OPEN -> RUNNING -> FINISHED -> PAID/CANCELED`.
- Bid thường: giá phải hợp lệ, auction running, bidder không phải seller, đủ tiền.
- Auto-bid: max bid, increment, chọn rule thắng, không vượt max.
- Anti-sniping: bid trong cửa sổ cuối thì extend end time.
- Wallet: balance, locked balance, release funds, settlement.
- Reserve price: không đạt thì cancel/refund.
- Dashboard: `GET_DASHBOARD` dùng cho số dư/thông tin tổng quan theo user.
- Seller stats: `GET_SELLER_STATS` giúp seller hiểu doanh thu/lượt bid/phiên đang quản lý.
- My bids và user bid history trả trạng thái `WINNING`, `OUTBID`, `WON`, `LOST`, `WON_PENDING_PAYMENT`, `CANCELED`.

File cần gắn:

- `server/service/AuctionService.java`
- `server/service/BidService.java`
- `server/service/WalletService.java`
- `server/service/AuctionManagerService.java`
- `server/socket/WalletRequestHandler.java`
- `server/socket/AuctionRequestHandler.java`
- `common/model/Auction.java`
- `common/model/AutoBidRule.java`
- `common/model/BidTransaction.java`
- `common/dto/dashboard/DashboardDto.java`
- `common/dto/dashboard/SellerStatsDto.java`
- `common/dto/bid/BidHistoryDto.java`

### 15.16 Exception handling và validation

Nội dung cần học:

- Custom exception giúp phân biệt lỗi nghiệp vụ.
- `BusinessException` là base class lỗi có thể trả cho client.
- Validation quan trọng luôn ở server; client validation chỉ giúp UX.
- Client hiển thị lỗi bằng toast/dialog, không crash app.

File cần gắn:

- `server/exception/*.java`
- `server/socket/RequestRouter.java`
- `server/service/*.java`
- `client/util/GlobalExceptionHandler.java`
- `client/util/NotificationManager.java`

### 15.17 Java collections, generics, records và time/money types

Nội dung cần học:

- `Map`, `List`, `Optional`, `ConcurrentHashMap`, `CopyOnWriteArrayList`.
- Generic `Request<T>`, `Response<T>`, `CompletableFuture<Response<R>>`.
- Java record cho DTO immutable-style.
- `BigDecimal` cho tiền, tránh lỗi số thực.
- `LocalDateTime` cho thời gian auction và bid.

File cần gắn:

- `common/protocol/Request.java`
- `common/protocol/Response.java`
- `common/dto/**/*.java`
- `server/service/BidService.java`
- `client/socket/SocketClient.java`

### 15.18 Maven multi-module, dependency, plugin, build lifecycle

Nội dung cần học:

- Root POM là parent aggregator, packaging `pom`.
- Module `common`, `server`, `client`.
- `dependencyManagement` giữ version chung.
- Module POM khai báo thư viện thực sự dùng.
- `exec-maven-plugin` chạy server.
- `javafx-maven-plugin` chạy client.
- `maven-shade-plugin` đóng gói server runnable jar.
- `maven-surefire-plugin` chạy JUnit.
- `maven-checkstyle-plugin` enforce style ở phase `verify`.

File cần gắn:

- `pom.xml`
- `common/pom.xml`
- `server/pom.xml`
- `client/pom.xml`
- `.github/workflows/maven.yml`

### 15.19 Testing strategy

Nội dung cần học:

- Unit test: service logic, mock DAO bằng Mockito.
- Integration test: DAO với SQLite thật, socket thật/fake server.
- Concurrency test: `ExecutorService`, `CountDownLatch`, nhiều thread cùng bid.
- Client utility test: format/status/timeline.
- Manual E2E: server + nhiều client.
- CI/CD: GitHub Actions chạy build/test tự động.

File cần gắn:

- `server/src/test/java/**`
- `client/src/test/java/**`
- `common/src/test/java/**`
- `docs/testing.md`

### 15.20 Logging, configuration và deployment

Nội dung cần học:

- SLF4J là API logging; Logback là implementation.
- `logback.xml` cấu hình output log.
- `application.properties` cấu hình port, DB URL, asset dir, WAL.
- `AppProperties` đọc config cho server.
- Shade plugin đóng gói server jar.
- JavaFX plugin chạy client.
- Troubleshooting căn bản: connection refused, database locked, JavaFX graphics error, image not found.

File cần gắn:

- `server/resources/logback.xml`
- `client/resources/logback.xml`
- `server/resources/application.properties`
- `server/config/AppProperties.java`
- `server/pom.xml`
- `client/pom.xml`
- `docs/troubleshooting.md`
- `docs/deployment.md`
- `docs/setup.md`

### 15.20.1 Git workflow và evidence of contribution

Nội dung cần học:

- Đề bài yêu cầu commit thường xuyên; không chấp nhận một commit cuối.
- Branch `main`, `dev`, `feature/*` thể hiện cách nhóm cộng tác.
- Conventional commits giúp nhìn lịch sử rõ: `feat`, `fix`, `docs`, `refactor`, `test`.
- Pull request/code review là bằng chứng nhóm hiểu và kiểm tra chéo code.
- Web nên hiển thị checklist "mỗi thành viên có commit/module/demo/mock-pass nào".

File cần gắn:

- `docs/git-workflow.md`
- `.github/workflows/maven.yml`
- `README.md`
- `docs/onboarding.md`
- `docs/development.md`

### 15.21 Security and robustness basics

Nội dung cần học:

- Password hashing bằng BCrypt.
- Token session thay vì gửi password lại mỗi request.
- Role authorization.
- Server-side validation.
- Directory traversal prevention trong `AssetServer`.
- Không tin dữ liệu từ client.
- Cleanup subscription/writer khi disconnect.
- Fail pending request khi mất kết nối.
- Idempotency/replay protection: request trùng `requestId` không nên xử lý hai lần.
- SQLite `busy_timeout` và WAL giúp giảm lỗi lock, nhưng không thay thế transaction/lock nghiệp vụ.

File cần gắn:

- `AuthService.java`
- `SessionManager.java`
- `RequestRouter.java`
- `IdempotencyManager.java`
- `AssetServer.java`
- `SocketClient.java`
- `ClientHandler.java`
- `Database.java`
- `application.properties`

### 15.22 UI/UX implementation theory for the learning web itself

Phần này là lý thuyết của web hỗ trợ học, không phải app Java auction, nhưng cần để build đúng:

- Progressive disclosure: summary trước, chi tiết/code sau.
- Information scent: mọi card có role/file/flow/test rõ.
- Accessibility: keyboard navigation, skip link, heading hierarchy.
- Progress indicator: người học biết mình đang ở bước nào.
- Visual hierarchy: trạng thái rủi ro nổi bật hơn trang trí.
- Responsive layout: học được trên laptop và mobile.

## 16. Definition of Done cho UI học tập

Trước khi coi web đủ tốt để cả nhóm học:

- Mở dashboard trong 10 giây phải biết ngay 3 việc nên học tiếp.
- Mỗi role Seller/Bidder/Admin có path riêng và demo riêng.
- Mỗi chức năng project có ít nhất 1 flow, 1 test, 1 manual demo, 5 câu hỏi.
- Mỗi file sống còn có giải thích block-by-block và câu hỏi vấn đáp.
- Mỗi theory card có ví dụ trong project và link học thêm.
- Thành viên có thể đánh dấu `mock-passed`; leader nhìn được ai còn yếu.
- UI không dùng text hướng dẫn dài thay cho affordance: nút, tab, filter, breadcrumb phải tự rõ.
- Không có UI bị chồng chữ ở mobile.
- Tất cả form có label thật, không dùng placeholder làm label duy nhất.
- Tất cả flow/test/progress có trạng thái rõ: chưa học, đang học, cần ôn, đã pass.

## 17. Lộ trình build web

### Phase 1: Knowledge base tĩnh

Deliverable:

- Vite React app.
- Trang rubric.
- Trang file map cấp file.
- Import PDF text và docs Markdown.
- Search toàn bộ tài liệu.

Done khi:

- Người dùng mở web, tìm `BidService`, thấy giải thích file, luồng liên quan, test liên quan.
- Dashboard đã có learning cockpit và red zone.

### Phase 2: Flow cards và manual scripts

Deliverable:

- Flow Visualizer cho 15 luồng chính.
- Manual test scripts có checklist.
- Request/Response examples từ `docs/protocol.md`.
- Role paths cho Seller/Bidder/Admin.

Done khi:

- Một thành viên có thể bấm theo kịch bản login, bid, auto-bid, anti-sniping và biết server/client đang chạy gì.

### Phase 3: File-by-file deep learning

Deliverable:

- Parser Java tạo outline: class, field, constructor, method, branch comment.
- Giải thích block-level cho toàn bộ file.
- Line-by-line cho file rủi ro cao.

Done khi:

- `BidService.java`, `SocketClient.java`, `ClientHandler.java`, `RequestRouter.java`, `Database.java`, `AuctionManagerService.java` có giải thích từng block/dòng quan trọng.

### Phase 4: Interview simulator

Deliverable:

- Bộ câu hỏi theo chủ đề/file/luồng.
- Chấm điểm tự đánh giá.
- Follow-up questions.
- Session mock interview 15-30 phút.
- Câu hỏi theo role Seller/Bidder/Admin và trap questions cho concurrency/scheduler.

Done khi:

- Mỗi member có thể chạy mock interview và lưu điểm/yếu điểm.

### Phase 5: Progress và team readiness

Deliverable:

- Profile từng thành viên.
- Ma trận file x member.
- Báo cáo "ai chưa giải thích được file nào".
- Xuất checklist trước ngày bảo vệ.

Done khi:

- Leader nhìn dashboard biết rủi ro 0 điểm đang nằm ở thành viên/file/luồng nào.

## 18. Quy trình học đề xuất cho nhóm

Mỗi ngày học theo vòng 60-90 phút:

1. 10 phút: đọc rubric và mục tiêu buổi học.
2. 20 phút: học 1 luồng bằng Flow Visualizer.
3. 20 phút: mở các file liên quan và giải thích lại bằng lời.
4. 15 phút: chạy manual test hoặc đọc automated test.
5. 15 phút: mock interview ngắn.
6. 5 phút: cập nhật progress và weak points.

Phân công tối thiểu:

- Member A: server socket, protocol, auth.
- Member B: bidding, auto-bid, concurrency, wallet.
- Member C: JavaFX client, realtime UI, chart.
- Member D nếu có: database, Maven, tests, CI/CD.

Nhưng mọi người vẫn phải học chéo toàn bộ file "sống còn".

## 19. Tiêu chí hoàn thành web

Web được xem là đủ dùng khi:

- Có mapping từ từng yêu cầu trong đề sang code/test/demo.
- Có danh sách toàn bộ file chính và giải thích mục đích.
- Có ít nhất 15 flow cards.
- Có visualize components cho các cơ chế khó: swimlane, sequence player, state machine, ERD, concurrency timeline, socket inspector, Maven graph, test flow, role journey, failure replay.
- Có ít nhất 100 câu hỏi vấn đáp có đáp án.
- Có manual test scripts cho login, bid, auto-bid, anti-sniping, realtime, settlement, admin.
- Có hướng dẫn Maven và cách tạo test mới.
- Có progress matrix cho từng thành viên.
- Có export "bảng ôn trước bảo vệ" dạng Markdown hoặc PDF.
- Có UI kiểm được bằng Playwright/screenshot ở desktop và mobile.

## 20. Rủi ro và cách giảm

- Rủi ro: cố giải thích từng dòng mọi file ngay từ đầu, quá tải.
  - Giảm: ưu tiên file sống còn line-by-line, file còn lại block-level trước.
- Rủi ro: web đẹp nhưng không giúp trả lời vấn đáp.
  - Giảm: mọi trang phải có câu hỏi vấn đáp và file liên quan.
- Rủi ro: câu trả lời học thuộc, không chỉ được code.
  - Giảm: mỗi đáp án phải có `relatedFiles` và method/dòng quan trọng.
- Rủi ro: repo thay đổi, tài liệu lệch.
  - Giảm: script index chạy lại được.
- Rủi ro: member chỉ học module mình làm.
  - Giảm: dashboard bắt buộc `mock-passed` cho file sống còn với tất cả member.
- Rủi ro: UX đẹp nhưng nhiều chữ, không học nổi.
  - Giảm: mọi trang dùng progressive disclosure: summary trước, chi tiết/code/test mở sau.
- Rủi ro: role path thiếu chức năng.
  - Giảm: Function Coverage Matrix là checklist bắt buộc trước khi release.

## 21. MVP đầu tiên nên làm ngay

MVP 1 nên gồm:

1. Scaffold web Bun + Vite + React.
2. Script index repo tạo `data/generated/files.json`.
3. Nhập nội dung đề PDF và `docs/*.md`.
4. Trang `Rubric`.
5. Trang `Code Map`.
6. Trang `Flows` với 5 luồng đầu: login, create auction, place bid, realtime update, auto-bid.
7. Trang `Roles` cho Seller/Bidder/Admin.
8. Trang `Theory` với link học thêm.
9. Trang `Interview` với 50 câu hỏi đầu.
10. Visualize MVP: swimlane cho `PLACE_BID`, state machine cho `AuctionStatus`, ERD cho 5 bảng chính, socket inspector cho request/response mẫu.

Sau MVP này, nhóm đã có công cụ học thật sự và có thể mở rộng dần sang line-by-line và progress tracking.
