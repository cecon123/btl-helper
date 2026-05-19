export type PageKey =
  | "dashboard"
  | "roles"
  | "flows"
  | "code"
  | "theory"
  | "tests"
  | "interview";

export type RoleKey = "Bidder" | "Seller" | "Admin";

export type StudyStatus = "done" | "review" | "risk";

export type StudyTopic = {
  id: string;
  title: string;
  category: string;
  level: "Core" | "Advanced" | "Defense";
  summary: string;
  projectExample: string;
  files: string[];
  links: { label: string; url: string }[];
  status: StudyStatus;
};

export type CriticalFile = {
  path: string;
  layer: string;
  purpose: string;
  explain: string[];
  linkedTheory: string[];
  tests: string[];
  risk: "Low" | "Medium" | "High";
};

export type RolePath = {
  role: RoleKey;
  goal: string;
  permissions: string[];
  mustKnow: string[];
  journey: { step: string; client: string; server: string; data: string }[];
};

export type FlowStep = {
  id: string;
  title: string;
  lane: "Client" | "Socket" | "Service" | "DAO" | "Realtime";
  detail: string;
  file: string;
};

export type ScenarioFlow = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  steps: {
    id: string;
    order: number;
    module: "common" | "server" | "client";
    badge: string;
    title: string;
    summary: string;
    path: string;
    meaning: string;
    codeNotes: { line: number; code: string; note: string }[];
    links: string[];
  }[];
};

const scenarioTemplates = {
  register: [
    ["client", "FXML", "RegisterView.fxml", "Form chọn Bidder/Seller, nhập full name, username, password và confirm password.", "client/src/main/resources/fxml/RegisterView.fxml"],
    ["client", "CLIENT", "RegisterController.java", "Validate form, so khớp password, tạo RegisterRequest và gọi AuthClientService.", "client/src/main/java/com/auction/client/controller/RegisterController.java"],
    ["common", "DTO", "RegisterRequest.java / RegisterResponse.java", "Payload chung để client và server hiểu cùng contract đăng ký.", "common/src/main/java/com/auction/common/dto/auth/RegisterRequest.java"],
    ["server", "SERVER", "AuthRequestHandler.java -> AuthService.java", "Server hash password, kiểm username trùng, tạo user theo role.", "server/src/main/java/com/auction/server/socket/AuthRequestHandler.java"],
    ["server", "DAO", "SQLiteUserDao.java", "Insert user vào bảng users và map UserRecord khi đọc lại.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteUserDao.java"],
  ],
  logout: [
    ["client", "UI", "Sidebar/TopBar/AppShell", "User bấm logout hoặc disconnected banner yêu cầu logout.", "client/src/main/java/com/auction/client/controller/AppShellController.java"],
    ["client", "CLIENT", "AuthClientService.java", "Gửi LOGOUT request kèm token hiện tại.", "client/src/main/java/com/auction/client/service/AuthClientService.java"],
    ["server", "SERVER", "AuthRequestHandler.java", "Nhận LOGOUT và gọi SessionManager invalidate token.", "server/src/main/java/com/auction/server/socket/AuthRequestHandler.java"],
    ["server", "SESSION", "SessionManager.java", "Xóa token để các request sau bị Unauthorized.", "server/src/main/java/com/auction/server/service/SessionManager.java"],
  ],
  auctionList: [
    ["client", "UI", "AuctionListView.fxml", "Màn danh sách auction có card/filter/refresh để bidder duyệt phiên.", "client/src/main/resources/fxml/AuctionListView.fxml"],
    ["client", "CLIENT", "AuctionListController.java", "Load list, render cards, điều hướng detail.", "client/src/main/java/com/auction/client/controller/AuctionListController.java"],
    ["client", "SERVICE", "AuctionClientService.java", "Gửi GET_AUCTIONS hoặc GET_DASHBOARD qua SocketClient.", "client/src/main/java/com/auction/client/service/AuctionClientService.java"],
    ["server", "HANDLER", "AuctionRequestHandler.java", "Route request auction list/detail/dashboard tới AuctionService/Wallet handler.", "server/src/main/java/com/auction/server/socket/AuctionRequestHandler.java"],
    ["server", "DAO", "SQLiteAuctionDao.java", "Query auctions kèm status/time/seller/item để tạo AuctionSummaryDto.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteAuctionDao.java"],
  ],
  auctionDetail: [
    ["client", "FXML", "AuctionDetailView.fxml", "Hiển thị ảnh, status, giá hiện tại, seller, end time và bid history.", "client/src/main/resources/fxml/AuctionDetailView.fxml"],
    ["client", "CONTROLLER", "AuctionDetailController.java", "Load AuctionDetailDto, render status badge, mở bid dialog/live bidding.", "client/src/main/java/com/auction/client/controller/AuctionDetailController.java"],
    ["client", "UTIL", "ImageUrlUtil.java / BidTimeline.java", "Chuẩn hóa URL ảnh và biến bid history thành timeline/chart points.", "client/src/main/java/com/auction/client/util/BidTimeline.java"],
    ["server", "SERVICE", "AuctionService.java", "Đọc auction detail, bid history và business status.", "server/src/main/java/com/auction/server/service/AuctionService.java"],
  ],
  sellerCreate: [
    ["client", "FXML", "CreateAuctionView.fxml", "Form seller nhập item, category, price, time, image.", "client/src/main/resources/fxml/CreateAuctionView.fxml"],
    ["client", "CONTROLLER", "CreateAuctionController.java", "Validate form, chọn ảnh, tạo CreateAuctionRequest.", "client/src/main/java/com/auction/client/controller/CreateAuctionController.java"],
    ["common", "DTO", "CreateAuctionRequest.java", "Contract chứa thông tin item + auction gửi từ client sang server.", "common/src/main/java/com/auction/common/dto/auction/CreateAuctionRequest.java"],
    ["server", "FACTORY", "ItemFactory.java", "Factory tạo Electronics/Art/Vehicle theo ItemType.", "server/src/main/java/com/auction/server/factory/ItemFactory.java"],
    ["server", "SERVICE", "AuctionService.java", "Insert item, insert auction, kiểm seller/price/time và status.", "server/src/main/java/com/auction/server/service/AuctionService.java"],
  ],
  sellerUpdateCancel: [
    ["client", "FXML", "EditAuctionView.fxml", "Seller sửa hoặc hủy auction trong điều kiện hợp lệ.", "client/src/main/resources/fxml/EditAuctionView.fxml"],
    ["client", "CONTROLLER", "EditAuctionController.java", "Load dữ liệu cũ, validate thay đổi, gửi UPDATE/CANCEL_AUCTION.", "client/src/main/java/com/auction/client/controller/EditAuctionController.java"],
    ["server", "HANDLER", "AuctionRequestHandler.java", "Kiểm seller token và route update/cancel.", "server/src/main/java/com/auction/server/socket/AuctionRequestHandler.java"],
    ["server", "RULE", "AuctionService.java", "Kiểm owner/status/bid count trước khi cho update/cancel.", "server/src/main/java/com/auction/server/service/AuctionService.java"],
    ["server", "EVENT", "NotificationService.java", "Push AUCTION_LIST_UPDATED hoặc AUCTION_CANCELED nếu cần.", "server/src/main/java/com/auction/server/service/NotificationService.java"],
  ],
  sellerCenter: [
    ["client", "FXML", "SellerCenterView.fxml", "Trang seller có KPI, revenue, success rate và danh sách auction của seller.", "client/src/main/resources/fxml/SellerCenterView.fxml"],
    ["client", "CONTROLLER", "SellerCenterController.java", "Gọi refresh seller auctions/stats và render rows/actions.", "client/src/main/java/com/auction/client/controller/SellerCenterController.java"],
    ["common", "DTO", "SellerStatsDto.java", "DTO tổng hợp metric seller gửi về UI.", "common/src/main/java/com/auction/common/dto/dashboard/SellerStatsDto.java"],
    ["server", "SERVICE", "AuctionService.java", "Aggregate auctions, bid count, revenue và status cho seller.", "server/src/main/java/com/auction/server/service/AuctionService.java"],
  ],
  wallet: [
    ["client", "FXML", "WalletView.fxml", "Màn ví có total, available, locked escrow, quick deposit và custom amount.", "client/src/main/resources/fxml/WalletView.fxml"],
    ["client", "CONTROLLER", "WalletController.java", "Parse amount, validate positive, chặn withdraw vượt available ở UI.", "client/src/main/java/com/auction/client/controller/WalletController.java"],
    ["client", "SERVICE", "WalletClientService.java", "Gửi DEPOSIT/WITHDRAW/GET_DASHBOARD qua socket.", "client/src/main/java/com/auction/client/service/WalletClientService.java"],
    ["server", "HANDLER", "WalletRequestHandler.java", "Lấy user từ session và gọi WalletService.", "server/src/main/java/com/auction/server/socket/WalletRequestHandler.java"],
    ["server", "SERVICE", "WalletService.java", "Cập nhật balance/lockedBalance, kiểm insufficient funds.", "server/src/main/java/com/auction/server/service/WalletService.java"],
  ],
  settlement: [
    ["server", "SERVICE", "BidService.java", "Khi bid thành công, tiền được lock/giữ để bảo đảm bidder có khả năng thanh toán.", "server/src/main/java/com/auction/server/service/BidService.java"],
    ["server", "SERVICE", "WalletService.java", "Release khi outbid, transfer seller khi winner thắng sau close.", "server/src/main/java/com/auction/server/service/WalletService.java"],
    ["server", "SCHEDULER", "AuctionManagerService.java", "Đóng auction đến hạn và gọi settlement retry-safe.", "server/src/main/java/com/auction/server/service/AuctionManagerService.java"],
    ["server", "TEST", "AuctionSettlementTest.java / WalletServiceTest.java", "Test chứng minh settlement đúng và lỗi rollback/retry.", "server/src/test/java/com/auction/server/service/AuctionSettlementTest.java"],
  ],
  autoBid: [
    ["client", "UI", "LiveBiddingController.java", "Bidder nhập max bid/increment và bật auto-bid.", "client/src/main/java/com/auction/client/controller/LiveBiddingController.java"],
    ["common", "DTO", "SetAutoBidRequest.java / AutoBidDto.java", "Payload cấu hình auto bid gửi qua protocol chung.", "common/src/main/java/com/auction/common/dto/bid/SetAutoBidRequest.java"],
    ["server", "DAO", "SQLiteAutoBidDao.java", "Lưu auto_bids theo auction/bidder/max_bid/increment.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteAutoBidDao.java"],
    ["server", "SERVICE", "BidService.java", "Sau bid mới, kiểm auto_bids để tạo bid phản hồi nhưng không vượt max hoặc loop.", "server/src/main/java/com/auction/server/service/BidService.java"],
  ],
  antiSniping: [
    ["server", "RULE", "BidService.java", "Khi bid trong cửa sổ cuối, kéo dài endTime theo rule anti-sniping.", "server/src/main/java/com/auction/server/service/BidService.java"],
    ["server", "DAO", "SQLiteAuctionDao.java", "Update auctions.end_time để scheduler đọc thời gian mới.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteAuctionDao.java"],
    ["server", "EVENT", "NotificationService.java", "Push TIME_EXTENDED tới client đang subscribe.", "server/src/main/java/com/auction/server/service/NotificationService.java"],
    ["client", "UI", "LiveBiddingController.java", "Client cập nhật countdown/end time sau event.", "client/src/main/java/com/auction/client/controller/LiveBiddingController.java"],
  ],
  realtime: [
    ["client", "SOCKET", "SocketClient.java", "Giữ connection, pending request map và listener event từ server.", "client/src/main/java/com/auction/client/socket/SocketClient.java"],
    ["server", "HANDLER", "SubscriptionRequestHandler.java", "SUBSCRIBE_AUCTION/UNSUBSCRIBE_AUCTION đăng ký writer theo auctionId.", "server/src/main/java/com/auction/server/socket/SubscriptionRequestHandler.java"],
    ["server", "EVENT", "NotificationService.java", "Quản lý subscribers và broadcast events.", "server/src/main/java/com/auction/server/service/NotificationService.java"],
    ["common", "DTO", "BidUpdateEvent.java / AuctionEventDto.java", "Payload event realtime cho bid update, close, time extended.", "common/src/main/java/com/auction/common/dto/bid/BidUpdateEvent.java"],
  ],
  adminUsers: [
    ["client", "FXML", "AdminPanelView.fxml", "Bảng user, status và action Enable/Disable.", "client/src/main/resources/fxml/AdminPanelView.fxml"],
    ["client", "CONTROLLER", "AdminPanelController.java", "Load users, render row, bấm action gửi update status.", "client/src/main/java/com/auction/client/controller/AdminPanelController.java"],
    ["client", "SERVICE", "AdminClientService.java", "Gửi ADMIN_GET_USERS/ADMIN_UPDATE_USER_STATUS.", "client/src/main/java/com/auction/client/service/AdminClientService.java"],
    ["server", "HANDLER", "AdminRequestHandler.java", "Kiểm role ADMIN trước khi thao tác user.", "server/src/main/java/com/auction/server/socket/AdminRequestHandler.java"],
    ["server", "DAO", "SQLiteUserDao.java", "Update active/status và query user list.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteUserDao.java"],
  ],
  adminAuctions: [
    ["client", "UI", "AdminPanelController.java", "Render auction management table và cancel action.", "client/src/main/java/com/auction/client/controller/AdminPanelController.java"],
    ["common", "DTO", "AuctionSummaryDto.java", "Dữ liệu admin xem auction list/status/current bid.", "common/src/main/java/com/auction/common/dto/auction/AuctionSummaryDto.java"],
    ["server", "HANDLER", "AdminRequestHandler.java", "ADMIN_GET_AUCTIONS/ADMIN_CANCEL_AUCTION.", "server/src/main/java/com/auction/server/socket/AdminRequestHandler.java"],
    ["server", "SERVICE", "AuctionService.java", "Cancel auction theo quyền admin và status.", "server/src/main/java/com/auction/server/service/AuctionService.java"],
    ["server", "EVENT", "NotificationService.java", "Broadcast AUCTION_CANCELED/AUCTION_LIST_UPDATED.", "server/src/main/java/com/auction/server/service/NotificationService.java"],
  ],
  images: [
    ["client", "UTIL", "FileUtil.java", "Chọn/validate file ảnh từ máy client.", "client/src/main/java/com/auction/client/util/FileUtil.java"],
    ["client", "UTIL", "ImageUrlUtil.java", "Chuẩn hóa URL ảnh để JavaFX load từ asset server.", "client/src/main/java/com/auction/client/util/ImageUrlUtil.java"],
    ["server", "SERVER", "AssetServer.java", "Phục vụ ảnh upload qua HTTP tách khỏi socket nghiệp vụ.", "server/src/main/java/com/auction/server/socket/AssetServer.java"],
    ["server", "UTIL", "ImageUtil.java", "Xử lý path/ảnh phía server.", "server/src/main/java/com/auction/server/util/ImageUtil.java"],
  ],
  errors: [
    ["server", "EXCEPTION", "BusinessException/Auth/Validation exceptions", "Exception domain hóa lỗi business/auth/validation.", "server/src/main/java/com/auction/server/exception/BusinessException.java"],
    ["server", "RESPONSE", "Response.java", "Response.ok/error đóng gói success/message/payload trả client.", "common/src/main/java/com/auction/common/protocol/Response.java"],
    ["client", "UTIL", "GlobalExceptionHandler.java", "Client bắt lỗi bất ngờ để không crash UI.", "client/src/main/java/com/auction/client/util/GlobalExceptionHandler.java"],
    ["client", "UI", "NotificationManager.java", "Hiển thị lỗi/thành công cho user.", "client/src/main/java/com/auction/client/util/NotificationManager.java"],
  ],
  database: [
    ["server", "SCHEMA", "SchemaInitializer.java", "Tạo users/items/auctions/bids/auto_bids và index.", "server/src/main/java/com/auction/server/dao/SchemaInitializer.java"],
    ["server", "SQL", "schema.sql / seed.sql", "Script schema/seed resource hỗ trợ init/demo.", "server/src/main/resources/db/schema.sql"],
    ["server", "DAO", "SQLite*Dao.java", "Map ResultSet sang model/record và thực hiện query/update.", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteAuctionDao.java"],
    ["server", "TEST", "SQLite*DaoTest.java", "Test DAO chứng minh SQL mapping đúng.", "server/src/test/java/com/auction/server/dao/sqlite/SQLiteAuctionDaoTest.java"],
  ],
  mavenCi: [
    ["common", "MAVEN", "pom.xml parent", "Quản lý Java 21, dependencyManagement và module reactor.", "pom.xml"],
    ["server", "MAVEN", "server/pom.xml", "Dependency sqlite, bcrypt, logging, shade/exec server.", "server/pom.xml"],
    ["client", "MAVEN", "client/pom.xml", "Dependency JavaFX/Ikonli/client app.", "client/pom.xml"],
    ["common", "CI", ".github/workflows/maven.yml", "GitHub Actions chạy Maven test/verify.", ".github/workflows/maven.yml"],
  ],
  disconnect: [
    ["client", "STATE", "ConnectionState.java", "Enum trạng thái socket: connected/disconnected/reconnecting.", "client/src/main/java/com/auction/client/socket/ConnectionState.java"],
    ["client", "SOCKET", "SocketClient.java", "Server close thì pending request fail, token/state dọn dẹp.", "client/src/main/java/com/auction/client/socket/SocketClient.java"],
    ["client", "UI", "AppShell.fxml / AppShellController.java", "Disconnected banner hướng user logout/login lại.", "client/src/main/resources/fxml/AppShell.fxml"],
    ["server", "HANDLER", "ClientHandler.java", "Dọn subscription/writer khi client disconnect.", "server/src/main/java/com/auction/server/socket/ClientHandler.java"],
  ],
  demoFull: [
    ["server", "START", "ServerMain.java", "Chạy server trước, init DB/socket/scheduler.", "server/src/main/java/com/auction/server/ServerMain.java"],
    ["client", "SELLER", "SellerCenter + CreateAuction", "Seller login và tạo auction có item/ảnh/time/price.", "client/src/main/java/com/auction/client/controller/CreateAuctionController.java"],
    ["client", "BIDDER", "AuctionList/Detail/Wallet", "Bidder nạp ví, mở detail, đặt bid hoặc auto-bid.", "client/src/main/java/com/auction/client/controller/AuctionDetailController.java"],
    ["server", "CLOSE", "AuctionManagerService.java", "Scheduler đóng auction và settlement ví.", "server/src/main/java/com/auction/server/service/AuctionManagerService.java"],
    ["client", "ADMIN", "AdminPanelController.java", "Admin xem user/auction và có thể cancel/disable.", "client/src/main/java/com/auction/client/controller/AdminPanelController.java"],
  ],
};

const generatedScenarioFlows: ScenarioFlow[] = Object.entries(scenarioTemplates).map(([id, rows]) => {
  const titles: Record<string, [string, string, string]> = {
    register: ["Register", "Luồng đăng ký tài khoản", "Tạo Bidder/Seller mới từ form UI đến bảng users."],
    logout: ["Logout", "Luồng logout và session invalidation", "Token bị hủy để request sau không còn hợp lệ."],
    auctionList: ["Auction list", "Luồng danh sách auction và dashboard", "Load danh sách, summary và dữ liệu trang chủ."],
    auctionDetail: ["Auction detail", "Luồng chi tiết auction và bid history", "Render detail, ảnh, status, lịch sử và chart/timeline."],
    sellerCreate: ["Seller create", "Luồng seller tạo auction", "Từ form tạo phiên đến ItemFactory và insert DB."],
    sellerUpdateCancel: ["Seller update/cancel", "Luồng seller sửa hoặc hủy auction", "Rule owner/status/bid count và event list update."],
    sellerCenter: ["Seller center", "Luồng seller center và stats", "KPI doanh thu, success rate và danh sách phiên của seller."],
    wallet: ["Wallet", "Luồng deposit/withdraw ví", "Available, locked escrow và insufficient funds."],
    settlement: ["Settlement", "Luồng escrow và settlement", "Lock fund, release khi outbid, transfer khi winner thắng."],
    autoBid: ["Auto-bid", "Luồng auto-bidding đầy đủ", "Set max bid, phản hồi tự động, tránh vượt max/loop."],
    antiSniping: ["Anti-sniping", "Luồng anti-sniping kéo dài giờ", "Bid sát giờ, extend endTime, push TIME_EXTENDED."],
    realtime: ["Realtime", "Luồng subscribe/unsubscribe realtime", "Server push event thay vì polling."],
    adminUsers: ["Admin users", "Luồng admin quản lý user", "Load user và enable/disable theo role ADMIN."],
    adminAuctions: ["Admin auctions", "Luồng admin quản lý auction", "Load/cancel auction và broadcast event."],
    images: ["Images", "Luồng upload/asset ảnh", "FileUtil, ImageUrlUtil và AssetServer HTTP."],
    errors: ["Errors", "Luồng error handling", "Exception server, Response error và notification client."],
    database: ["Database", "Luồng schema và DAO mapping", "Schema SQL, SQLite DAO và DAO tests."],
    mavenCi: ["Maven/CI", "Luồng build, test và CI", "Parent pom, module poms, surefire/checkstyle/workflow."],
    disconnect: ["Disconnect", "Luồng mất kết nối client-server", "ConnectionState, pending requests, banner và cleanup."],
    demoFull: ["Full demo", "Luồng demo end-to-end", "Server -> seller -> bidder -> scheduler -> admin."],
  };
  const [label, title, subtitle] = titles[id];
  return {
    id,
    label,
    title,
    subtitle,
    steps: rows.map(([module, badge, title, summary, path], index) => ({
      id: `${id}-${index + 1}`,
      order: index + 1,
      module: module as "common" | "server" | "client",
      badge,
      title,
      summary,
      path,
      meaning: `Mở ${path} để giải thích vai trò của bước "${title}" trong luồng ${label}.`,
      codeNotes: [
        { line: 1, code: title, note: summary },
        { line: 1, code: path, note: "Path cần mở khi vấn đáp để chỉ code/file thật." },
      ],
      links: rows
        .map((row) => row[4])
        .filter((link) => link !== path)
        .slice(0, 4),
    })),
  };
});

export type TestCase = {
  name: string;
  target: string;
  command: string;
  arrange: string;
  act: string;
  assert: string;
  viva: string;
};

export type InterviewQuestion = {
  id: string;
  level: "Cơ bản" | "Hỏi xoáy" | "Debug" | "Demo";
  topic: string;
  question: string;
  answer: string;
  followUps: string[];
};

export const repoRoot = "D:\\Code\\java\\online-auction-system";

export const readiness = [
  { subject: "Socket", score: 74, fullMark: 100 },
  { subject: "Service", score: 68, fullMark: 100 },
  { subject: "DAO", score: 61, fullMark: 100 },
  { subject: "Concurrency", score: 46, fullMark: 100 },
  { subject: "JavaFX", score: 59, fullMark: 100 },
  { subject: "Tests", score: 72, fullMark: 100 },
];

export const milestones = [
  { label: "Hiểu kiến trúc", value: 78, color: "#4F46E5" },
  { label: "Demo thủ công", value: 54, color: "#0EA5E9" },
  { label: "Giải thích test", value: 67, color: "#22C55E" },
  { label: "Hỏi xoáy", value: 38, color: "#F59E0B" },
  { label: "Code từng file", value: 42, color: "#EF4444" },
];

export const redZones = [
  "PLACE_BID phải giải thích được lock theo auction, transaction và rollback.",
  "Auto-bid không chỉ là tăng giá tự động: phải hiểu maxBid, increment và tránh tự bid lặp.",
  "Anti-sniping kéo dài thời gian, sau đó phải push TIME_EXTENDED tới client đang subscribe.",
  "Client JavaFX không truy cập database; mọi dữ liệu đi qua SocketClient -> Request/Response JSON.",
  "CREATE_ITEM, UPDATE_ITEM, DELETE_ITEM là message legacy đang bị server từ chối, không demo nhầm.",
];

export const rolePaths: RolePath[] = [
  {
    role: "Bidder",
    goal: "Tìm auction, đặt bid, cấu hình auto-bid, nạp/rút ví, xem lịch sử và nhận realtime update.",
    permissions: [
      "GET_AUCTIONS / GET_AUCTION_DETAIL",
      "PLACE_BID / SET_AUTO_BID / GET_AUTO_BID",
      "SUBSCRIBE_AUCTION / UNSUBSCRIBE_AUCTION",
      "DEPOSIT / WITHDRAW / GET_MY_BIDS",
    ],
    mustKnow: [
      "Bidder không được bid auction đã đóng hoặc do chính mình bán.",
      "Số dư ví phải đủ để giữ tiền cho bid đang dẫn đầu.",
      "Khi bid thành công server tạo BidTransaction rồi broadcast BID_UPDATE.",
    ],
    journey: [
      {
        step: "Login",
        client: "LoginController gọi AuthService",
        server: "AuthRequestHandler kiểm tra AuthService",
        data: "users.password_hash, token phiên",
      },
      {
        step: "Open live auction",
        client: "AuctionDetailController subscribe auction",
        server: "ClientHandler giữ socket đang lắng nghe",
        data: "Request{SUBSCRIBE_AUCTION, auctionId}",
      },
      {
        step: "Place bid",
        client: "LiveBiddingController gửi PlaceBidRequest",
        server: "BidService khóa auction và transaction",
        data: "bids, auctions.current_price, users.balance",
      },
      {
        step: "Auto bid",
        client: "AutoBidRule DTO gửi maxBid",
        server: "BidService xử lý auto_bids sau bid mới",
        data: "auto_bids.max_bid, increment",
      },
    ],
  },
  {
    role: "Seller",
    goal: "Tạo auction, theo dõi seller center, sửa/hủy auction hợp lệ và xem thống kê bán hàng.",
    permissions: [
      "CREATE_AUCTION",
      "GET_SELLER_AUCTIONS",
      "GET_SELLER_STATS",
      "UPDATE_AUCTION / CANCEL_AUCTION",
    ],
    mustKnow: [
      "Seller tạo item và auction qua server; client chỉ chọn form và ảnh.",
      "Auction đã có bid thường bị hạn chế cập nhật/hủy để bảo vệ bidder.",
      "Seller center gom dữ liệu từ AuctionService và DAO, không query trực tiếp ở client.",
    ],
    journey: [
      {
        step: "Create auction",
        client: "CreateAuctionController validate form",
        server: "AuctionRequestHandler gọi AuctionService",
        data: "items, auctions, uploaded image URL",
      },
      {
        step: "Seller stats",
        client: "SellerCenterController render KPI",
        server: "AuctionService tổng hợp seller stats",
        data: "auction status, bid count, revenue",
      },
      {
        step: "Cancel auction",
        client: "EditAuctionController gửi CANCEL_AUCTION",
        server: "AuctionService kiểm tra owner/status",
        data: "auctions.status = CANCELED",
      },
    ],
  },
  {
    role: "Admin",
    goal: "Quản trị user, khóa/mở user, xem/hủy auction vi phạm và nhận list update realtime.",
    permissions: [
      "ADMIN_GET_USERS",
      "ADMIN_UPDATE_USER_STATUS",
      "ADMIN_GET_AUCTIONS",
      "ADMIN_CANCEL_AUCTION",
      "USER_LIST_UPDATED / AUCTION_CANCELED",
    ],
    mustKnow: [
      "RequestRouter chặn quyền theo role trước khi handler xử lý.",
      "Admin hủy auction phải có notification để client và seller/bidder hiểu trạng thái.",
      "Các màn admin là bằng chứng role-based authorization trong vấn đáp.",
    ],
    journey: [
      {
        step: "Open panel",
        client: "AdminPanelController tải users/auctions",
        server: "AdminRequestHandler yêu cầu role ADMIN",
        data: "users.status, auctions.status",
      },
      {
        step: "Block user",
        client: "Admin service gửi ADMIN_UPDATE_USER_STATUS",
        server: "User DAO update status, NotificationService broadcast",
        data: "USER_LIST_UPDATED event",
      },
      {
        step: "Cancel auction",
        client: "Admin chọn auction vi phạm",
        server: "Admin handler gọi AuctionService/Admin logic",
        data: "AUCTION_CANCELED event",
      },
    ],
  },
];

export const placeBidFlow: FlowStep[] = [
  {
    id: "f1",
    title: "User nhập giá",
    lane: "Client",
    detail: "JavaFX controller validate số tiền, trạng thái đăng nhập và auction đang mở.",
    file: "client/.../controller/AuctionDetailController.java",
  },
  {
    id: "f2",
    title: "Gửi JSON một dòng",
    lane: "Socket",
    detail: "SocketClient serialize Request bằng Gson, mỗi message kết thúc bằng newline.",
    file: "client/.../socket/SocketClient.java",
  },
  {
    id: "f3",
    title: "Route + authorization",
    lane: "Socket",
    detail: "ClientHandler đọc line, RequestRouter kiểm tra token, role và dispatch handler.",
    file: "server/.../socket/RequestRouter.java",
  },
  {
    id: "f4",
    title: "Auction lock",
    lane: "Service",
    detail: "BidService lấy lock theo auctionId để hai bidder không cùng cập nhật current_price.",
    file: "server/.../service/BidService.java",
  },
  {
    id: "f5",
    title: "Transaction DB",
    lane: "DAO",
    detail: "Server kiểm tra auction, wallet, tạo bid, cập nhật auction và rollback nếu lỗi.",
    file: "server/.../dao/sqlite/SQLiteBidDao.java",
  },
  {
    id: "f6",
    title: "Broadcast event",
    lane: "Realtime",
    detail: "NotificationService push BID_UPDATE, TIME_EXTENDED hoặc AUCTION_CLOSED tới subscribers.",
    file: "server/.../service/NotificationService.java",
  },
];

export const scenarioFlows: ScenarioFlow[] = [
  {
    id: "startup",
    label: "Khởi động",
    title: "Luồng khởi động server và client",
    subtitle: "Từ lệnh chạy Maven/JAR đến khi server nhận socket và JavaFX mở màn login.",
    steps: [
      {
        id: "startup-server-main",
        order: 1,
        module: "server",
        badge: "SERVER",
        title: "ServerMain.java",
        summary: "Entry point server: đọc config, mở database, init schema, bật scheduler, socket và asset server.",
        path: "server/src/main/java/com/auction/server/ServerMain.java",
        meaning: "Khi vấn đáp, mở file này để chứng minh server tự boot các thành phần nền trước khi client kết nối.",
        codeNotes: [
          { line: 1, code: "public class ServerMain", note: "Điểm bắt đầu của server module." },
          { line: 1, code: "AppProperties / Database / SocketServer", note: "Các dependency khởi động theo thứ tự cấu hình -> DB -> socket." },
        ],
        links: ["server/pom.xml", "server/src/main/resources/application.properties"],
      },
      {
        id: "startup-db",
        order: 2,
        module: "server",
        badge: "DAO",
        title: "Database.java + SchemaInitializer.java",
        summary: "Tạo kết nối SQLite, bật foreign key/WAL/timeout và tạo bảng users/items/auctions/bids/auto_bids.",
        path: "server/src/main/java/com/auction/server/dao/Database.java",
        meaning: "Đây là bằng chứng chỉ server giữ database boundary, client không có SQLite DAO.",
        codeNotes: [
          { line: 1, code: "getConnection()", note: "Nơi server lấy JDBC connection cho DAO/service." },
          { line: 1, code: "SchemaInitializer.initialize()", note: "Tạo schema trước khi socket nhận request." },
        ],
        links: ["server/src/main/java/com/auction/server/dao/SchemaInitializer.java", "server/src/main/resources/db/schema.sql"],
      },
      {
        id: "startup-socket",
        order: 3,
        module: "server",
        badge: "SOCKET",
        title: "SocketServer.java -> ClientHandler.java",
        summary: "Server lắng nghe port, accept socket, giao mỗi client cho handler đọc JSON newline.",
        path: "server/src/main/java/com/auction/server/socket/SocketServer.java",
        meaning: "Giải thích thread-per-client, request loop, route và response JSON ở đây.",
        codeNotes: [
          { line: 1, code: "ServerSocket.accept()", note: "Điểm nhận client mới." },
          { line: 1, code: "new ClientHandler(socket)", note: "Mỗi connection có handler riêng." },
        ],
        links: ["server/src/main/java/com/auction/server/socket/ClientHandler.java", "server/src/main/java/com/auction/server/socket/RequestRouter.java"],
      },
      {
        id: "startup-client",
        order: 4,
        module: "client",
        badge: "CLIENT",
        title: "ClientMain.java -> SceneManager.java -> SocketClient.java",
        summary: "JavaFX launch Stage, init scene manager/socket singleton và điều hướng LoginView.",
        path: "client/src/main/java/com/auction/client/ClientMain.java",
        meaning: "Dùng để trả lời client boot khác server boot thế nào và UI không trực tiếp truy cập DB.",
        codeNotes: [
          { line: 1, code: "Application.launch()", note: "JavaFX lifecycle bắt đầu từ đây." },
          { line: 1, code: "SceneManager", note: "Điều hướng màn hình và giữ state client." },
        ],
        links: ["client/src/main/java/com/auction/client/socket/SocketClient.java", "client/src/main/resources/fxml/LoginView.fxml"],
      },
    ],
  },
  {
    id: "login",
    label: "Đăng nhập",
    title: "Luồng login và phân quyền",
    subtitle: "Từ form LoginView đến token session, topbar/sidebar và router role guard.",
    steps: [
      {
        id: "login-fxml",
        order: 1,
        module: "client",
        badge: "FXML",
        title: "LoginView.fxml",
        summary: "Form có username/password và button onAction trỏ về LoginController.",
        path: "client/src/main/resources/fxml/LoginView.fxml",
        meaning: "Mở FXML để chỉ ra control nào user thao tác và method nào chạy.",
        codeNotes: [
          { line: 1, code: "fx:controller=\"...LoginController\"", note: "Nối view với controller." },
          { line: 1, code: "onAction=\"#handleLogin\"", note: "Bấm Login sẽ gọi method controller." },
        ],
        links: ["client/src/main/java/com/auction/client/controller/LoginController.java"],
      },
      {
        id: "login-controller",
        order: 2,
        module: "client",
        badge: "CLIENT",
        title: "LoginController.java -> AuthClientService.java",
        summary: "Controller validate input, gọi client service để gửi LOGIN request qua SocketClient.",
        path: "client/src/main/java/com/auction/client/controller/LoginController.java",
        meaning: "Nhấn mạnh validate ở client chỉ để UX; server vẫn là nơi xác thực thật.",
        codeNotes: [
          { line: 1, code: "handleLogin()", note: "Event handler chạy sau click." },
          { line: 1, code: "new LoginRequest(username, password)", note: "DTO payload gửi qua common protocol." },
        ],
        links: ["client/src/main/java/com/auction/client/service/AuthClientService.java", "common/src/main/java/com/auction/common/dto/auth/LoginRequest.java"],
      },
      {
        id: "login-server",
        order: 3,
        module: "server",
        badge: "SERVER",
        title: "AuthRequestHandler.java -> AuthService.java",
        summary: "Server nhận LOGIN, kiểm password hash, tạo token và trả LoginResponse.",
        path: "server/src/main/java/com/auction/server/socket/AuthRequestHandler.java",
        meaning: "Đây là nơi chứng minh authentication không nằm ở UI.",
        codeNotes: [
          { line: 1, code: "MessageType.LOGIN", note: "Router/handler nhận đúng loại request." },
          { line: 1, code: "SessionManager.createSession", note: "Tạo token dùng cho các request sau." },
        ],
        links: ["server/src/main/java/com/auction/server/service/AuthService.java", "server/src/main/java/com/auction/server/service/SessionManager.java"],
      },
      {
        id: "login-shell",
        order: 4,
        module: "client",
        badge: "UI",
        title: "AppShellController.java + Sidebar/TopBar",
        summary: "Sau login, client lưu user/token, render shell theo role và cập nhật balance/role label.",
        path: "client/src/main/java/com/auction/client/controller/AppShellController.java",
        meaning: "Từ đây giải thích role UI chỉ là tiện ích, không thay thế server authorization.",
        codeNotes: [
          { line: 1, code: "SceneManager", note: "Giữ current user, role, balance." },
          { line: 1, code: "SidebarController", note: "Ẩn/hiện điều hướng theo role." },
        ],
        links: ["client/src/main/java/com/auction/client/controller/SidebarController.java", "client/src/main/java/com/auction/client/controller/TopBarController.java"],
      },
    ],
  },
  {
    id: "bid",
    label: "Đặt giá",
    title: "Luồng đặt bid, auto-bid và realtime",
    subtitle: "Từ AuctionDetail/LiveBidding đến lock, transaction, bid history và BID_UPDATE.",
    steps: [
      {
        id: "bid-ui",
        order: 1,
        module: "client",
        badge: "CLIENT",
        title: "AuctionDetailController.java / LiveBiddingController.java",
        summary: "User nhập amount, bấm Place Bid hoặc đặt auto-bid max.",
        path: "client/src/main/java/com/auction/client/controller/AuctionDetailController.java",
        meaning: "Mở controller để chỉ handler UI, validate amount và cách UI subscribe auction.",
        codeNotes: [
          { line: 1, code: "handlePlaceBid()", note: "Event handler thao tác đặt giá." },
          { line: 1, code: "SUBSCRIBE_AUCTION", note: "Client đăng ký nhận event realtime cho auction." },
        ],
        links: ["client/src/main/java/com/auction/client/controller/LiveBiddingController.java", "common/src/main/java/com/auction/common/dto/bid/PlaceBidRequest.java"],
      },
      {
        id: "bid-socket",
        order: 2,
        module: "server",
        badge: "ROUTER",
        title: "RequestRouter.java -> BidRequestHandler.java",
        summary: "Server kiểm token/role, route PLACE_BID/SET_AUTO_BID tới handler.",
        path: "server/src/main/java/com/auction/server/socket/RequestRouter.java",
        meaning: "Nếu bị hỏi bảo mật, chỉ ra chặn quyền không nằm ở JavaFX mà nằm ở router server.",
        codeNotes: [
          { line: 1, code: "MessageType.PLACE_BID", note: "Message type nghiệp vụ bidding." },
          { line: 1, code: "AuthorizationException", note: "Trả lỗi nếu role/token không hợp lệ." },
        ],
        links: ["server/src/main/java/com/auction/server/socket/BidRequestHandler.java"],
      },
      {
        id: "bid-service",
        order: 3,
        module: "server",
        badge: "SERVICE",
        title: "BidService.java",
        summary: "Khóa auction, kiểm rule, mở transaction, update bid/current price/wallet, xử lý auto-bid và anti-sniping.",
        path: "server/src/main/java/com/auction/server/service/BidService.java",
        meaning: "Đây là file phải thuộc nhất khi bảo vệ: concurrency, transaction, business rule đều hội tụ.",
        codeNotes: [
          { line: 1, code: "auctionLockManager.withLock", note: "Chống lost update theo auction." },
          { line: 1, code: "processAutoBid / extendEndTime", note: "Nối auto-bid và anti-sniping với bid thường." },
        ],
        links: ["server/src/main/java/com/auction/server/concurrency/AuctionLockManager.java", "server/src/main/java/com/auction/server/dao/sqlite/SQLiteBidDao.java"],
      },
      {
        id: "bid-realtime",
        order: 4,
        module: "server",
        badge: "EVENT",
        title: "NotificationService.java -> SocketClient listener",
        summary: "Sau commit, server broadcast BID_UPDATE/TIME_EXTENDED/AUCTION_CLOSED cho client đang subscribe.",
        path: "server/src/main/java/com/auction/server/service/NotificationService.java",
        meaning: "Giải thích realtime không polling: server đẩy event tới subscriber.",
        codeNotes: [
          { line: 1, code: "broadcastBidUpdate", note: "Event được gửi sau khi trạng thái đã hợp lệ." },
          { line: 1, code: "SocketClient listener", note: "Client nhận event rồi update timeline/chart." },
        ],
        links: ["client/src/main/java/com/auction/client/socket/SocketClient.java", "client/src/main/java/com/auction/client/util/BidTimeline.java"],
      },
    ],
  },
  {
    id: "concurrency",
    label: "Đồng thời",
    title: "Luồng race condition, transaction và scheduler",
    subtitle: "Cách server tránh lost update, đóng auction đúng giờ và retry settlement.",
    steps: [
      {
        id: "concurrency-lock",
        order: 1,
        module: "server",
        badge: "LOCK",
        title: "AuctionLockManager.java + LockRegistry.java",
        summary: "Tạo lock riêng cho từng auctionId để serialize bid cùng auction nhưng không khóa toàn hệ thống.",
        path: "server/src/main/java/com/auction/server/concurrency/AuctionLockManager.java",
        meaning: "Trả lời vì sao dùng lock theo auction tốt hơn synchronized toàn BidService.",
        codeNotes: [
          { line: 1, code: "ReentrantLock", note: "Primitive concurrency dùng để bảo vệ critical section." },
          { line: 1, code: "computeIfAbsent", note: "Tạo lock lazy theo id." },
        ],
        links: ["server/src/main/java/com/auction/server/concurrency/LockRegistry.java", "server/src/test/java/com/auction/server/service/BidServiceConcurrencyTest.java"],
      },
      {
        id: "concurrency-transaction",
        order: 2,
        module: "server",
        badge: "TX",
        title: "BidServiceTransactionTest.java",
        summary: "Test rollback khi lỗi giữa transaction, tránh current_price/wallet bị cập nhật nửa vời.",
        path: "server/src/test/java/com/auction/server/service/BidServiceTransactionTest.java",
        meaning: "Dùng test này để chứng minh hiểu ACID chứ không chỉ nói lý thuyết.",
        codeNotes: [
          { line: 1, code: "assert rollback", note: "Kỳ vọng DB trở về trạng thái trước lỗi." },
          { line: 1, code: "notification after commit", note: "Không push event nếu transaction fail." },
        ],
        links: ["server/src/main/java/com/auction/server/service/BidService.java"],
      },
      {
        id: "concurrency-scheduler",
        order: 3,
        module: "server",
        badge: "SCHEDULER",
        title: "AuctionManagerService.java",
        summary: "ScheduledExecutorService định kỳ tìm auction đến hạn, đóng và settlement/retry.",
        path: "server/src/main/java/com/auction/server/service/AuctionManagerService.java",
        meaning: "Giải thích server vẫn đóng auction kể cả không client nào mở màn hình.",
        codeNotes: [
          { line: 1, code: "ScheduledExecutorService", note: "Chạy task nền theo interval." },
          { line: 1, code: "settlement retry", note: "Retry cần idempotent để không chuyển tiền hai lần." },
        ],
        links: ["server/src/test/java/com/auction/server/service/AuctionManagerServiceTest.java", "server/src/test/java/com/auction/server/service/AuctionSettlementTest.java"],
      },
      {
        id: "concurrency-idempotency",
        order: 4,
        module: "server",
        badge: "IDEMPOTENT",
        title: "IdempotencyManager.java",
        summary: "Theo dõi request/operation để tránh xử lý lặp trong các luồng nhạy cảm.",
        path: "server/src/main/java/com/auction/server/concurrency/IdempotencyManager.java",
        meaning: "Nối với settlement retry: retry được phép chạy lại nhưng kết quả nghiệp vụ không được nhân đôi.",
        codeNotes: [
          { line: 1, code: "idempotency key", note: "Định danh thao tác đã xử lý." },
          { line: 1, code: "retry-safe", note: "Thiết kế để retry an toàn." },
        ],
        links: ["server/src/main/java/com/auction/server/service/AuctionManagerService.java"],
      },
    ],
  },
  ...generatedScenarioFlows,
];

export const lifecycleStates = [
  { name: "DRAFT", note: "Seller chuẩn bị dữ liệu auction, chưa mở bid." },
  { name: "ACTIVE", note: "Bidder được place bid, auto-bid và subscribe realtime." },
  { name: "EXTENDED", note: "Anti-sniping kéo dài khi bid sát giờ đóng." },
  { name: "CLOSED", note: "Scheduler hoặc service đóng auction và settlement ví." },
  { name: "CANCELED", note: "Seller/Admin hủy theo rule, client nhận trạng thái mới." },
];

export const dbTables = [
  {
    name: "users",
    columns: ["id", "username", "password_hash", "role", "balance", "status"],
    color: "#4F46E5",
  },
  {
    name: "items",
    columns: ["id", "seller_id", "type", "title", "image_path", "deleted"],
    color: "#0EA5E9",
  },
  {
    name: "auctions",
    columns: ["id", "item_id", "seller_id", "status", "current_price", "version"],
    color: "#22C55E",
  },
  {
    name: "bids",
    columns: ["id", "auction_id", "bidder_id", "amount", "created_at"],
    color: "#F59E0B",
  },
  {
    name: "auto_bids",
    columns: ["id", "auction_id", "bidder_id", "max_bid", "increment"],
    color: "#EF4444",
  },
];

export const mavenModules = [
  {
    name: "common",
    deps: ["Gson", "JUnit"],
    purpose: "Model, DTO, enum Role/AuctionStatus, protocol Request/Response/MessageType.",
  },
  {
    name: "server",
    deps: ["common", "sqlite-jdbc", "jBCrypt", "SLF4J/Logback", "Mockito"],
    purpose: "Socket server, DAO SQLite, service nghiệp vụ, scheduler và settlement.",
  },
  {
    name: "client",
    deps: ["common", "JavaFX controls/fxml", "Ikonli", "Gson"],
    purpose: "JavaFX UI, controllers, service proxy, SocketClient và chart/timeline.",
  },
];

export const criticalFiles: CriticalFile[] = [
  {
    path: "common/src/main/java/com/auction/common/protocol/MessageType.java",
    layer: "Protocol",
    purpose: "Danh sách message client-server và event server push.",
    explain: [
      "Phần Authentication/Dashboard/Bidding/Wallet/Admin là request từ client.",
      "BID_UPDATE, AUCTION_CLOSED, TIME_EXTENDED là event realtime server gửi ngược.",
      "Khi thêm chức năng mới, phải thêm MessageType, DTO, handler, client service và test.",
    ],
    linkedTheory: ["DTO/protocol", "Client-server", "Realtime event"],
    tests: ["RequestRouterAuthorizationTest", "ClientHandlerIntegrationTest"],
    risk: "High",
  },
  {
    path: "server/src/main/java/com/auction/server/socket/ClientHandler.java",
    layer: "Socket",
    purpose: "Mỗi client socket có một handler đọc JSON line và trả Response.",
    explain: [
      "Handler không tự xử lý nghiệp vụ sâu, nó parse request rồi đưa qua RequestRouter.",
      "Cần giải thích vì sao dùng loop đọc line và cách server giữ connection realtime.",
      "Nếu client disconnect, handler phải dọn subscription để tránh gửi vào socket chết.",
    ],
    linkedTheory: ["TCP Socket", "Thread per client", "Gson"],
    tests: ["ClientHandlerIntegrationTest"],
    risk: "Medium",
  },
  {
    path: "server/src/main/java/com/auction/server/socket/RequestRouter.java",
    layer: "Routing",
    purpose: "Phân quyền và route MessageType tới handler tương ứng.",
    explain: [
      "Token/session được kiểm trước, sau đó role Admin/Seller/Bidder được kiểm theo message.",
      "Đây là điểm bảo vệ: client không đáng tin, UI ẩn nút chưa đủ.",
      "Message legacy như CREATE_ITEM/UPDATE_ITEM/DELETE_ITEM cần biết tình trạng hỗ trợ.",
    ],
    linkedTheory: ["Authorization", "Router pattern"],
    tests: ["RequestRouterAuthorizationTest"],
    risk: "High",
  },
  {
    path: "server/src/main/java/com/auction/server/service/BidService.java",
    layer: "Service",
    purpose: "Trái tim của place bid, auto-bid, anti-sniping và settlement liên quan bid.",
    explain: [
      "Phải lấy lock theo auction để tránh lost update khi hai bid cùng lúc.",
      "DB transaction bao quanh kiểm tra giá, wallet, insert bid và cập nhật auction.",
      "Sau khi bid thành công, service kích hoạt auto-bid và notification realtime.",
    ],
    linkedTheory: ["Race condition", "Transaction", "Observer"],
    tests: ["BidServiceTest", "BidServiceConcurrencyTest", "BidServiceTransactionTest"],
    risk: "High",
  },
  {
    path: "server/src/main/java/com/auction/server/service/AuctionManagerService.java",
    layer: "Scheduler",
    purpose: "Theo dõi auction đến hạn, đóng phiên và retry settlement khi cần.",
    explain: [
      "ScheduledExecutorService chạy định kỳ, không phụ thuộc thao tác UI.",
      "Settlement retry bảo vệ khi đóng auction nhưng cập nhật ví/DB lỗi tạm thời.",
      "Cần chứng minh server chủ động đóng auction kể cả không có client đang mở.",
    ],
    linkedTheory: ["Scheduler", "Retry", "Idempotency"],
    tests: ["AuctionManagerServiceTest", "AuctionSettlementTest"],
    risk: "High",
  },
  {
    path: "server/src/main/java/com/auction/server/dao/SchemaInitializer.java",
    layer: "DAO",
    purpose: "Tạo schema SQLite: users, items, auctions, bids, auto_bids và index.",
    explain: [
      "Chỉ server chạm database, client không có JDBC dependency.",
      "Các foreign key mô tả quan hệ seller/item/auction/bidder.",
      "Index seller/status/time giúp query danh sách và scheduler nhanh hơn.",
    ],
    linkedTheory: ["SQLite", "DAO", "Index"],
    tests: ["SQLiteUserDaoTest", "SQLiteAuctionDaoTest", "SQLiteBidDaoTest"],
    risk: "Medium",
  },
  {
    path: "client/src/main/java/com/auction/client/socket/SocketClient.java",
    layer: "Client",
    purpose: "Cầu nối JavaFX với server qua TCP socket JSON.",
    explain: [
      "Client service không gọi DAO, chỉ gọi SocketClient rồi nhận Response/notification.",
      "ConnectionState có RECONNECTING nhưng cần phân biệt với auto retry/silent reauth.",
      "Thread nghe event phải cập nhật JavaFX UI qua cơ chế đúng thread.",
    ],
    linkedTheory: ["Client-server", "JavaFX thread", "Observer"],
    tests: ["SocketClientIntegrationTest"],
    risk: "Medium",
  },
  {
    path: "pom.xml",
    layer: "Build",
    purpose: "Parent Maven quản lý version Java 21, module common/server/client và plugin.",
    explain: [
      "dependencyManagement khóa version JUnit, Gson, SQLite, JavaFX để module con dùng thống nhất.",
      "maven-surefire chạy test; checkstyle kiểm Google Java Style ở phase verify.",
      "server/client có pom riêng để gom dependency đúng phạm vi.",
    ],
    linkedTheory: ["Maven reactor", "Dependency scope", "CI"],
    tests: ["mvn test", "mvn verify"],
    risk: "Medium",
  },
];

export const theoryTopics: StudyTopic[] = [
  {
    id: "client-server",
    title: "Client-server và boundary",
    category: "Architecture",
    level: "Core",
    summary: "Client JavaFX chịu trách nhiệm UI, server chịu nghiệp vụ và database. Boundary giúp bảo mật và tránh mỗi client tự sửa DB.",
    projectExample: "Login, place bid, wallet đều đi qua Request/Response; chỉ server có SQLite DAO.",
    files: ["SocketClient.java", "ClientHandler.java", "RequestRouter.java"],
    links: [{ label: "Oracle Java Networking", url: "https://docs.oracle.com/javase/tutorial/networking/sockets/" }],
    status: "done",
  },
  {
    id: "tcp-json",
    title: "TCP Socket JSON newline",
    category: "Networking",
    level: "Core",
    summary: "TCP là stream, nên app cần framing. Repo dùng mỗi JSON trên một dòng để biết khi nào message kết thúc.",
    projectExample: "SocketClient serialize Request bằng Gson; ClientHandler đọc từng line.",
    files: ["SocketClient.java", "ClientHandler.java", "Request.java", "Response.java"],
    links: [{ label: "Java Socket API", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/Socket.html" }],
    status: "review",
  },
  {
    id: "http-assets",
    title: "HTTP asset server",
    category: "Networking",
    level: "Advanced",
    summary: "Ảnh upload có thể phục vụ qua HTTP nhỏ riêng để client tải media bằng URL thay vì nhồi binary vào socket nghiệp vụ.",
    projectExample: "AssetServer phục vụ uploads; ImageUrlUtil ở client chuẩn hóa URL ảnh.",
    files: ["AssetServer.java", "ImageUrlUtil.java"],
    links: [{ label: "HTTP overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" }],
    status: "review",
  },
  {
    id: "mvc-javafx",
    title: "MVC trong JavaFX/FXML",
    category: "Frontend",
    level: "Core",
    summary: "FXML mô tả view, controller xử lý interaction, service gọi server và model/DTO chứa dữ liệu.",
    projectExample: "AuctionDetailController không tự viết SQL; nó gọi AuctionService client-side.",
    files: ["AuctionDetailController.java", "auction-detail.fxml", "AuctionClientService.java"],
    links: [{ label: "JavaFX FXML", url: "https://openjfx.io/javadoc/21/javafx.fxml/javafx/fxml/doc-files/introduction_to_fxml.html" }],
    status: "review",
  },
  {
    id: "dto-protocol",
    title: "DTO, protocol và Gson",
    category: "Architecture",
    level: "Core",
    summary: "DTO là hợp đồng dữ liệu qua mạng. Model domain có thể giàu hơn, DTO nên ổn định và dễ serialize.",
    projectExample: "PlaceBidRequest chứa auctionId/amount, Response chứa success/message/payload.",
    files: ["common/.../dto", "Request.java", "Response.java", "MessageType.java"],
    links: [{ label: "Gson User Guide", url: "https://github.com/google/gson/blob/main/UserGuide.md" }],
    status: "done",
  },
  {
    id: "handler-service-dao",
    title: "Handler-Service-DAO",
    category: "Architecture",
    level: "Core",
    summary: "Handler nhận request, service xử lý rule nghiệp vụ, DAO lưu/đọc DB. Tách lớp giúp test service không phụ thuộc socket UI.",
    projectExample: "BidRequestHandler gọi BidService; BidService gọi BidDao/AuctionDao/UserDao.",
    files: ["BidRequestHandler.java", "BidService.java", "SQLiteBidDao.java"],
    links: [{ label: "Repository pattern", url: "https://martinfowler.com/eaaCatalog/repository.html" }],
    status: "done",
  },
  {
    id: "dao-sqlite",
    title: "DAO, JDBC và SQLite",
    category: "Persistence",
    level: "Core",
    summary: "DAO che giấu SQL và mapping ResultSet. SQLite phù hợp app local/demo nhưng vẫn cần transaction và index.",
    projectExample: "SQLiteAuctionDao map auctions; SchemaInitializer tạo bảng và index.",
    files: ["SQLiteAuctionDao.java", "Database.java", "SchemaInitializer.java"],
    links: [{ label: "JDBC basics", url: "https://docs.oracle.com/javase/tutorial/jdbc/basics/" }],
    status: "review",
  },
  {
    id: "transaction",
    title: "Transaction, ACID và rollback",
    category: "Persistence",
    level: "Defense",
    summary: "Một bid không chỉ insert row: phải update price, wallet/hold và notification sau commit. Lỗi giữa chừng phải rollback.",
    projectExample: "BidServiceTransactionTest chứng minh lỗi DB không để auction nửa cập nhật.",
    files: ["BidService.java", "BidServiceTransactionTest.java"],
    links: [{ label: "SQLite transactions", url: "https://www.sqlite.org/lang_transaction.html" }],
    status: "risk",
  },
  {
    id: "auth-session",
    title: "Auth, authorization và session token",
    category: "Security",
    level: "Core",
    summary: "Authentication xác minh người dùng; authorization kiểm tra quyền theo role và resource owner.",
    projectExample: "RequestRouterAuthorizationTest kiểm admin/bidder/seller không gọi nhầm quyền.",
    files: ["AuthService.java", "SessionManager.java", "RequestRouter.java"],
    links: [{ label: "OWASP auth cheat sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" }],
    status: "review",
  },
  {
    id: "oop",
    title: "OOP, inheritance và polymorphism",
    category: "Java",
    level: "Core",
    summary: "Đề yêu cầu mô hình hóa bằng class kế thừa: User -> Bidder/Seller/Admin và Item -> Electronics/Art/Vehicle.",
    projectExample: "ModelInheritanceTest kiểm field/hành vi chung và riêng của model.",
    files: ["Entity.java", "User.java", "Bidder.java", "Seller.java", "Admin.java", "Item.java"],
    links: [{ label: "Java inheritance", url: "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html" }],
    status: "done",
  },
  {
    id: "patterns",
    title: "Design patterns",
    category: "Architecture",
    level: "Defense",
    summary: "Factory tạo item theo type, Observer cho realtime notification, Singleton/registry cho tài nguyên chia sẻ.",
    projectExample: "ItemFactory tạo Electronics/Art/Vehicle; NotificationService phát event tới subscribers.",
    files: ["ItemFactory.java", "NotificationService.java", "LockRegistry.java"],
    links: [{ label: "Refactoring Guru patterns", url: "https://refactoring.guru/design-patterns" }],
    status: "review",
  },
  {
    id: "concurrency",
    title: "Concurrency, race condition và lost update",
    category: "Concurrency",
    level: "Defense",
    summary: "Hai bidder đặt giá cùng lúc có thể cùng đọc current_price cũ. Lock theo auction và transaction loại bỏ lost update.",
    projectExample: "BidServiceConcurrencyTest/ConcurrentBidTest mô phỏng bid song song.",
    files: ["BidService.java", "AuctionLockManager.java", "LockRegistry.java"],
    links: [{ label: "Java concurrency tutorial", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/" }],
    status: "risk",
  },
  {
    id: "scheduler",
    title: "Scheduler và settlement retry",
    category: "Concurrency",
    level: "Defense",
    summary: "ScheduledExecutorService chạy nền để đóng auction đến hạn và retry settlement nếu lỗi tạm thời.",
    projectExample: "AuctionManagerServiceTest kiểm close due auctions và settlement retry.",
    files: ["AuctionManagerService.java", "AuctionSettlementTest.java"],
    links: [{ label: "ScheduledExecutorService", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html" }],
    status: "risk",
  },
  {
    id: "realtime",
    title: "Realtime event-driven UI",
    category: "Networking",
    level: "Advanced",
    summary: "Server push event cho client đang subscribe thay vì polling liên tục, giúp bid chart và trạng thái cập nhật tức thời.",
    projectExample: "BID_UPDATE cập nhật timeline và current price ở màn live bidding.",
    files: ["NotificationService.java", "SocketClient.java", "BidTimeline.java"],
    links: [{ label: "Observer pattern", url: "https://refactoring.guru/design-patterns/observer" }],
    status: "review",
  },
  {
    id: "business-rules",
    title: "Business rules: lifecycle, wallet, anti-sniping",
    category: "Domain",
    level: "Defense",
    summary: "Rule đấu giá quyết định ai được bid, khi nào kéo dài, khi nào đóng và tiền winner/seller được xử lý ra sao.",
    projectExample: "Anti-sniping push TIME_EXTENDED; close auction push AUCTION_CLOSED.",
    files: ["AuctionService.java", "BidService.java", "WalletService.java"],
    links: [{ label: "Domain model", url: "https://martinfowler.com/eaaCatalog/domainModel.html" }],
    status: "risk",
  },
  {
    id: "exceptions-validation",
    title: "Exceptions và validation",
    category: "Reliability",
    level: "Core",
    summary: "Validation gần UI giúp feedback nhanh; validation ở server mới là nguồn sự thật vì client có thể bị sửa.",
    projectExample: "Invalid bid amount trả Response lỗi, client hiển thị notification.",
    files: ["GlobalExceptionHandler.java", "BidService.java", "Response.java"],
    links: [{ label: "Java exceptions", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/" }],
    status: "review",
  },
  {
    id: "java-core",
    title: "Java records, collections, time, money",
    category: "Java",
    level: "Core",
    summary: "DTO và model dùng kiểu dữ liệu Java hiện đại; tiền nên so sánh chính xác, thời gian dùng API rõ timezone/instant.",
    projectExample: "BidTransaction amount, auction endTime và lists trong dashboard DTO.",
    files: ["common/.../dto", "Auction.java", "BidTransaction.java"],
    links: [{ label: "Java time package", url: "https://docs.oracle.com/javase/tutorial/datetime/" }],
    status: "review",
  },
  {
    id: "maven",
    title: "Maven multi-module và dependency management",
    category: "Build",
    level: "Core",
    summary: "Parent pom quản lý version; module common/server/client build theo reactor và chia dependency đúng phạm vi.",
    projectExample: "server phụ thuộc common + sqlite; client phụ thuộc common + javafx, không phụ thuộc sqlite.",
    files: ["pom.xml", "server/pom.xml", "client/pom.xml", "common/pom.xml"],
    links: [{ label: "Maven multi-module", url: "https://maven.apache.org/guides/mini/guide-multiple-modules.html" }],
    status: "done",
  },
  {
    id: "testing",
    title: "JUnit, Mockito và test strategy",
    category: "Testing",
    level: "Core",
    summary: "Test service cho business rules, DAO cho SQL mapping, integration test cho socket/router, client util test cho UI logic.",
    projectExample: "BidServiceConcurrencyTest là test đáng demo khi bị hỏi về race condition.",
    files: ["server/src/test", "client/src/test", "common/src/test"],
    links: [{ label: "JUnit 5 user guide", url: "https://junit.org/junit5/docs/current/user-guide/" }],
    status: "done",
  },
  {
    id: "logging-config",
    title: "Logging, config và deployment",
    category: "Operations",
    level: "Advanced",
    summary: "Config tách port/db path; logging giúp debug demo thay vì chỉ nhìn UI.",
    projectExample: "AppProperties đọc cấu hình server; Logback ghi lỗi socket/service.",
    files: ["AppProperties.java", "logback.xml", "ServerMain.java"],
    links: [{ label: "SLF4J manual", url: "https://www.slf4j.org/manual.html" }],
    status: "review",
  },
  {
    id: "git-ci",
    title: "Git workflow và CI",
    category: "Team",
    level: "Core",
    summary: "Mỗi thành viên phải biết chạy test/checkstyle trước khi push để tránh hỏng demo chung.",
    projectExample: "mvn verify chạy test và checkstyle theo parent pom.",
    files: [".github/workflows", "pom.xml"],
    links: [{ label: "GitHub Actions Java", url: "https://docs.github.com/actions/automating-builds-and-tests/building-and-testing-java-with-maven" }],
    status: "review",
  },
  {
    id: "security-robustness",
    title: "Security và robustness",
    category: "Security",
    level: "Advanced",
    summary: "Hash password, không tin client, kiểm role/owner, handle disconnect và input xấu.",
    projectExample: "jBCrypt trong AuthService, RequestRouter chặn admin message nếu không phải ADMIN.",
    files: ["AuthService.java", "RequestRouter.java", "ClientHandler.java"],
    links: [{ label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" }],
    status: "review",
  },
  {
    id: "ui-ux",
    title: "UI/UX implementation theory",
    category: "Frontend",
    level: "Advanced",
    summary: "JavaFX controller phải giữ UI phản hồi nhanh, cập nhật đúng thread và hiển thị trạng thái lỗi rõ.",
    projectExample: "NotificationManager, AuctionStatusUi, PriceChartManager và BidTimeline.",
    files: ["NotificationManager.java", "AuctionStatusUi.java", "PriceChartManager.java"],
    links: [{ label: "JavaFX threading", url: "https://openjfx.io/javadoc/21/javafx.graphics/javafx/application/Platform.html" }],
    status: "review",
  },
];

export const testCases: TestCase[] = [
  {
    name: "BidServiceConcurrencyTest",
    target: "Hai người bid cùng lúc không tạo hai winner hoặc lost update.",
    command: "mvn -pl server -Dtest=BidServiceConcurrencyTest test",
    arrange: "Tạo auction ACTIVE, hai bidder đủ ví, executor chạy nhiều task PLACE_BID.",
    act: "Các task cùng gọi BidService.placeBid trên cùng auctionId.",
    assert: "Chỉ bid hợp lệ thắng theo amount/time; current_price cuối cùng khớp bid cao nhất.",
    viva: "Giải thích vì sao lock theo auction tốt hơn synchronized toàn service.",
  },
  {
    name: "BidServiceTransactionTest",
    target: "Rollback khi insert bid hoặc update auction/wallet lỗi.",
    command: "mvn -pl server -Dtest=BidServiceTransactionTest test",
    arrange: "Mock/fixture DAO tạo lỗi ở giữa transaction.",
    act: "Gọi placeBid với amount hợp lệ.",
    assert: "Không để current_price hoặc wallet ở trạng thái nửa cập nhật.",
    viva: "Transaction phải bao quanh những statement nào và notification gửi lúc nào.",
  },
  {
    name: "AuctionManagerServiceTest",
    target: "Scheduler đóng auction đến hạn.",
    command: "mvn -pl server -Dtest=AuctionManagerServiceTest test",
    arrange: "Auction endTime đã qua, trạng thái ACTIVE.",
    act: "Chạy tick của AuctionManagerService.",
    assert: "Auction chuyển CLOSED và settlement được gọi đúng.",
    viva: "Tại sao server cần scheduler dù client có thể refresh danh sách.",
  },
  {
    name: "RequestRouterAuthorizationTest",
    target: "Không role nào gọi nhầm quyền của role khác.",
    command: "mvn -pl server -Dtest=RequestRouterAuthorizationTest test",
    arrange: "Token của bidder/seller/admin và request admin/seller/bidder.",
    act: "Route request qua RequestRouter.",
    assert: "Request trái quyền bị reject trước khi vào service.",
    viva: "UI ẩn nút có đủ bảo mật không, vì sao?",
  },
  {
    name: "SocketClientIntegrationTest",
    target: "Client gửi request và nhận response/event đúng qua socket.",
    command: "mvn -pl client -Dtest=SocketClientIntegrationTest test",
    arrange: "Server test socket hoặc fake endpoint.",
    act: "SocketClient connect, send request, subscribe event.",
    assert: "Parse JSON, trạng thái connection và callback event đúng.",
    viva: "TCP stream khác HTTP request-response ở điểm nào.",
  },
  {
    name: "ModelInheritanceTest",
    target: "OOP model đúng yêu cầu đề.",
    command: "mvn -pl common -Dtest=ModelInheritanceTest test",
    arrange: "Tạo Bidder/Seller/Admin và Item subclass.",
    act: "Gọi getter, polymorphic behavior hoặc factory.",
    assert: "Field chung/riêng đúng, type mapping đúng.",
    viva: "Vì sao không chỉ dùng một class User với string role cho mọi thứ?",
  },
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "q1",
    level: "Cơ bản",
    topic: "Architecture",
    question: "Khi bidder bấm Place Bid, dữ liệu đi qua những lớp nào từ client đến database?",
    answer: "JavaFX controller lấy input, gọi client Auction/Bid service, service dùng SocketClient gửi Request JSON. Server ClientHandler đọc line, RequestRouter kiểm token/role rồi gọi BidRequestHandler. Handler gọi BidService, service lấy lock theo auction, mở transaction, dùng DAO đọc auction/user/bid, insert bid, update auction/wallet, commit rồi NotificationService broadcast BID_UPDATE.",
    followUps: [
      "Lớp nào không được chứa SQL?",
      "Tại sao handler không nên tự update database?",
      "Nếu JSON thiếu auctionId thì lỗi được trả ở đâu?",
    ],
  },
  {
    id: "q2",
    level: "Hỏi xoáy",
    topic: "Concurrency",
    question: "Nếu bỏ AuctionLockManager, lỗi nào có thể xảy ra khi hai bidder cùng đặt giá?",
    answer: "Cả hai request có thể cùng đọc current_price cũ, cùng thấy bid hợp lệ, rồi update đè nhau. Kết quả là lost update, bid thấp có thể ghi sau bid cao, hoặc hai notification làm client thấy trạng thái mâu thuẫn. Lock theo auctionId serialize các thay đổi của cùng auction nhưng vẫn cho các auction khác chạy song song.",
    followUps: [
      "Database transaction đã đủ chưa?",
      "Lock toàn service có nhược điểm gì?",
      "Test nào chứng minh điều này?",
    ],
  },
  {
    id: "q3",
    level: "Demo",
    topic: "Manual test",
    question: "Hãy demo anti-sniping và giải thích server/client thay đổi thế nào.",
    answer: "Mở auction gần hết giờ, bidder đặt bid trong cửa sổ anti-sniping. Server BidService/AuctionService cập nhật endTime kéo dài và NotificationService push TIME_EXTENDED. Client đang subscribe nhận event, cập nhật countdown và thông báo; DB auctions.end_time thay đổi để scheduler đóng theo giờ mới.",
    followUps: [
      "Nếu client không subscribe thì họ biết extension bằng cách nào?",
      "TIME_EXTENDED khác BID_UPDATE ở payload nào?",
      "Scheduler xử lý endTime mới ra sao?",
    ],
  },
  {
    id: "q4",
    level: "Debug",
    topic: "Socket",
    question: "Client login được nhưng không nhận realtime bid update. Bạn trace từ đâu?",
    answer: "Kiểm tra client có gửi SUBSCRIBE_AUCTION đúng auctionId không, SocketClient listener thread còn sống không, server ClientHandler đã đăng ký subscriber chưa, NotificationService có broadcast sau commit không, và UI update có chạy đúng JavaFX thread không. Sau đó xem log server/client và test ClientHandlerIntegrationTest/SocketClientIntegrationTest.",
    followUps: [
      "Vì sao notification nên gửi sau commit?",
      "Nếu socket disconnect thì server cần dọn gì?",
      "Có nên polling thay thế không?",
    ],
  },
  {
    id: "q5",
    level: "Hỏi xoáy",
    topic: "Maven",
    question: "Vì sao client module không nên phụ thuộc sqlite-jdbc?",
    answer: "Theo kiến trúc client-server, chỉ server truy cập DB. Nếu client có sqlite-jdbc, boundary bị phá, dễ lộ schema, khó kiểm quyền và có nguy cơ mỗi client tự sửa dữ liệu. Client chỉ cần common DTO/protocol, JavaFX UI và socket.",
    followUps: [
      "dependencyManagement ở parent pom dùng để làm gì?",
      "mvn -pl server test khác mvn test thế nào?",
      "Scope test có tác dụng gì?",
    ],
  },
  {
    id: "q6",
    level: "Cơ bản",
    topic: "DTO",
    question: "MessageType, Request, Response và DTO liên hệ với nhau thế nào?",
    answer: "MessageType cho biết hành động cần làm, Request gói type + token/correlation/payload, DTO là payload cụ thể như PlaceBidRequest, Response trả success/message/payload. Cặp này là hợp đồng chung giữa client và server trong module common.",
    followUps: [
      "Thêm message mới cần sửa những file nào?",
      "Vì sao DTO nằm trong common?",
      "Gson gặp field thiếu thì cần xử lý ra sao?",
    ],
  },
];

export const manualScripts = [
  {
    title: "Login và phân quyền",
    steps: [
      "Chạy server, mở client với tài khoản bidder/seller/admin.",
      "Đăng nhập từng role và ghi màn hình nào hiện trong sidebar.",
      "Thử gửi thao tác admin bằng tài khoản bidder nếu UI cho phép giả lập: server phải reject.",
    ],
    expected: "Client nhận token hợp lệ; RequestRouter không cho role sai vào handler.",
  },
  {
    title: "Place bid và realtime",
    steps: [
      "Mở hai client bidder cùng một auction ACTIVE.",
      "Client A subscribe màn detail, Client B đặt bid cao hơn.",
      "Quan sát price/timeline của Client A cập nhật không cần refresh.",
    ],
    expected: "Server commit bid, broadcast BID_UPDATE và client update chart/timeline.",
  },
  {
    title: "Auto-bidding",
    steps: [
      "Bidder A đặt auto-bid max cao hơn current price.",
      "Bidder B đặt bid mới dưới max của A.",
      "Quan sát server tự tạo bid phản hồi cho A theo increment.",
    ],
    expected: "auto_bids được đọc, bid tự động không vượt max_bid và không tạo vòng lặp vô hạn.",
  },
  {
    title: "Anti-sniping",
    steps: [
      "Tạo auction sắp hết hạn hoặc chỉnh thời gian ngắn trong DB/test fixture.",
      "Bid trong cửa sổ cuối.",
      "Kiểm endTime được kéo dài và client nhận TIME_EXTENDED.",
    ],
    expected: "Countdown đổi, auction chưa bị scheduler đóng ở thời điểm cũ.",
  },
];
