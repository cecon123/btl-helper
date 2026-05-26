export type CuratedInterviewQuestion = {
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
  lineRefs: { line: number; code: string; explain: string }[];
  followUps: string[];
};

type CuratedTopic = {
  id: string;
  level: string;
  topic: string;
  tags: string[];
  filePath: string;
  lineRefs: CuratedInterviewQuestion["lineRefs"];
  prompts: string[];
  intent: string;
  answer: string;
  answerBullets: string[];
  mustMention: string[];
  commonMistakes: string[];
  followUps: string[];
};

const topics: CuratedTopic[] = [
  {
    id: "login-flow",
    level: "Cơ bản",
    topic: "Login flow và session token",
    tags: ["Flow", "Auth", "Socket", "Session"],
    filePath: "client/src/main/java/com/auction/client/controller/LoginController.java",
    lineRefs: [
      { line: 1, code: "handleLogin()", explain: "Điểm bắt đầu khi user bấm Login trên JavaFX UI." },
      { line: 1, code: "MessageType.LOGIN", explain: "Contract để server biết request này là đăng nhập." },
      { line: 1, code: "SessionManager.createSession", explain: "Server tạo token sau khi xác thực password thành công." },
    ],
    prompts: [
      "Khi người dùng bấm Login, dữ liệu đi qua những lớp nào từ JavaFX đến server?",
      "Giải thích vì sao login không chỉ là kiểm username/password ở client.",
      "Token session được tạo ở đâu và client dùng nó như thế nào sau login?",
      "Nếu login thành công nhưng sidebar/topbar sai role thì em trace từ đâu?",
      "Nói luồng Login theo thứ tự Controller, ClientService, Socket, Handler, Service.",
      "Vì sao server phải trả LoginResponse thay vì để client tự suy luận role?",
      "Nếu password sai thì lỗi đi qua Response về UI như thế nào?",
      "Khi vấn đáp, em sẽ mở những file nào để chứng minh login hoạt động?",
      "Login liên quan gì đến phân quyền các request sau đó?",
      "Hãy đưa ra một câu trả lời mẫu ngắn gọn cho luồng đăng nhập.",
    ],
    intent: "Giúp thành viên nắm auth end-to-end, tránh trả lời kiểu chỉ mô tả màn Login.",
    answer: `Cách trả lời tốt là bắt đầu từ thao tác thật: user nhập username/password trong LoginView, LoginController đọc input, kiểm rỗng để phản hồi nhanh, rồi tạo LoginRequest và gọi AuthClientService. AuthClientService không biết database; nó chỉ bọc payload vào Request với MessageType.LOGIN và gửi qua SocketClient dưới dạng JSON newline. Ở server, ClientHandler đọc từng dòng JSON, RequestRouter nhìn MessageType và chuyển cho AuthRequestHandler. Handler gọi AuthService, AuthService mới là nơi kiểm username, BCrypt password hash và trạng thái active của user.

Nếu xác thực đúng, server gọi SessionManager để tạo token gắn với userId/role. LoginResponse trả về client gồm thông tin user và token. Từ thời điểm này, client lưu token trong SceneManager/SocketClient state để các request như PLACE_BID, CREATE_AUCTION, ADMIN_GET_USERS gửi kèm token. Sidebar/topbar chỉ ẩn hiện theo role để UX dễ dùng; bảo mật thật vẫn nằm ở RequestRouter và service server.

Khi bị hỏi lỗi, hãy trace theo hướng: UI có lấy đúng input không, AuthClientService có gửi đúng MessageType.LOGIN không, server log có vào AuthRequestHandler không, AuthService có tìm user và check BCrypt không, response success/error về client có được xử lý bằng Platform.runLater hoặc notification không. Test gần nhất là AuthServiceTest và các test router/session.`,
    answerBullets: [
      "Bắt đầu từ LoginController đọc input và tạo LoginRequest.",
      "Nói AuthClientService/SocketClient chỉ gửi request, không đụng DB.",
      "Nói AuthRequestHandler/AuthService kiểm BCrypt và active status.",
      "Nói SessionManager tạo token và token được gửi trong request sau.",
      "Kết thúc bằng role UI chỉ là UX, server mới bảo vệ quyền.",
    ],
    mustMention: ["LoginController", "AuthClientService", "SocketClient", "AuthRequestHandler", "AuthService", "SessionManager", "LoginResponse"],
    commonMistakes: [
      "Nói client tự đăng nhập thành công mà quên server xác thực.",
      "Quên BCrypt và active status.",
      "Cho rằng sidebar ẩn nút là đủ phân quyền.",
    ],
    followUps: ["Logout làm token mất hiệu lực ở đâu?", "Nếu user bị disable sau login thì request sau xử lý thế nào?", "Test nào chứng minh password sai bị reject?"],
  },
  {
    id: "register-flow",
    level: "Cơ bản",
    topic: "Register flow và tạo tài khoản",
    tags: ["Flow", "Auth", "DTO", "UI"],
    filePath: "client/src/main/java/com/auction/client/controller/RegisterController.java",
    lineRefs: [
      { line: 1, code: "new RegisterRequest(fullName, username, password, role)", explain: "Payload đăng ký nằm trong common DTO để client/server dùng chung contract." },
      { line: 1, code: "MessageType.REGISTER", explain: "Request đăng ký được định tuyến bằng protocol chung." },
      { line: 1, code: "SQLiteUserDao.create", explain: "Server lưu user mới sau khi validate và hash password." },
    ],
    prompts: [
      "Luồng đăng ký tài khoản Bidder/Seller chạy từ UI đến database như thế nào?",
      "Vì sao RegisterRequest nằm trong module common?",
      "Sau khi đăng ký thành công, vì sao app vẫn ở màn Register và yêu cầu Back to Login?",
      "Server chặn tạo ADMIN từ public UI như thế nào?",
      "Nếu username bị trùng, lỗi được phát hiện ở layer nào?",
      "Giải thích Register flow theo thứ tự FXML, controller, DTO, handler, service, DAO.",
      "Register khác Login ở điểm nào về dữ liệu trả về và session?",
      "Khi demo register, thành viên cần mở file nào để nói không bị lạc?",
      "Nếu user nhập confirm password sai thì lỗi nên xử lý ở client hay server?",
      "Vì sao password không được lưu plain text trong SQLite?",
    ],
    intent: "Giúp học viên nói được register là một flow có validation, DTO contract, hash password và persistence.",
    answer: `Register bắt đầu ở RegisterView.fxml: người dùng chọn role Bidder hoặc Seller, nhập họ tên, username, password và confirm password. RegisterController chịu trách nhiệm validate UX: thiếu field, password không khớp, role không hợp lệ. Sau đó controller tạo RegisterRequest từ module common và gọi AuthClientService. Vì DTO nằm trong common, client và server cùng hiểu field nào được gửi, tránh mỗi bên tự định nghĩa payload khác nhau.

Server nhận MessageType.REGISTER tại AuthRequestHandler và gọi AuthService. AuthService mới là nguồn sự thật: kiểm username trùng, không cho public UI tạo ADMIN, hash password bằng BCrypt, tạo user theo role và gọi SQLiteUserDao để insert vào bảng users. Khi thành công server trả RegisterResponse. Bản mới của app không tự chuyển ngay về Login; nó giữ user ở Register, khóa form/hiện thông báo thành công để tránh submit trùng và yêu cầu bấm Back to Login. Đây là UX rõ ràng, không thay đổi bảo mật.

Khi trả lời vấn đáp, nhấn mạnh: client validate để user dễ dùng, server validate để bảo mật. Nếu username trùng hoặc role sai, server phải reject kể cả client bị sửa. Nếu password lưu plain text thì khi database lộ, toàn bộ tài khoản mất an toàn; vì vậy BCrypt là bắt buộc. Test liên quan là AuthServiceTest; manual case là đăng ký username mới, username trùng, password confirm sai.`,
    answerBullets: [
      "Mở RegisterView và RegisterController để chỉ input/validation.",
      "Nói RegisterRequest là contract common.",
      "Nói AuthService hash BCrypt và chặn ADMIN public.",
      "Nói SQLiteUserDao insert user.",
      "Nói UX mới: đăng ký xong ở lại màn Register, bấm Back to Login.",
    ],
    mustMention: ["RegisterController", "RegisterRequest", "AuthRequestHandler", "AuthService", "SQLiteUserDao", "BCrypt"],
    commonMistakes: ["Quên confirm password là client UX validation.", "Nói client có thể quyết định role ADMIN.", "Không nói username trùng được xử lý ở server."],
    followUps: ["Register có tạo session luôn không?", "Tại sao DTO không để trong client?", "Admin account được tạo từ đâu nếu public UI không cho tạo?"],
  },
  {
    id: "client-server-boundary",
    level: "Kiến trúc",
    topic: "Client-server boundary",
    tags: ["Design", "Architecture", "Security"],
    filePath: "client/src/main/java/com/auction/client/socket/SocketClient.java",
    lineRefs: [
      { line: 1, code: "SocketClient.sendRequest", explain: "Client chỉ gửi request qua socket, không gọi DAO hay SQLite." },
      { line: 1, code: "ClientHandler", explain: "Server nhận JSON request từ mỗi client connection." },
      { line: 1, code: "RequestRouter", explain: "Server route và kiểm quyền trước khi vào business handler." },
    ],
    prompts: [
      "Client-server boundary của project nằm ở đâu?",
      "Vì sao JavaFX client không được kết nối SQLite trực tiếp?",
      "Nếu bỏ server và cho client tự sửa database thì rủi ro gì?",
      "Giải thích boundary qua SocketClient, ClientHandler và RequestRouter.",
      "Boundary này giúp bảo mật role Bidder/Seller/Admin như thế nào?",
      "Boundary này giúp nhóm chia việc và test ra sao?",
      "Khi một request sai quyền được gửi từ tool ngoài UI, server xử lý thế nào?",
      "Client service và server service khác nhau ở điểm nào?",
      "Nếu giảng viên hỏi vì sao dùng client-server cho app local, em trả lời sao?",
      "Nói một ví dụ cụ thể chứng minh client không phải nguồn sự thật.",
    ],
    intent: "Ép thành viên phân biệt rõ UI/client service với server business rule và persistence.",
    answer: `Boundary nằm ở socket protocol: phía client dừng tại SocketClient và các client service; phía server bắt đầu từ ClientHandler, RequestRouter, các handler và service. JavaFX client chỉ render UI, lấy input, tạo DTO và gửi Request. Nó không có quyền đọc/ghi SQLite trực tiếp. Server mới giữ database, session, role, owner check, transaction và notification. Đây là điểm phải nhấn mạnh vì hệ thống đấu giá có nhiều client cùng thao tác; nếu mỗi client tự sửa DB thì có thể gian lận giá, sửa phiên của seller khác, bỏ qua wallet hoặc phá trạng thái auction.

Ví dụ PLACE_BID: LiveBiddingController chỉ lấy amount, AuctionClientService gửi request, SocketClient serialize JSON. Server ClientHandler đọc JSON, RequestRouter kiểm token/role, BidRequestHandler gọi BidService. BidService kiểm auction active, giá tối thiểu, seller không tự bid, wallet đủ tiền, lock theo auction và DAO ghi DB. Client chỉ nhận kết quả và cập nhật UI. Vì thế boundary giúp bảo mật và cũng giúp test: service server có thể unit test độc lập với UI, DAO test độc lập với controller.

Khi trả lời, tránh nói chung chung “client gửi server”. Hãy nêu cụ thể file và trách nhiệm: SocketClient là cầu nối; ClientHandler đọc stream; RequestRouter là cổng bảo vệ; service server mới là nơi business rule thật sự chạy.`,
    answerBullets: [
      "Client chỉ UI + DTO + socket request.",
      "Server giữ session, role, business rule và SQLite.",
      "RequestRouter là điểm chặn request sai quyền.",
      "Service server test được độc lập với UI.",
      "Ví dụ place bid chứng minh client không phải nguồn sự thật.",
    ],
    mustMention: ["SocketClient", "ClientHandler", "RequestRouter", "Server service", "DAO", "SQLite"],
    commonMistakes: ["Gọi AuctionClientService là business service.", "Không nói role/owner check.", "Bỏ qua transaction và concurrency khi nói boundary."],
    followUps: ["Boundary này liên quan DTO như thế nào?", "Nếu server down thì client nên hiển thị gì?", "Có thể thay socket bằng HTTP không?"],
  },
  {
    id: "protocol-contract",
    level: "Cơ bản",
    topic: "Request, Response, MessageType và DTO",
    tags: ["Protocol", "DTO", "Gson", "Socket"],
    filePath: "common/src/main/java/com/auction/common/protocol/MessageType.java",
    lineRefs: [
      { line: 1, code: "enum MessageType", explain: "Danh sách command/event mà client và server cùng hiểu." },
      { line: 1, code: "Request<T>", explain: "Envelope gửi qua socket gồm type, token/requestId và payload." },
      { line: 1, code: "Response<T>", explain: "Envelope trả về gồm success/message/payload." },
    ],
    prompts: [
      "MessageType, Request, Response và DTO liên hệ với nhau như thế nào?",
      "Vì sao cần requestId trong socket request/response?",
      "Khi thêm một chức năng mới, phải sửa những phần nào của protocol?",
      "DTO khác domain model ở điểm nào?",
      "Vì sao module common chứa protocol và DTO?",
      "Nếu client gửi thiếu field trong JSON thì lỗi nên xử lý ở đâu?",
      "Realtime event dùng Response hay DTO nào?",
      "Nói contract của PLACE_BID từ client sang server.",
      "Gson giúp gì và có rủi ro gì trong project này?",
      "Khi vấn đáp, em mở file nào để chứng minh protocol thống nhất?",
    ],
    intent: "Giúp thành viên hiểu giao tiếp socket không phải truyền object tùy tiện mà có contract rõ.",
    answer: `MessageType là tên hành động hoặc event: LOGIN, PLACE_BID, SET_AUTO_BID, BID_UPDATE, AUCTION_CLOSED... Request là envelope client gửi lên, thường gồm type, token/requestId và payload. Payload là DTO cụ thể như LoginRequest, PlaceBidRequest, CreateAuctionRequest. Response là envelope server trả về, gồm success, message và payload kết quả như LoginResponse, PlaceBidResponse hoặc DTO detail. DTO nằm trong common để client và server compile cùng contract, không lệch tên field hay kiểu dữ liệu.

RequestId quan trọng vì socket là connection dài và response có thể về bất đồng bộ. SocketClient cần map requestId với CompletableFuture đang chờ. Nếu không có requestId, client khó biết response nào thuộc thao tác nào khi nhiều request gửi gần nhau. Với realtime event, server có thể gửi message không bắt nguồn từ một request trực tiếp; payload event như BidUpdateEvent hoặc AuctionEventDto để UI cập nhật.

Khi thêm feature mới, phải đi theo checklist: thêm MessageType, thêm DTO request/response nếu cần, thêm client service method, thêm handler/router case, thêm server service/DAO logic, thêm test. Lỗi phổ biến là chỉ thêm UI button nhưng quên MessageType hoặc handler, dẫn đến request không route được.`,
    answerBullets: [
      "MessageType định danh hành động.",
      "Request bọc type/token/requestId/payload.",
      "Response bọc success/message/payload.",
      "DTO là contract common, model là domain nội bộ.",
      "Thêm feature phải sửa đủ client service, router/handler, service và test.",
    ],
    mustMention: ["MessageType", "Request", "Response", "DTO", "Gson", "requestId"],
    commonMistakes: ["Nhầm DTO với Entity/domain model.", "Quên requestId khi nói socket async.", "Chỉ nói MessageType mà không nói payload."],
    followUps: ["Nếu payload parse lỗi thì trả response thế nào?", "Event realtime khác response thường ở đâu?", "DTO có nên chứa password hash không?"],
  },
  {
    id: "auction-list-detail",
    level: "Flow",
    topic: "Auction list và Auction detail",
    tags: ["Flow", "Client UI", "Auction", "DAO"],
    filePath: "client/src/main/java/com/auction/client/controller/AuctionListController.java",
    lineRefs: [
      { line: 1, code: "AuctionListController", explain: "Render danh sách phiên và điều hướng sang detail." },
      { line: 1, code: "AuctionDetailController", explain: "Hiển thị ảnh, seller, giá hiện tại, status và bid history." },
      { line: 1, code: "SQLiteAuctionDao", explain: "Server query auction summary/detail từ SQLite." },
    ],
    prompts: [
      "Luồng xem danh sách auction đi từ UI đến DB như thế nào?",
      "Auction detail lấy những dữ liệu gì và từ đâu?",
      "Vì sao AuctionListController không tự query SQLite?",
      "Khi user click một auction, app điều hướng và load detail ra sao?",
      "Bid history và ảnh trong detail được xử lý bởi file nào?",
      "Nếu danh sách auction không cập nhật sau bid, em trace ở đâu?",
      "AuctionSummaryDto khác AuctionDetailDto ở điểm nào?",
      "Status auction trên UI được map thế nào?",
      "Nói cách server lọc/sắp xếp auction list.",
      "Manual demo nào chứng minh list/detail hoạt động đúng?",
    ],
    intent: "Giúp học viên nói được flow đọc dữ liệu auction thay vì chỉ mô tả card UI.",
    answer: `Auction list bắt đầu ở AuctionListView/AuctionListController. Controller gọi AuctionClientService để gửi request lấy danh sách qua SocketClient. Server nhận request tại AuctionRequestHandler, gọi AuctionService hoặc DAO tương ứng để lấy dữ liệu từ SQLiteAuctionDao. Kết quả trả về thường là AuctionSummaryDto: đủ để render card như title, status, current price, seller, end time, item type. Client render danh sách và khi user chọn một phiên thì SceneManager/Controller chuyển sang AuctionDetailController với auctionId.

Auction detail cần dữ liệu sâu hơn: thông tin item, sellerUsername, starting/current price, bid history, status, thời gian kết thúc và ảnh. AuctionDetailController nhận AuctionDetailDto, dùng ImageUrlUtil để chuẩn hóa URL ảnh từ asset server, dùng BidTimeline/PriceChartManager để biến bid history thành timeline/chart. Status hiển thị nên đi qua AuctionStatusUi để label/CSS nhất quán. Client không query SQLite vì DB boundary thuộc server.

Nếu list/detail không cập nhật, trace theo thứ tự: controller có gọi load không, client service có gửi đúng MessageType không, handler server có trả DTO không, DAO query có đúng status/time không, UI có update trên JavaFX thread không. Với realtime, kiểm NotificationService có broadcast AUCTION_LIST_UPDATED/BID_UPDATE và SocketClient listener có nhận event không.`,
    answerBullets: [
      "List dùng AuctionSummaryDto, detail dùng AuctionDetailDto.",
      "Controller gọi client service, client service gọi socket.",
      "Server handler/service/DAO mới đọc SQLite.",
      "ImageUrlUtil và BidTimeline hỗ trợ detail.",
      "Realtime event có thể làm list/detail refresh.",
    ],
    mustMention: ["AuctionListController", "AuctionDetailController", "AuctionClientService", "AuctionRequestHandler", "SQLiteAuctionDao", "AuctionSummaryDto", "AuctionDetailDto"],
    commonMistakes: ["Nói detail chỉ lấy từ list card.", "Quên ImageUrlUtil/BidTimeline.", "Không phân biệt summary với detail DTO."],
    followUps: ["Nếu ảnh không load thì trace file nào?", "Nếu auction đã CLOSED thì UI hiển thị thế nào?", "DAO test nào liên quan auction query?"],
  },
  {
    id: "create-edit-auction",
    level: "Flow",
    topic: "Seller create/update/cancel auction",
    tags: ["Flow", "Seller", "Auction", "Factory"],
    filePath: "client/src/main/java/com/auction/client/controller/CreateAuctionController.java",
    lineRefs: [
      { line: 1, code: "CreateAuctionRequest", explain: "DTO chứa thông tin item và phiên đấu giá seller gửi lên server." },
      { line: 1, code: "ItemFactory", explain: "Server tạo đúng subclass item theo ItemType." },
      { line: 1, code: "AuctionService", explain: "Nơi kiểm owner/status/price/time và ghi item+auction." },
    ],
    prompts: [
      "Seller tạo auction mới đi qua những file nào?",
      "ItemFactory được dùng ở đâu trong create auction?",
      "Vì sao seller update/cancel phải kiểm owner và status ở server?",
      "CreateAuctionRequest chứa những nhóm dữ liệu nào?",
      "Nếu seller cố sửa auction đã có bid thì server nên xử lý sao?",
      "Luồng chọn ảnh khi tạo auction liên quan file nào?",
      "Cancel auction khác update auction ở rule nghiệp vụ nào?",
      "SellerCenter refresh sau create/cancel như thế nào?",
      "Test/manual case nào nên demo cho seller flow?",
      "Nếu thêm loại item mới thì create auction phải sửa những đâu?",
    ],
    intent: "Giúp thành viên nắm seller workflow và business rule owner/status.",
    answer: `Seller create bắt đầu ở CreateAuctionView và CreateAuctionController. Controller đọc form item title/description/type/condition, starting price, reserve/end time và ảnh nếu có. Nó validate nhanh cho UX, sau đó tạo CreateAuctionRequest và gọi AuctionClientService. Request đi qua socket tới AuctionRequestHandler. Server không tin client; AuctionService kiểm user hiện tại có role SELLER, dữ liệu giá/thời gian hợp lệ, rồi dùng ItemFactory để tạo đúng subclass Electronics/Art/Vehicle theo ItemType. Sau đó service ghi item và auction qua DAO trong thứ tự nhất quán.

Update/cancel cũng phải đi qua server rule. Seller chỉ được sửa auction thuộc sở hữu của mình và thường chỉ khi trạng thái/điều kiện cho phép, ví dụ chưa có bid hoặc chưa đóng. Nếu chỉ ẩn nút trên UI mà server không kiểm owner/status, người dùng có thể gửi request thủ công để sửa phiên của người khác. Cancel cần phát event cập nhật list/detail nếu có client đang xem.

Khi hỏi thêm loại item mới, câu trả lời nên nói OCP: thêm enum ItemType, subclass model, mapping trong ItemFactory, field FXML/controller nếu form cần dữ liệu riêng, DAO mapping nếu schema cần thêm cột, và test ItemFactoryTest/AuctionServiceTest.`,
    answerBullets: [
      "Controller đọc form và tạo CreateAuctionRequest.",
      "AuctionService kiểm role seller, price, time, owner/status.",
      "ItemFactory tạo đúng subclass item.",
      "DAO ghi item trước rồi auction.",
      "Update/cancel phải có event refresh và test owner/status.",
    ],
    mustMention: ["CreateAuctionController", "EditAuctionController", "CreateAuctionRequest", "AuctionRequestHandler", "AuctionService", "ItemFactory"],
    commonMistakes: ["Nói Factory nằm ở client.", "Quên owner/status check.", "Không nói ảnh upload/asset nếu form có image."],
    followUps: ["Nếu auction đã có bid thì sửa field nào bị cấm?", "Admin cancel khác seller cancel thế nào?", "ItemFactoryTest chứng minh gì?"],
  },
  {
    id: "place-bid-flow",
    level: "Demo",
    topic: "Place bid end-to-end",
    tags: ["Flow", "Bid", "Wallet", "Realtime", "Transaction"],
    filePath: "server/src/main/java/com/auction/server/service/BidService.java",
    lineRefs: [
      { line: 1, code: "placeBid", explain: "Method trung tâm kiểm rule đặt giá." },
      { line: 1, code: "AuctionLockManager", explain: "Khóa theo auctionId để tránh lost update." },
      { line: 1, code: "notificationService.broadcast", explain: "Sau commit, server báo realtime cho client đang xem." },
    ],
    prompts: [
      "Khi bidder bấm Place Bid, dữ liệu đi qua những lớp nào?",
      "BidService kiểm những rule nào trước khi chấp nhận bid?",
      "Vì sao place bid phải lock theo auction?",
      "Wallet lock/release xuất hiện ở đâu trong luồng đặt giá?",
      "Sau khi bid thành công, client khác biết bằng cách nào?",
      "Nếu bid thấp hơn minimum thì lỗi trả về UI thế nào?",
      "Nói transaction boundary của một bid hợp lệ.",
      "Seller có được bid chính auction của mình không?",
      "Manual demo hai bidder cùng bid nên giải thích ra sao?",
      "Test nào bảo vệ place bid khỏi race condition?",
    ],
    intent: "Đây là luồng trọng tâm của đồ án; thành viên phải nói được đầy đủ UI, server rule, DB và realtime.",
    answer: `Place bid bắt đầu từ màn detail/live bidding. Controller lấy amount, validate nhanh định dạng số, rồi AuctionClientService gửi PlaceBidRequest qua SocketClient với MessageType.PLACE_BID. Server nhận ở BidRequestHandler, lấy userId từ session, rồi gọi BidService.placeBid. BidService là nơi quan trọng nhất: lấy lock theo auctionId, đọc auction/current price, kiểm auction active, bidder không phải seller của auction, amount đạt minimum increment, bidder đủ available balance và request không vi phạm rate/business rule.

Khi bid hợp lệ, service phải xử lý nhiều state cùng nhau: insert bid history, update currentPrice/highestBidder của auction, lock thêm tiền cho bidder mới, release locked funds cho leader cũ nếu bị outbid, có thể extend endTime nếu anti-sniping, rồi commit. Notification nên gửi sau khi state đã nhất quán; nếu gửi trước commit mà DB rollback thì client sẽ thấy dữ liệu ảo. Sau commit, NotificationService broadcast BID_UPDATE hoặc TIME_EXTENDED để các client đang subscribe cập nhật price/timeline/countdown.

Nếu lỗi, server trả Response error rõ message; client hiển thị bằng NotificationManager/label, không tự sửa state như đã bid thành công. Khi demo, mở BidService, AuctionLockManager, WalletService, SQLiteBidDao/SQLiteAuctionDao và NotificationService. Test cần nhắc: BidServiceTest cho rule, BidServiceConcurrencyTest/ConcurrentBidTest cho race, BidServiceTransactionTest cho rollback.`,
    answerBullets: [
      "Đi từ LiveBidding/AuctionDetail controller đến AuctionClientService và SocketClient.",
      "BidRequestHandler lấy session user và gọi BidService.",
      "BidService kiểm active, owner, minimum price, wallet, lock.",
      "DAO + wallet update phải nằm trong boundary nhất quán.",
      "NotificationService broadcast sau khi state hợp lệ.",
    ],
    mustMention: ["PlaceBidRequest", "BidRequestHandler", "BidService", "AuctionLockManager", "WalletService", "SQLiteBidDao", "NotificationService"],
    commonMistakes: ["Chỉ nói update giá mà quên wallet.", "Quên seller không được bid auction của mình.", "Nói notification trước khi commit là bình thường."],
    followUps: ["Nếu hai bidder bid cùng lúc thì lock hoạt động thế nào?", "Auto-bid chạy trước hay sau manual bid?", "Anti-sniping extend endTime ở đâu?"],
  },
  {
    id: "wallet-escrow",
    level: "Hỏi xoáy",
    topic: "Wallet escrow, lockedBalance và settlement",
    tags: ["Wallet", "Settlement", "Business rule"],
    filePath: "server/src/main/java/com/auction/server/service/WalletService.java",
    lineRefs: [
      { line: 1, code: "lockFunds", explain: "Giữ tiền khi bidder đang dẫn đầu." },
      { line: 1, code: "releaseFunds", explain: "Hoàn tiền bị giữ khi bidder bị vượt giá hoặc auction bị hủy." },
      { line: 1, code: "settleAuction", explain: "Chuyển tiền winner -> seller khi auction kết thúc hợp lệ." },
    ],
    prompts: [
      "lockedBalance dùng để làm gì trong hệ thống đấu giá?",
      "Khi bidder bị outbid thì tiền được xử lý như thế nào?",
      "Vì sao chỉ kiểm balance tổng là chưa đủ?",
      "Deposit/withdraw khác lock/release ở điểm nào?",
      "Settlement khi auction kết thúc chạy ở service nào?",
      "Nếu settlement lỗi giữa chừng thì hệ thống tránh sai tiền ra sao?",
      "WalletService liên quan BidService như thế nào?",
      "Admin/seller cancel auction thì locked funds xử lý thế nào?",
      "Test nào nên mở để nói về ví?",
      "Nếu user withdraw số tiền đang locked thì server có cho không?",
    ],
    intent: "Giúp học viên hiểu tiền trong auction là invariant quan trọng, không chỉ là label UI.",
    answer: `Wallet có hai số phải phân biệt: balance là tổng tiền trong tài khoản, lockedBalance là phần đang bị giữ vì user đang dẫn đầu một hoặc nhiều auction. Available balance thường hiểu là balance - lockedBalance. Nếu chỉ kiểm balance tổng, user có thể dùng cùng một số tiền để dẫn đầu nhiều phiên hoặc withdraw tiền đang cần thanh toán. Vì vậy BidService phải gọi WalletService.lockFunds khi bid trở thành leader, releaseFunds cho leader cũ khi bị outbid, và settlement khi phiên kết thúc.

Deposit/withdraw là thao tác trực tiếp của user với ví. Lock/release/settle là thao tác nghiệp vụ do hệ thống đấu giá gọi. Withdraw phải kiểm available, không được rút phần locked. Khi auction bị cancel hoặc user bị outbid, releaseFunds giảm lockedBalance để tiền trở lại available. Khi auction kết thúc có winner, AuctionManagerService hoặc settlement flow gọi WalletService để chuyển tiền từ winner sang seller và release phần dư nếu có.

Nếu settlement lỗi, không được đánh dấu PAID sai. AuctionManagerService cần lưu trạng thái FINISHED/attempt/nextRetry để retry idempotent. Test cần nhắc là WalletServiceTest, AuctionSettlementTest và BidServiceTransactionTest. Khi trả lời, hãy nói invariant: không mất tiền, không tạo tiền, không để lockedBalance âm, không để auction PAID khi transfer chưa xong.`,
    answerBullets: [
      "Phân biệt balance, lockedBalance và available.",
      "Bid leader bị lock tiền; outbid thì release.",
      "Withdraw chỉ được dùng available balance.",
      "Settlement chuyển winner -> seller khi auction hợp lệ.",
      "Retry settlement để không đánh dấu PAID sai.",
    ],
    mustMention: ["WalletService", "lockFunds", "releaseFunds", "settleAuction", "BidService", "AuctionManagerService"],
    commonMistakes: ["Nói lockedBalance chỉ để hiển thị.", "Quên release tiền leader cũ.", "Không nói retry khi settlement fail."],
    followUps: ["Auto-bid lock tiền max hay tiền hiện tại?", "Nếu auction bị cancel thì refund thế nào?", "Test nào kiểm insufficient funds?"],
  },
  {
    id: "concurrency-lock",
    level: "Defense",
    topic: "Concurrency và AuctionLockManager",
    tags: ["Concurrency", "Race condition", "Lock", "Bid"],
    filePath: "server/src/main/java/com/auction/server/concurrency/AuctionLockManager.java",
    lineRefs: [
      { line: 1, code: "lock auctionId", explain: "Serialize các bid cùng một auction nhưng cho auction khác chạy song song." },
      { line: 1, code: "BidService.placeBid", explain: "Business rule đọc và ghi current price trong vùng cần bảo vệ." },
      { line: 1, code: "BidServiceConcurrencyTest", explain: "Test chứng minh nhiều bid song song không làm lost update." },
    ],
    prompts: [
      "Nếu bỏ AuctionLockManager thì lỗi gì xảy ra khi hai bidder bid cùng lúc?",
      "Vì sao lock theo auctionId tốt hơn synchronized toàn service?",
      "Database transaction đã đủ để tránh lost update chưa?",
      "Giải thích race condition trong place bid bằng timeline.",
      "ConcurrentBidTest hoặc BidServiceConcurrencyTest chứng minh điều gì?",
      "Lock được lấy ở layer nào và release khi nào?",
      "Nếu lock không release thì hệ thống gặp lỗi gì?",
      "Tại sao vẫn cho hai auction khác nhau bid song song?",
      "Khi demo concurrency, em nói invariant nào?",
      "Nếu bid thấp ghi sau bid cao thì UI sẽ sai ra sao?",
    ],
    intent: "Giúp thành viên trả lời được câu hỏi khó nhất về race condition trong đấu giá.",
    answer: `Race condition xảy ra khi hai request cùng đọc currentPrice cũ, cùng thấy bid của mình hợp lệ, rồi ghi kết quả theo thứ tự không kiểm soát. Ví dụ A bid 120 và B bid 110 cùng đọc currentPrice 100. Nếu B ghi sau A, currentPrice cuối có thể thành 110 dù 120 mới đúng. Transaction giúp một nhóm update nhất quán, nhưng nếu cả hai transaction đều dựa trên dữ liệu cũ và không serialize đúng thì vẫn có lost update hoặc rule check sai.

AuctionLockManager giải quyết bằng lock theo auctionId. Các bid trên cùng một auction phải chạy tuần tự: request sau đợi request trước commit xong rồi đọc currentPrice mới. Nhưng bid trên auction khác không liên quan thì vẫn chạy song song, nên tốt hơn synchronized toàn BidService vì không bóp hiệu năng toàn hệ thống. Lock phải đặt quanh đoạn đọc auction, validate, update bid/auction/wallet và release trong finally để tránh deadlock.

Khi trả lời, nói invariant: mỗi auction chỉ có một current leader hợp lệ tại một thời điểm; currentPrice cuối phải là bid hợp lệ cao nhất theo rule; wallet locked phải khớp leader. Test cần mở là BidServiceConcurrencyTest hoặc ConcurrentBidTest. Nếu test fail, demo hai client cùng bid có thể hiện giá sai hoặc timeline mâu thuẫn.`,
    answerBullets: [
      "Mô tả timeline lost update.",
      "Nói transaction chưa đủ nếu rule check đọc dữ liệu cũ.",
      "Lock theo auctionId serialize đúng phạm vi.",
      "Lock phải release trong finally.",
      "Test concurrency chứng minh currentPrice/leader đúng.",
    ],
    mustMention: ["AuctionLockManager", "LockRegistry", "BidService", "BidServiceConcurrencyTest", "lost update"],
    commonMistakes: ["Nói cứ có SQLite transaction là đủ.", "Dùng synchronized toàn service mà không nói tradeoff.", "Quên wallet cũng nằm trong invariant."],
    followUps: ["Lock theo user có đúng không?", "Nếu auto-bid chạy bên trong bid thì lock có cần không?", "Có thể dùng optimistic locking không?"],
  },
  {
    id: "transaction-rollback",
    level: "Defense",
    topic: "Transaction boundary và rollback",
    tags: ["Transaction", "Rollback", "DAO", "Wallet"],
    filePath: "server/src/main/java/com/auction/server/service/BidService.java",
    lineRefs: [
      { line: 1, code: "BEGIN/COMMIT/ROLLBACK", explain: "Boundary DB để nhiều update cùng thành công hoặc cùng thất bại." },
      { line: 1, code: "BidServiceTransactionTest", explain: "Test ép lỗi persistence để chứng minh rollback." },
      { line: 1, code: "notification after commit", explain: "Không nên gửi event khi dữ liệu chưa chắc commit." },
    ],
    prompts: [
      "Transaction boundary trong place bid bao quanh những thao tác nào?",
      "Nếu insert bid thành công nhưng update auction fail thì nguy hiểm gì?",
      "Vì sao notification nên gửi sau commit?",
      "BidServiceTransactionTest chứng minh điều gì?",
      "Rollback khác releaseFunds ở điểm nào?",
      "DAO lỗi giữa chừng thì UI nên nhận gì?",
      "Transaction boundary liên quan wallet lockedBalance thế nào?",
      "Nếu transaction quá rộng thì có tradeoff gì?",
      "Auction settlement cần transaction/idempotency ra sao?",
      "Khi vấn đáp, em giải thích ACID bằng ví dụ nào trong project?",
    ],
    intent: "Giúp thành viên hiểu consistency, không chỉ nói 'có transaction'.",
    answer: `Trong một bid hợp lệ, không chỉ có insert vào bảng bids. Hệ thống còn phải update auction currentPrice/highestBidder/endTime nếu anti-sniping, lock tiền bidder mới, release tiền leader cũ và có thể tạo auto-bid. Transaction boundary phải bao quanh các thay đổi DB liên quan để không có trạng thái nửa vời: có bid history nhưng auction price không đổi, hoặc wallet bị lock nhưng bid không tồn tại.

Rollback nghĩa là nếu một bước persistence fail, các thay đổi DB trước đó phải quay lại. ReleaseFunds là business operation hoàn tiền locked trong trường hợp hợp lệ như outbid/cancel; không nên nhầm với rollback kỹ thuật. Notification nên gửi sau commit vì nếu gửi BID_UPDATE trước rồi transaction fail, client sẽ cập nhật giá ảo. Đây là lỗi demo rất khó giải thích.

BidServiceTransactionTest dùng tình huống DAO/failing persistence để chứng minh invariant không bị phá khi lỗi giữa chừng. Khi trả lời ACID, dùng ví dụ: atomicity là bid, auction và wallet cùng thành công hoặc cùng rollback; consistency là currentPrice/leader/lockedBalance không mâu thuẫn; isolation kết hợp lock tránh race; durability là commit xuống SQLite.`,
    answerBullets: [
      "Nêu các state cùng thay đổi trong một bid.",
      "Rollback khi persistence fail, không để nửa cập nhật.",
      "Không nhầm rollback với releaseFunds nghiệp vụ.",
      "Notification gửi sau khi dữ liệu nhất quán.",
      "Dùng BidServiceTransactionTest làm bằng chứng.",
    ],
    mustMention: ["BidService", "Database", "BidServiceTransactionTest", "WalletService", "NotificationService"],
    commonMistakes: ["Chỉ nói transaction là commit/rollback mà không nêu state.", "Gửi event trước commit.", "Quên wallet trong transaction consistency."],
    followUps: ["SQLite WAL/foreign key giúp gì?", "Transaction boundary ở settlement khác place bid thế nào?", "Nếu rollback rồi client nhận gì?"],
  },
  {
    id: "auto-bid",
    level: "Hỏi xoáy",
    topic: "Auto-bidding",
    tags: ["Auto-bid", "Bid", "Wallet", "DAO"],
    filePath: "server/src/main/java/com/auction/server/service/BidService.java",
    lineRefs: [
      { line: 1, code: "setAutoBid", explain: "Lưu hoặc cập nhật rule maxBid/increment của bidder." },
      { line: 1, code: "triggerAutoBids", explain: "Sau bid mới, server xét rule auto-bid để phản hồi." },
      { line: 1, code: "SQLiteAutoBidDao", explain: "Lưu rule auto_bids theo auction và bidder." },
    ],
    prompts: [
      "Auto-bid hoạt động như thế nào từ UI đến server?",
      "maxBid và increment có ý nghĩa gì?",
      "Vì sao auto-bid phải chạy ở server chứ không ở client?",
      "Khi bidder khác đặt giá, hệ thống chọn rule auto-bid thắng như thế nào?",
      "Auto-bid làm sao tránh vượt maxBid?",
      "Wallet check khi set auto-bid nên hiểu thế nào?",
      "Nếu auto-bid tạo vòng lặp thì nguy hiểm gì?",
      "SQLiteAutoBidDao lưu dữ liệu gì?",
      "Manual demo auto-bid nên làm ra sao?",
      "Test nào chứng minh auto-bid không phá bid thường?",
    ],
    intent: "Giúp trả lời tính năng nâng cao proxy bidding một cách dễ hiểu.",
    answer: `Auto-bid là proxy bidding: bidder đặt trước giới hạn maxBid và increment. UI trong LiveBiddingController gửi SetAutoBidRequest qua AuctionClientService. Server BidRequestHandler/BidService.setAutoBid kiểm auction active, user không phải seller, số tiền hợp lệ và khả năng ví, rồi lưu rule qua SQLiteAutoBidDao. Rule gồm auctionId, bidderId, maxBid, increment và active status.

Sau một manual bid hợp lệ, BidService gọi triggerAutoBids. Server đọc các rule active của auction, bỏ qua người vừa bid để tránh tự phản hồi chính mình, chọn rule có khả năng trả giá cao nhất, tính nextBid theo currentPrice/increment nhưng không vượt maxBid. Sau đó placeAutoStep cập nhật auction/bid/wallet tương tự bid thường và broadcast event. Làm ở server là bắt buộc vì client có thể tắt app, sửa code hoặc gửi gian lận; server mới giữ rule thật và ví thật.

Khi demo, mở hai bidder: A set auto-bid max 500, B bid thấp hơn, hệ thống tự tạo bid phản hồi cho A. Cần nói rõ auto-bid không tạo vòng lặp vô hạn: nó có điều kiện dừng khi không rule nào vượt currentPrice hoặc nextBid vượt max. Nếu wallet unavailable hoặc rule lỗi, server disable/xóa rule để không kẹt. Test nên nhắc BidServiceTest cho auto-bid và wallet insufficient.`,
    answerBullets: [
      "Auto-bid là server-side proxy bidding.",
      "SetAutoBidRequest lưu maxBid/increment vào SQLiteAutoBidDao.",
      "triggerAutoBids chạy sau manual bid hợp lệ.",
      "nextBid không vượt maxBid và không tự bid lại chính người vừa bid.",
      "Wallet và notification vẫn phải nhất quán như bid thường.",
    ],
    mustMention: ["SetAutoBidRequest", "AutoBidRule", "SQLiteAutoBidDao", "BidService.setAutoBid", "triggerAutoBids"],
    commonMistakes: ["Nói auto-bid chạy ở client.", "Quên maxBid là giới hạn cứng.", "Không nói cách tránh loop."],
    followUps: ["Nếu hai auto-bid cùng max thì xử lý thế nào?", "Có cần lock auction khi auto-bid không?", "Auto-bid có kích hoạt anti-sniping không?"],
  },
  {
    id: "anti-sniping",
    level: "Demo",
    topic: "Anti-sniping và TIME_EXTENDED",
    tags: ["Anti-sniping", "Realtime", "Scheduler", "Bid"],
    filePath: "server/src/main/java/com/auction/server/service/BidService.java",
    lineRefs: [
      { line: 1, code: "extendEndTime", explain: "Kéo dài thời gian khi bid sát giờ kết thúc." },
      { line: 1, code: "MessageType.TIME_EXTENDED", explain: "Event realtime để client cập nhật countdown." },
      { line: 1, code: "AuctionManagerService", explain: "Scheduler phải đọc endTime mới khi đóng auction." },
    ],
    prompts: [
      "Anti-sniping giải quyết vấn đề gì trong đấu giá?",
      "Khi bid trong cửa sổ cuối, server thay đổi dữ liệu nào?",
      "Client đang xem phiên biết endTime mới bằng cách nào?",
      "Vì sao anti-sniping phải nằm ở server?",
      "Scheduler close auction liên quan gì đến anti-sniping?",
      "Demo anti-sniping nên chuẩn bị dữ liệu ra sao?",
      "Nếu TIME_EXTENDED không tới client thì user thấy lỗi gì?",
      "Anti-sniping có ảnh hưởng auto-bid không?",
      "Line/code nào nên mở để giải thích rule kéo dài giờ?",
      "Test nào chứng minh anti-sniping hoạt động?",
    ],
    intent: "Giúp học viên nói rõ rule nâng cao và event realtime liên quan.",
    answer: `Anti-sniping ngăn việc bidder chờ sát giây cuối mới bid khiến người khác không kịp phản ứng. Rule của project là nếu bid hợp lệ xuất hiện trong cửa sổ cuối, server kéo dài endTime thêm một khoảng, ví dụ 120 giây. Rule phải nằm ở BidService/server vì server giữ thời gian thật của auction; nếu để client quyết định thì mỗi client có thể tự hiển thị khác nhau hoặc gian lận không extend.

Khi bid sát giờ, BidService sau khi validate bid sẽ update auctions.end_time qua DAO/AuctionService, sau đó NotificationService broadcast TIME_EXTENDED hoặc BidUpdateEvent có endTime mới. Client đang subscribe nhận event qua SocketClient, controller live bidding/detail cập nhật countdown và thông báo. Scheduler trong AuctionManagerService không được đóng auction theo thời gian cũ; nó phải đọc endTime mới từ database.

Khi demo, tạo auction thời gian ngắn hoặc chỉnh fixture gần hết giờ, mở hai client, đặt bid trong cửa sổ cuối, chỉ ra countdown tăng và server log/event. Nếu TIME_EXTENDED không tới client, server state vẫn đúng nhưng UI stale; user tưởng auction sắp đóng. Test liên quan BidServiceTest hoặc manual case anti-sniping.`,
    answerBullets: [
      "Anti-sniping chống bid sát giây cuối.",
      "Server update endTime, không để client tự quyết.",
      "NotificationService gửi TIME_EXTENDED.",
      "Client cập nhật countdown qua socket event.",
      "Scheduler đóng theo endTime mới trong DB.",
    ],
    mustMention: ["BidService", "endTime", "TIME_EXTENDED", "NotificationService", "AuctionManagerService"],
    commonMistakes: ["Nói chỉ UI cộng thêm thời gian.", "Quên scheduler đọc endTime mới.", "Không nói event realtime về client."],
    followUps: ["Nếu không có client subscribe thì sao?", "Anti-sniping có nên gửi cùng BID_UPDATE không?", "Rule kéo dài bao nhiêu giây nằm ở đâu?"],
  },
  {
    id: "realtime-notification",
    level: "Kiến trúc",
    topic: "Realtime subscription và NotificationService",
    tags: ["Realtime", "Observer", "Socket", "Event"],
    filePath: "server/src/main/java/com/auction/server/service/NotificationService.java",
    lineRefs: [
      { line: 1, code: "subscribe", explain: "Client đăng ký nhận event cho auction hoặc nhóm event." },
      { line: 1, code: "broadcast", explain: "Server gửi event tới các writer đang subscribe." },
      { line: 1, code: "SocketClient event listener", explain: "Client thread nhận event và cập nhật UI đúng thread." },
    ],
    prompts: [
      "Realtime bidding được triển khai bằng cơ chế nào?",
      "NotificationService thể hiện Observer pattern ra sao?",
      "SUBSCRIBE_AUCTION và UNSUBSCRIBE_AUCTION dùng để làm gì?",
      "Nếu client disconnect mà không unsubscribe thì rủi ro gì?",
      "BID_UPDATE khác TIME_EXTENDED và AUCTION_CLOSED thế nào?",
      "Client nhận event realtime ở đâu?",
      "Vì sao realtime tốt hơn polling trong live bidding?",
      "Nếu UI stale sau bid, em trace từ đâu?",
      "ClientHandlerIntegrationTest chứng minh phần nào của realtime?",
      "NotificationManager liên quan gì đến system notification?",
    ],
    intent: "Giúp học viên hiểu server push event và observer thay vì nghĩ client refresh thủ công.",
    answer: `Realtime của project là server push qua socket connection đang mở. Client gửi SUBSCRIBE_AUCTION khi vào màn detail/live bidding; SubscriptionRequestHandler đăng ký writer/client handler vào NotificationService theo auctionId. Khi BidService/AuctionService thay đổi state quan trọng như bid mới, auction closed, time extended hoặc list updated, service gọi NotificationService.broadcast. NotificationService đóng vai trò subject trong Observer pattern; các client subscribe là observers.

SocketClient có listener thread đọc cả response cho request thường và event server push. Với event UI, client phải chuyển update về JavaFX Application Thread bằng Platform.runLater hoặc cơ chế tương đương; nếu cập nhật trực tiếp từ socket thread sẽ lỗi hoặc UI không ổn định. NotificationManager xử lý toast/system notification trong app, còn các controller như AuctionDetail/LiveBidding cập nhật price/timeline/countdown.

Khi debug stale UI, trace: client đã subscribe đúng auctionId chưa, server có lưu subscriber không, BidService có broadcast sau commit không, SocketClient listener còn sống không, controller có đăng ký callback không, UI update có chạy đúng thread không. Client disconnect phải cleanup subscriber/writer để tránh gửi vào socket chết. Test nên nhắc ClientHandlerIntegrationTest và SocketClientIntegrationTest.`,
    answerBullets: [
      "Client subscribe khi vào màn cần realtime.",
      "NotificationService giữ observers/subscribers.",
      "Service broadcast sau thay đổi state.",
      "SocketClient listener nhận event và UI update đúng JavaFX thread.",
      "Disconnect phải cleanup subscriber.",
    ],
    mustMention: ["NotificationService", "SubscriptionRequestHandler", "SocketClient", "BID_UPDATE", "TIME_EXTENDED", "AUCTION_CLOSED"],
    commonMistakes: ["Nhầm realtime với polling refresh.", "Quên unsubscribe/cleanup khi disconnect.", "Không nói JavaFX thread."],
    followUps: ["Event có cần requestId không?", "Nếu nhiều admin mở panel thì USER_LIST_UPDATED gửi cho ai?", "Notification gửi trước commit có rủi ro gì?"],
  },
  {
    id: "scheduler-settlement",
    level: "Defense",
    topic: "AuctionManagerService, close auction và settlement retry",
    tags: ["Scheduler", "Settlement", "Retry", "Wallet"],
    filePath: "server/src/main/java/com/auction/server/service/AuctionManagerService.java",
    lineRefs: [
      { line: 1, code: "ScheduledExecutorService", explain: "Server tự quét auction đến hạn, không phụ thuộc client refresh." },
      { line: 1, code: "transition FINISHED/PAID/CANCELED", explain: "Lifecycle state thay đổi khi close và settlement." },
      { line: 1, code: "nextRetryAt", explain: "Retry settlement khi lỗi tạm thời." },
    ],
    prompts: [
      "Vì sao server cần scheduler đóng auction?",
      "AuctionManagerService xử lý auction đến hạn như thế nào?",
      "Settlement retry giải quyết lỗi gì?",
      "Nếu không có client mở app thì auction có được đóng không?",
      "FINISHED, PAID, CANCELED khác nhau thế nào?",
      "Nếu wallet temporarily unavailable khi settle thì không được làm gì?",
      "AuctionSettlementTest chứng minh behavior nào?",
      "Anti-sniping ảnh hưởng scheduler ra sao?",
      "Notification AUCTION_CLOSED được phát lúc nào?",
      "Khi demo close auction, em nói những file nào?",
    ],
    intent: "Giúp học viên trả lời phần background server và state lifecycle.",
    answer: `AuctionManagerService là background service phía server, thường dùng ScheduledExecutorService để định kỳ tìm auction đã đến hạn. Nó không phụ thuộc việc client có refresh hay mở màn detail hay không. Đây là điểm quan trọng: trạng thái auction là trách nhiệm server. Khi auction endTime đã qua, service chuyển state phù hợp, xác định có winner/reserve hay không, gọi settlement ví nếu cần, và phát event AUCTION_CLOSED/AUCTION_LIST_UPDATED cho client đang subscribe.

Settlement không đơn giản là đổi status. Nếu có winner, hệ thống phải chuyển tiền winner -> seller, release locked funds dư và đảm bảo không tạo/mất tiền. Nếu WalletService hoặc DB lỗi tạm thời, không được đánh dấu PAID giả. Thay vào đó auction có thể ở FINISHED với attempt/nextRetryAt để retry sau. Nếu auction không đạt điều kiện bán hoặc bị cancel, locked funds phải refund/release và status chuyển CANCELED.

Anti-sniping liên quan vì scheduler phải dùng endTime mới sau khi bid sát giờ extend. Nếu scheduler giữ thời gian cũ trong memory và đóng luôn thì rule anti-sniping bị phá. Test cần nhắc AuctionManagerServiceTest và AuctionSettlementTest. Khi trả lời, nói lifecycle: RUNNING -> FINISHED -> PAID hoặc CANCELED, và invariant ví phải đúng.`,
    answerBullets: [
      "Scheduler server-side đóng auction dù client không mở.",
      "Đọc endTime/status từ DB, tôn trọng anti-sniping.",
      "Settlement chuyển tiền và release locked funds.",
      "Retry khi lỗi tạm thời, không đánh dấu PAID sai.",
      "Broadcast AUCTION_CLOSED/list update sau state hợp lệ.",
    ],
    mustMention: ["AuctionManagerService", "ScheduledExecutorService", "WalletService", "AuctionSettlementTest", "PAID", "CANCELED"],
    commonMistakes: ["Nói client refresh mới đóng auction.", "Quên retry settlement.", "Nhầm FINISHED với PAID."],
    followUps: ["Nếu server tắt lúc auction đến hạn thì sao?", "nextRetryAt có tác dụng gì?", "Auction không có bid thì settlement thế nào?"],
  },
  {
    id: "admin-panel",
    level: "Flow",
    topic: "Admin users và admin auctions",
    tags: ["Admin", "Authorization", "UI", "Management"],
    filePath: "client/src/main/java/com/auction/client/controller/AdminPanelController.java",
    lineRefs: [
      { line: 1, code: "AdminPanelController", explain: "Render bảng user/auction và gọi admin service." },
      { line: 1, code: "AdminRequestHandler.requireAdmin", explain: "Server kiểm role ADMIN trước thao tác quản trị." },
      { line: 1, code: "UpdateUserStatusRequest", explain: "DTO bật/tắt trạng thái user." },
    ],
    prompts: [
      "Admin panel có những chức năng chính nào?",
      "Admin disable user đi qua những lớp nào?",
      "Admin cancel auction khác seller cancel ở đâu?",
      "Vì sao request admin phải check role ở server?",
      "Nếu bidder gửi ADMIN_GET_USERS bằng tool riêng thì sao?",
      "USER_LIST_UPDATED event dùng khi nào?",
      "Admin không được deactivate chính admin vì sao?",
      "AdminClientService khác AdminRequestHandler thế nào?",
      "Manual demo admin nên làm ra sao?",
      "Test nào chứng minh request sai role bị chặn?",
    ],
    intent: "Giúp thành viên nói được admin flow và server-side authorization.",
    answer: `AdminPanelController render hai nhóm chính: quản lý user và quản lý auction. Khi admin bấm disable/enable user, controller tạo UpdateUserStatusRequest và gọi AdminClientService. Client service gửi MessageType admin qua SocketClient. Server RequestRouter hoặc AdminRequestHandler gọi requireAdmin để đảm bảo token thuộc user ADMIN. Sau đó handler/service/DAO cập nhật active status trong SQLiteUserDao và có thể broadcast USER_LIST_UPDATED để các admin panel khác refresh.

Admin cancel auction cũng tương tự nhưng tác động auction. Điểm khác seller cancel là admin có quyền cưỡng bức xử lý trường hợp bất thường, còn seller bị giới hạn owner/status/bid count. Tuy vậy admin action vẫn phải qua server rule: không thể chỉ vì UI có nút mà bỏ kiểm tra. Nếu bidder dùng tool riêng gửi ADMIN_GET_USERS, server phải reject trước khi vào DAO.

Khi trả lời demo, mở AdminPanelController để chỉ button/action, AdminClientService để chỉ request, AdminRequestHandler/RequestRouter để chỉ requireAdmin, SQLiteUserDao/AuctionService để chỉ update. Test quan trọng là RequestRouterAuthorizationTest. Rule nên nhắc: admin account không được deactivate để tránh khóa toàn bộ quản trị.`,
    answerBullets: [
      "Admin UI gọi AdminClientService, không tự sửa DB.",
      "Server requireAdmin trước mọi thao tác quản trị.",
      "Disable user update active status qua DAO.",
      "Admin cancel auction là quyền cưỡng bức có rule riêng.",
      "Request sai role bị test bằng RequestRouterAuthorizationTest.",
    ],
    mustMention: ["AdminPanelController", "AdminClientService", "AdminRequestHandler", "RequestRouter", "SQLiteUserDao", "RequestRouterAuthorizationTest"],
    commonMistakes: ["Cho rằng chỉ admin UI mới gửi được request admin.", "Quên server reject bidder/seller.", "Không phân biệt seller cancel và admin cancel."],
    followUps: ["Disable user đang online thì request sau xử lý sao?", "Admin cancel có refund wallet không?", "USER_LIST_UPDATED gửi tới ai?"],
  },
  {
    id: "authorization",
    level: "Defense",
    topic: "Authentication, authorization, role và owner check",
    tags: ["Security", "Role", "Authorization", "Session"],
    filePath: "server/src/main/java/com/auction/server/socket/RequestRouter.java",
    lineRefs: [
      { line: 1, code: "requireAuthenticated", explain: "Request cần login phải có token hợp lệ." },
      { line: 1, code: "requireAdmin / requireSeller", explain: "Server kiểm role trước khi route action nhạy cảm." },
      { line: 1, code: "owner check in service", explain: "Role đúng chưa đủ; resource phải thuộc user." },
    ],
    prompts: [
      "Authentication khác authorization như thế nào trong project?",
      "Role check và owner check khác nhau ở đâu?",
      "Vì sao UI ẩn nút không đủ bảo mật?",
      "RequestRouter chịu trách nhiệm gì?",
      "SessionManager lưu gì và dùng khi nào?",
      "Seller có role SELLER nhưng có được sửa auction của seller khác không?",
      "Bidder có thể gửi request admin bằng tool ngoài UI không?",
      "Authorization test nào nên mở?",
      "Nếu token hết hạn/invalid thì response nên ra sao?",
      "Khi vấn đáp bảo mật, em trả lời theo khung nào?",
    ],
    intent: "Giúp học viên trả lời chắc phần phân quyền, tránh nhầm UI permission với security.",
    answer: `Authentication là xác minh user là ai, diễn ra khi login bằng username/password và tạo session token. Authorization là quyết định user đó được làm gì với resource nào. Trong project, RequestRouter/RouterContext kiểm token và role theo MessageType: admin message cần ADMIN, seller action cần SELLER, bid action cần BIDDER. Nhưng role check chưa đủ. Seller có role SELLER vẫn không được sửa auction của seller khác; owner/resource check phải nằm trong service như AuctionService.

UI ẩn nút chỉ giúp trải nghiệm. Người dùng có thể sửa client, dùng tool riêng hoặc gửi JSON trực tiếp qua socket. Vì vậy server không được tin UI. RequestRouter là cửa đầu tiên để chặn message sai role; handler/service tiếp tục kiểm điều kiện nghiệp vụ. SessionManager map token sang userId/role và invalidate khi logout. Nếu token invalid, server trả Unauthorized/Response error, client hiển thị thông báo và không cập nhật state như thành công.

Khi trả lời, dùng ví dụ: bidder gửi ADMIN_GET_USERS. Dù AdminPanel không hiện trên UI bidder, request thủ công vẫn tới server được; RequestRouter/requireAdmin phải reject trước DAO. Test cần mở là RequestRouterAuthorizationTest. Câu kết: bảo mật nằm ở server boundary, UI chỉ là lớp thuận tiện.`,
    answerBullets: [
      "Authentication xác minh danh tính; authorization kiểm quyền.",
      "Role check ở router/handler, owner check ở service.",
      "UI ẩn nút không đủ vì client không đáng tin.",
      "SessionManager map token -> user.",
      "RequestRouterAuthorizationTest chứng minh request sai role bị chặn.",
    ],
    mustMention: ["AuthService", "SessionManager", "RequestRouter", "RouterContext", "AuthorizationException", "RequestRouterAuthorizationTest"],
    commonMistakes: ["Nói role check chỉ cần ở UI.", "Quên owner/resource check.", "Nhầm token với password."],
    followUps: ["Disable user sau login thì session cũ có dùng được không?", "Admin có cần owner check không?", "Unauthorized hiển thị ở client thế nào?"],
  },
  {
    id: "javafx-mvc",
    level: "Cơ bản",
    topic: "JavaFX MVC, FXML và controller",
    tags: ["JavaFX", "MVC", "Client UI"],
    filePath: "client/src/main/resources/fxml/AuctionDetailView.fxml",
    lineRefs: [
      { line: 1, code: "fx:controller", explain: "FXML gắn view với controller Java." },
      { line: 1, code: "@FXML", explain: "Controller bind control từ FXML." },
      { line: 1, code: "onAction", explain: "Button/control gọi method xử lý trong controller." },
    ],
    prompts: [
      "MVC trong JavaFX của project thể hiện ở đâu?",
      "FXML, Controller và ClientService mỗi lớp làm gì?",
      "Vì sao controller không nên chứa SQL?",
      "fx:id và @FXML liên hệ thế nào?",
      "onAction trong FXML dùng để làm gì?",
      "Nếu fx:id sai thì lỗi xảy ra như thế nào?",
      "Controller validate input đến mức nào là đủ?",
      "Client service khác controller ở đâu?",
      "SceneManager đóng vai trò gì trong navigation?",
      "Khi demo một màn UI, em mở file theo thứ tự nào?",
    ],
    intent: "Giúp thành viên không chỉ đọc FXML mà hiểu cách view-controller-service nối nhau.",
    answer: `Trong client JavaFX, FXML là View: khai báo layout, control, fx:id, onAction và style class. Controller là lớp Java nhận event, đọc dữ liệu từ control, validate UX và gọi client service. Client service là proxy gửi request qua SocketClient, không chứa UI logic và không truy cập database. Model/DTO nằm ở common hoặc payload response. Đây là MVC theo nghĩa thực dụng cho JavaFX.

Ví dụ AuctionDetailView.fxml có fx:controller trỏ đến AuctionDetailController. Các Label/Button/Table có fx:id để controller inject bằng @FXML. Button có onAction gọi method như handlePlaceBid hoặc mở live bidding. Controller sau đó gọi AuctionClientService để lấy AuctionDetailDto hoặc gửi PlaceBidRequest. Nếu fx:id sai, controller có thể null control và crash khi initialize/update; nếu onAction sai, click không chạy.

Khi vấn đáp, mở FXML trước để chỉ user nhìn/bấm gì, sau đó mở Controller để nói event handler, rồi mở ClientService/SocketClient để chứng minh client không tự xử lý business rule. Tránh nhét SQL hoặc rule phân quyền vào controller; server mới kiểm thật. Manual test là mở màn, click button, kiểm request/response và notification.`,
    answerBullets: [
      "FXML là view, controller là event/UI state.",
      "ClientService gửi socket request, không chứa SQL.",
      "fx:id nối control với @FXML field.",
      "onAction gọi method controller.",
      "Mở FXML -> Controller -> ClientService khi demo UI.",
    ],
    mustMention: ["FXML", "fx:controller", "@FXML", "onAction", "Controller", "ClientService"],
    commonMistakes: ["Nói controller là nơi xử lý business rule server.", "Không biết fx:id sai gây null.", "Bỏ qua client service/socket."],
    followUps: ["Vì sao dùng FXML thay vì code UI thuần?", "JavaFX thread ảnh hưởng controller thế nào?", "CSS nằm ở đâu?"],
  },
  {
    id: "javafx-thread",
    level: "Hỏi xoáy",
    topic: "JavaFX Application Thread và async UI",
    tags: ["JavaFX", "Threading", "CompletableFuture", "Realtime"],
    filePath: "client/src/main/java/com/auction/client/socket/SocketClient.java",
    lineRefs: [
      { line: 1, code: "CompletableFuture", explain: "Request socket trả kết quả bất đồng bộ cho controller." },
      { line: 1, code: "Platform.runLater", explain: "Cập nhật UI phải chạy trên JavaFX Application Thread." },
      { line: 1, code: "SocketListener", explain: "Thread nền đọc response/event từ server." },
    ],
    prompts: [
      "Vì sao cập nhật UI JavaFX phải dùng Platform.runLater?",
      "SocketClient listener thread khác JavaFX Application Thread như thế nào?",
      "CompletableFuture giúp client request/response ra sao?",
      "Nếu cập nhật Label từ socket thread thì lỗi gì có thể xảy ra?",
      "Realtime event về client nên xử lý thread như thế nào?",
      "Controller nên làm gì trong thenAccept/exceptionally?",
      "Làm sao tránh UI freeze khi gọi server?",
      "NotificationManager liên quan Platform.runLater thế nào?",
      "Khi debug UI không cập nhật, em kiểm thread ở đâu?",
      "Test nào gián tiếp kiểm async socket client?",
    ],
    intent: "Giúp thành viên trả lời phần async/UI thread rất hay bị hỏi ở JavaFX.",
    answer: `JavaFX chỉ cho cập nhật scene graph trên JavaFX Application Thread. SocketClient có listener thread riêng để đọc network response/event; thread này không được trực tiếp setText, add node, update chart. Nếu làm sai, app có thể throw exception, UI không cập nhật ổn định hoặc lỗi khó tái hiện. Vì vậy controller hoặc utility phải dùng Platform.runLater khi chạm vào control JavaFX.

CompletableFuture giúp client không block UI khi gửi request. Controller gọi service, service gửi socket request và trả Future. Khi response về, thenAccept xử lý kết quả; phần cập nhật UI nên bọc runLater hoặc được helper đảm bảo chạy đúng thread. Exceptionally dùng để hiển thị lỗi rõ, không nuốt exception. Realtime event như BID_UPDATE/TIME_EXTENDED cũng tương tự: listener nhận event nền, sau đó dispatch update UI.

Khi vấn đáp, nói rõ hai luồng: UI thread xử lý input/render, socket thread xử lý IO. Không gọi server blocking trên UI thread vì sẽ freeze app. File cần mở: SocketClient, controller có CompletableFuture, NotificationManager hoặc AppShellController có Platform.runLater. Test liên quan SocketClientIntegrationTest; manual case là tắt server hoặc bid realtime xem UI vẫn phản hồi.`,
    answerBullets: [
      "JavaFX scene graph chỉ update trên JavaFX Application Thread.",
      "SocketClient listener chạy thread nền.",
      "CompletableFuture tránh block UI.",
      "thenAccept xử lý response; UI update cần runLater.",
      "Exception path phải hiển thị notification/message.",
    ],
    mustMention: ["Platform.runLater", "SocketClient", "CompletableFuture", "NotificationManager", "JavaFX Application Thread"],
    commonMistakes: ["Cập nhật UI trực tiếp từ socket thread.", "Gọi network blocking trong button handler.", "Nuốt exception khiến UI im lặng."],
    followUps: ["Có thể dùng Task/Service JavaFX không?", "Nếu Future complete sau khi màn đã đổi thì sao?", "Làm sao cleanup listener?"],
  },
  {
    id: "notification-ui",
    level: "UI",
    topic: "NotificationManager, toast và UiMotion",
    tags: ["UI", "Notification", "UiMotion", "Polish"],
    filePath: "client/src/main/java/com/auction/client/util/NotificationManager.java",
    lineRefs: [
      { line: 1, code: "NotificationManager.showToast", explain: "Tạo toast trong cửa sổ app, không phải dialog rời rạc." },
      { line: 1, code: "UiMotion.install", explain: "Cài micro-interaction cho button sau khi FXML load." },
      { line: 1, code: "AppShellController toastHost", explain: "Shell giữ vùng hiển thị toast toàn cục." },
    ],
    prompts: [
      "NotificationManager dùng để làm gì?",
      "Toast trong app khác Alert dialog ở điểm nào?",
      "SYSTEM_NOTIFICATION được hiển thị ra UI như thế nào?",
      "UiMotion giải quyết vấn đề gì?",
      "Vì sao UiMotion không nên đổi onAction của button?",
      "SceneManager liên quan UiMotion thế nào?",
      "Nếu toast không hiện sau bid, em trace từ đâu?",
      "Progress line trong toast có ý nghĩa gì?",
      "UI polish có ảnh hưởng business rule không?",
      "Khi demo UI polish, em nói file nào?",
    ],
    intent: "Giúp thành viên giải thích phần polish UI mới mà vẫn phân biệt với nghiệp vụ server.",
    answer: `NotificationManager là utility tập trung cho feedback người dùng: success, warning, error, system notification, auction closed, time extended. Thay vì mỗi controller tự tạo Alert hoặc label riêng, app dùng toastHost trong AppShell để hiển thị toast nằm trong cửa sổ app, xếp chồng, có style theo loại và progress line để user biết nó tự biến mất. NotificationManager cũng lắng nghe một số event realtime để biến payload server thành thông báo dễ hiểu.

UiMotion là utility riêng cho micro-interaction của button: hover, press, focus-visible. SceneManager gọi UiMotion sau khi load FXML để các button có cảm giác mượt mà thống nhất. Điểm phải nhấn mạnh: UiMotion chỉ can thiệp visual state như scale/effect/style class, không đổi onAction, không gọi service, không quyết định business rule. Nếu helper đổi handler, nó sẽ làm click bị mất hoặc hành vi UI khó debug.

Khi toast không hiện, trace: AppShellController có set toastHost cho NotificationManager chưa, event có tới SocketClient không, NotificationManager có nhận event không, Platform.runLater có chạy không, CSS class có bị thiếu không. Khi demo, mở NotificationManager, AppShellController, UiMotion, SceneManager và common.css/shell.css.`,
    answerBullets: [
      "NotificationManager gom feedback/toast toàn app.",
      "ToastHost nằm trong AppShell.",
      "Realtime/system event có thể tạo toast.",
      "UiMotion chỉ polish visual, không đổi handler.",
      "SceneManager cài UiMotion sau khi load FXML.",
    ],
    mustMention: ["NotificationManager", "AppShellController", "UiMotion", "SceneManager", "toastHost", "Platform.runLater"],
    commonMistakes: ["Nói UiMotion là logic nghiệp vụ.", "Quên toastHost trong AppShell.", "Dùng Alert blocking cho mọi feedback."],
    followUps: ["Toast có nên dùng cho lỗi validation form không?", "Nếu user đổi màn thì toastHost còn không?", "CSS nào style progress line?"],
  },
  {
    id: "image-assets",
    level: "Flow",
    topic: "Image upload và AssetServer",
    tags: ["Image", "Asset", "HTTP", "Client UI"],
    filePath: "server/src/main/java/com/auction/server/socket/AssetServer.java",
    lineRefs: [
      { line: 1, code: "FileUtil", explain: "Client chọn và validate file ảnh từ máy." },
      { line: 1, code: "AssetServer", explain: "Server phục vụ ảnh upload qua HTTP riêng." },
      { line: 1, code: "ImageUrlUtil", explain: "Client chuẩn hóa URL để JavaFX load đúng ảnh." },
    ],
    prompts: [
      "Ảnh sản phẩm được xử lý như thế nào từ client đến hiển thị?",
      "Vì sao không nhồi binary ảnh trực tiếp vào socket nghiệp vụ?",
      "AssetServer dùng để làm gì?",
      "ImageUrlUtil giải quyết lỗi gì?",
      "Nếu ảnh không hiện ở AuctionDetail thì trace từ đâu?",
      "Seller chọn ảnh khi tạo auction liên quan file nào?",
      "Server lưu path ảnh hay bytes ảnh?",
      "HTTP asset server khác TCP socket nghiệp vụ ở đâu?",
      "Manual test ảnh nên làm như thế nào?",
      "Nếu đường dẫn ảnh sai thì UI nên fallback ra sao?",
    ],
    intent: "Giúp học viên giải thích media asset là luồng riêng, không trộn với JSON protocol.",
    answer: `Ảnh là dữ liệu media nên project tách khỏi socket nghiệp vụ. Client dùng FileUtil để chọn/validate file ảnh khi seller tạo hoặc sửa auction. Request nghiệp vụ chỉ nên gửi metadata/path hoặc dữ liệu đã được server xử lý, không nên nhồi binary lớn vào JSON newline vì sẽ làm protocol nặng, khó parse và dễ block luồng socket. Server lưu ảnh trong uploads hoặc resource tương ứng, rồi AssetServer phục vụ ảnh qua HTTP port riêng.

Khi client cần hiển thị ảnh ở list/detail, DTO trả về image path/url. ImageUrlUtil chuẩn hóa URL để JavaFX ImageView load đúng từ asset server, xử lý trường hợp path tương đối, thiếu host hoặc ảnh mặc định. AuctionDetailController/AuctionListController chỉ dùng URL đã normalize, không tự đoán đường dẫn filesystem server.

Nếu ảnh không hiện, trace: file có được chọn và copy/upload không, server có lưu path vào DB/DTO không, AssetServer có chạy port 8081 không, URL trong response là gì, ImageUrlUtil normalize ra sao, JavaFX có quyền tải HTTP không. Manual test: tạo auction có ảnh, mở detail từ client khác, kiểm ảnh vẫn load qua asset server.`,
    answerBullets: [
      "FileUtil chọn/validate ảnh ở client.",
      "Socket JSON không nên chở binary ảnh lớn.",
      "AssetServer phục vụ ảnh qua HTTP riêng.",
      "ImageUrlUtil normalize URL trước khi JavaFX load.",
      "Trace ảnh qua file -> server path -> DTO -> URL -> ImageView.",
    ],
    mustMention: ["FileUtil", "AssetServer", "ImageUrlUtil", "AuctionDetailController", "uploads"],
    commonMistakes: ["Nói ảnh nằm trong database dưới dạng blob.", "Quên asset server port.", "Client dùng filesystem path của server."],
    followUps: ["Nếu deploy khác máy thì URL ảnh cần đổi gì?", "Có cần validate loại file không?", "Ảnh mặc định xử lý ở đâu?"],
  },
  {
    id: "database-dao",
    level: "Cơ bản",
    topic: "SQLite schema và DAO mapping",
    tags: ["Database", "DAO", "SQLite", "Repository"],
    filePath: "server/src/main/java/com/auction/server/dao/sqlite/SQLiteAuctionDao.java",
    lineRefs: [
      { line: 1, code: "schema.sql", explain: "Định nghĩa bảng, khóa ngoại và index." },
      { line: 1, code: "SQLiteAuctionDao", explain: "Map row SQLite thành Auction/domain DTO." },
      { line: 1, code: "SQLite*DaoTest", explain: "Test mapping SQL với SQLite thật." },
    ],
    prompts: [
      "DAO trong project có vai trò gì?",
      "SQLiteAuctionDao map dữ liệu như thế nào?",
      "Schema chính của hệ thống gồm những bảng nào?",
      "Vì sao service không nên viết SQL trực tiếp?",
      "Foreign key giúp gì trong quan hệ user/item/auction/bid?",
      "Index nào quan trọng cho auction list hoặc scheduler?",
      "DAO test khác service test ở đâu?",
      "Nếu mapping sai status auction thì UI bị gì?",
      "Database initialization diễn ra khi server boot ra sao?",
      "Khi vấn đáp DB, em mở file nào trước?",
    ],
    intent: "Giúp học viên nói được persistence layer và không nhầm DAO với business service.",
    answer: `DAO là boundary giữa service và SQLite. Service nói bằng nghiệp vụ như create auction, place bid, find active auctions; DAO chịu trách nhiệm SQL cụ thể, PreparedStatement, ResultSet mapping và exception persistence. Schema gồm users, items, auctions, bids, auto_bids và các cột balance/lockedBalance/status/endTime... Foreign key giữ quan hệ seller-item, item-auction, auction-bids, bidder-bids. Index trên status, sellerId, auctionId, endTime giúp list/scheduler/history nhanh hơn.

SQLiteAuctionDao đọc row auctions và map sang Auction hoặc DTO summary/detail. Nếu mapping sai status/currentPrice/endTime, UI có thể hiển thị phiên đang RUNNING thành CLOSED, scheduler đóng sai, hoặc bidder bid vào phiên không hợp lệ. Vì vậy DAO test dùng SQLite thật để kiểm SQL và mapping, khác service test vốn tập trung business rule và có thể dùng fake DAO.

Khi server boot, Database/SchemaInitializer tạo schema nếu chưa có, bật foreign key/WAL/timeout nếu cấu hình. Khi vấn đáp, mở schema.sql để nói bảng, mở SQLiteAuctionDao/SQLiteBidDao để nói query, rồi mở service để nói vì sao SQL được gọi từ business rule chứ không từ controller.`,
    answerBullets: [
      "DAO che SQL khỏi service.",
      "Schema có users/items/auctions/bids/auto_bids.",
      "Foreign key giữ quan hệ domain.",
      "Index hỗ trợ list/scheduler/history.",
      "DAO test kiểm SQL mapping với SQLite thật.",
    ],
    mustMention: ["schema.sql", "SchemaInitializer", "SQLiteAuctionDao", "SQLiteBidDao", "SQLiteUserDao", "DAO tests"],
    commonMistakes: ["Nhầm DAO là nơi kiểm business rule.", "Không nói PreparedStatement/mapping.", "Quên foreign key/index."],
    followUps: ["SQLite phù hợp demo nhưng hạn chế production gì?", "DAO interface giúp test service thế nào?", "Transaction đặt ở DAO hay service?"],
  },
  {
    id: "factory-oop",
    level: "Kiến trúc",
    topic: "OOP model và ItemFactory",
    tags: ["OOP", "Factory", "Pattern", "SOLID", "Item"],
    filePath: "server/src/main/java/com/auction/server/factory/ItemFactory.java",
    lineRefs: [
      { line: 1, code: "User -> Bidder/Seller/Admin", explain: "Kế thừa mô hình hóa role người dùng." },
      { line: 1, code: "Item -> Electronics/Art/Vehicle", explain: "Kế thừa mô hình hóa loại sản phẩm." },
      { line: 1, code: "ItemFactory.create", explain: "Factory tạo subclass đúng theo ItemType." },
    ],
    prompts: [
      "Project thể hiện OOP inheritance ở đâu?",
      "Vì sao cần ItemFactory thay vì new trực tiếp trong AuctionService?",
      "User -> Bidder/Seller/Admin giúp gì?",
      "Item -> Electronics/Art/Vehicle thể hiện đa hình như thế nào?",
      "OCP liên quan ItemFactory ra sao?",
      "LSP trong model Item nên hiểu thế nào?",
      "ModelInheritanceTest chứng minh điều gì?",
      "Nếu thêm loại item mới thì sửa những file nào?",
      "DTO và domain model khác nhau trong OOP boundary thế nào?",
      "Khi vấn đáp OOP, em tránh trả lời chung chung ra sao?",
    ],
    intent: "Giúp học viên gắn OOP yêu cầu môn học với code thật.",
    answer: `OOP trong project thể hiện rõ ở domain model common: Entity là base, User có Bidder/Seller/Admin, Item có Electronics/Art/Vehicle, Auction và BidTransaction mô tả nghiệp vụ đấu giá. Kế thừa giúp biểu diễn field/hành vi chung và riêng; ví dụ mọi User có id/username/fullName/role nhưng Bidder/Seller/Admin có ý nghĩa nghiệp vụ khác nhau. DTO thì khác: DTO ưu tiên ổn định để truyền JSON, không nhất thiết chứa toàn bộ hành vi domain.

ItemFactory nằm ở server để AuctionService không phải tự if/else new từng subclass khắp nơi. Khi CreateAuctionRequest có ItemType, AuctionService gọi factory tạo đúng item. Điều này thể hiện OCP: thêm loại item mới thì mở rộng enum/subclass/factory mapping và test, không sửa rải rác mọi flow đấu giá. LSP nghĩa là nơi cần Item chung vẫn dùng được Electronics/Art/Vehicle mà không phá invariant như sellerId/name/condition.

Khi trả lời, mở ItemFactory, Item subclasses và ModelInheritanceTest/ItemFactoryTest. Đừng chỉ nói “có kế thừa”; hãy nói kế thừa phục vụ yêu cầu domain nào, factory giảm coupling ở service nào, test nào chứng minh tạo đúng subclass.`,
    answerBullets: [
      "Nêu User và Item inheritance.",
      "DTO khác domain model.",
      "ItemFactory tạo subclass theo ItemType.",
      "OCP: thêm loại item mới không sửa rải rác.",
      "ModelInheritanceTest/ItemFactoryTest là bằng chứng.",
    ],
    mustMention: ["Entity", "User", "Bidder", "Seller", "Admin", "Item", "ItemFactory", "ItemFactoryTest"],
    commonMistakes: ["Chỉ đọc sơ đồ class mà không nói nghiệp vụ.", "Nhầm DTO với domain model.", "Không nói OCP khi thêm loại item."],
    followUps: ["Có cần subclass Bidder/Seller không nếu đã có role enum?", "Factory có phải Factory Method chuẩn không?", "LSP fail trong trường hợp nào?"],
  },
  {
    id: "solid-layering",
    level: "Defense",
    topic: "SOLID và layered architecture",
    tags: ["SOLID", "Design", "Layer", "Testability"],
    filePath: "server/src/main/java/com/auction/server/service/AuctionService.java",
    lineRefs: [
      { line: 1, code: "Controller -> ClientService -> Handler -> ServerService -> DAO", explain: "Chuỗi layer tách trách nhiệm." },
      { line: 1, code: "DAO interfaces", explain: "Service phụ thuộc abstraction để dễ test." },
      { line: 1, code: "ItemFactory", explain: "OCP khi mở rộng loại item." },
    ],
    prompts: [
      "SOLID thể hiện trong project như thế nào?",
      "SRP thể hiện qua Controller, Service, DAO ra sao?",
      "DIP giúp test BidService như thế nào?",
      "ISP thể hiện ở các DAO interface tách riêng ra sao?",
      "OCP thể hiện qua ItemFactory như thế nào?",
      "Nếu gộp controller, service và DAO thì hại gì?",
      "Layered architecture giúp nhóm chia việc ra sao?",
      "Khi thêm feature mới, em đi qua layer nào?",
      "SOLID nào quan trọng nhất với dự án này?",
      "Nêu một điểm tradeoff của việc tách nhiều layer.",
    ],
    intent: "Giúp học viên trả lời thiết kế bằng code thật, không học thuộc định nghĩa SOLID.",
    answer: `SRP: Controller lo UI/input, ClientService lo protocol, Handler lo route request, ServerService lo business rule, DAO lo SQL mapping. Nếu gộp lại, một bug UI có thể kéo theo SQL, khó test và khó chia việc. DIP: service phụ thuộc interface DAO như BidDao/AuctionDao/UserDao thay vì SQLite class cụ thể, nên test có thể dùng fake/failing DAO để ép rollback. ISP: DAO tách theo aggregate, service chỉ phụ thuộc nhóm method cần dùng, không có DatabaseService khổng lồ.

OCP thể hiện rõ qua ItemFactory và ItemType: thêm item mới mở rộng mapping/subclass/test thay vì sửa mọi nơi. LSP liên quan các subclass Item/User phải dùng được ở nơi code cần base class mà không phá invariant. Layered architecture giúp nhóm chia việc: người làm UI chỉ cần DTO/client service, người làm server service test business rule, người làm DAO test SQL.

Tradeoff là nhiều file hơn và phải giữ contract rõ giữa layer. Nhưng với đồ án đấu giá có role, wallet, realtime, concurrency, việc tách layer giúp vấn đáp tốt hơn: có thể lần từ UI đến DB và chỉ ra trách nhiệm từng file. Khi thêm feature, đi theo checklist DTO/MessageType -> client service/controller -> handler/router -> service -> DAO -> test.`,
    answerBullets: [
      "SRP tách UI/protocol/rule/SQL.",
      "DIP service phụ thuộc DAO interface.",
      "ISP DAO tách theo aggregate.",
      "OCP qua ItemFactory.",
      "Tradeoff là nhiều file nhưng dễ test/chia việc.",
    ],
    mustMention: ["SRP", "DIP", "ISP", "OCP", "Controller", "Service", "DAO", "DTO"],
    commonMistakes: ["Định nghĩa SOLID sách giáo khoa mà không chỉ file.", "Nói càng nhiều layer càng tốt mà không tradeoff.", "Quên testability."],
    followUps: ["Có chỗ nào vi phạm SRP nhẹ không?", "Nếu đổi SQLite sang DB khác thì layer nào đổi?", "SOLID liên quan clean architecture không?"],
  },
  {
    id: "error-handling",
    level: "Debug",
    topic: "Exception, Response error và validation",
    tags: ["Error handling", "Validation", "Response", "Client UI"],
    filePath: "common/src/main/java/com/auction/common/protocol/Response.java",
    lineRefs: [
      { line: 1, code: "BusinessException", explain: "Exception nghiệp vụ có message rõ cho client." },
      { line: 1, code: "Response.error", explain: "Server trả lỗi có cấu trúc thay vì crash socket thread." },
      { line: 1, code: "NotificationManager", explain: "Client hiển thị lỗi cho user." },
    ],
    prompts: [
      "Validation nên đặt ở client hay server?",
      "BusinessException khác crash RuntimeException ở đâu?",
      "Response.error giúp client xử lý lỗi như thế nào?",
      "Nếu bid thiếu amount hoặc amount sai thì lỗi đi đâu?",
      "GlobalExceptionHandler phía client dùng để làm gì?",
      "Khi server parse JSON lỗi thì không nên làm gì?",
      "Thông báo lỗi nên hiển thị bằng toast hay label?",
      "Vì sao message lỗi cần rõ nhưng không lộ thông tin nhạy cảm?",
      "Test nào nên có cho validation?",
      "Khi demo lỗi đặt bid thiếu tiền, em giải thích flow nào?",
    ],
    intent: "Giúp học viên nói được error path, phần thường bị bỏ qua khi chỉ demo happy path.",
    answer: `Validation có hai tầng. Client validate để UX nhanh: field rỗng, số tiền không parse được, password confirm sai. Server validate để bảo mật và consistency: role, owner, auction active, minimum bid, wallet available, username trùng, payload thiếu field. Không được chỉ tin client vì client có thể bị sửa hoặc request gửi trực tiếp qua socket.

BusinessException/ValidationException/AuthException giúp server phân loại lỗi nghiệp vụ và trả Response.error có message rõ. Client nhận response success=false thì không cập nhật state như thành công; nó hiển thị message bằng NotificationManager, label form hoặc disabled state phù hợp. Nếu malformed JSON, ClientHandler phải bắt lỗi và trả error hoặc đóng connection an toàn, không crash toàn server thread pool.

Khi demo lỗi thiếu tiền, mở WalletService/BidService để chỉ check, Response để chỉ envelope lỗi, controller/NotificationManager để chỉ user thấy message. Cần nói lỗi không nên lộ hash/password/stack trace. Test liên quan BidServiceTest, AuthServiceTest, ClientHandlerIntegrationTest cho malformed/response path.`,
    answerBullets: [
      "Client validation là UX; server validation là nguồn sự thật.",
      "BusinessException trả lỗi nghiệp vụ có cấu trúc.",
      "Response.error giúp client không hiểu nhầm thành công.",
      "Client hiển thị message, không update state sai.",
      "Không lộ stack trace/thông tin nhạy cảm.",
    ],
    mustMention: ["BusinessException", "ValidationException", "Response.error", "GlobalExceptionHandler", "NotificationManager"],
    commonMistakes: ["Chỉ validate ở UI.", "Throw exception làm chết thread socket.", "Hiển thị stack trace cho user."],
    followUps: ["Lỗi auth khác lỗi validation thế nào?", "Có nên dùng exception cho mọi case không?", "Malformed JSON test ở đâu?"],
  },
  {
    id: "maven-ci",
    level: "Cơ bản",
    topic: "Maven multi-module, Java 25 và CI/CD",
    tags: ["Maven", "Build", "CI", "Java 25"],
    filePath: "pom.xml",
    lineRefs: [
      { line: 1, code: "<maven.compiler.release>25</maven.compiler.release>", explain: "Project build bằng Java 25." },
      { line: 1, code: "<modules>common/server/client</modules>", explain: "Parent reactor build module theo thứ tự dependency." },
      { line: 1, code: "mvn clean verify", explain: "Lệnh CI chạy build, test và checkstyle." },
    ],
    prompts: [
      "Maven multi-module của project gồm những module nào?",
      "Vì sao common phải build trước server và client?",
      "Java 25 ảnh hưởng build/run như thế nào?",
      "mvn clean package khác mvn clean verify ở đâu?",
      "client/pom.xml và server/pom.xml khác dependency gì?",
      "GitHub Actions workflow kiểm tra gì?",
      "Release JAR client vì sao tách theo OS?",
      "Cảnh báo native-access JavaFX/JDK 25 có phải lỗi không?",
      "Khi demo local, chạy server/client bằng lệnh nào?",
      "Nếu Maven dùng nhầm JDK thì lỗi gì xảy ra?",
    ],
    intent: "Giúp thành viên trả lời build/deploy, phần thường bị hỏi khi nộp bài.",
    answer: `Parent pom quản lý reactor gồm common, server, client. common chứa model/DTO/protocol nên phải build trước; server và client phụ thuộc common. server có SQLite JDBC, BCrypt, SLF4J/Logback, shade/exec để chạy server JAR. client có JavaFX 25, FXML/CSS resources, Ikonli và dependency native theo OS. Root pom đặt maven.compiler.release 25 và enforcer yêu cầu Java 25, nên máy demo cần JDK 25 đúng JAVA_HOME.

mvn clean package xóa target cũ, compile, test và đóng gói JAR. mvn clean verify chạy thêm phase verify như checkstyle hoặc rule CI, nên dùng trước khi push/nộp. GitHub Actions chạy verify trên push/PR, và khi tag v* thì build release artifacts server/client cho Linux/Windows/macOS. Client JavaFX có native dependency theo OS nên release tách client JAR theo platform.

Cảnh báo native-access của JavaFX/SQLite trên JDK 25 không làm app fail; có thể thêm --enable-native-access nếu muốn log sạch. Khi demo, build bằng mvn clean package, chạy server bằng java -jar server/target/auction-server.jar, chạy client bằng java -jar client/target/auction-client.jar hoặc Maven exec/javafx:run khi dev.`,
    answerBullets: [
      "Root pom là parent reactor common/server/client.",
      "common chứa DTO/protocol nên build trước.",
      "Project yêu cầu Java 25.",
      "package đóng JAR, verify thêm checkstyle/CI checks.",
      "Client JavaFX release tách theo OS.",
    ],
    mustMention: ["pom.xml", "common/pom.xml", "server/pom.xml", "client/pom.xml", "Java 25", "GitHub Actions"],
    commonMistakes: ["Nói JavaFX có sẵn trong JDK.", "Không phân biệt package và verify.", "Quên common là dependency chung."],
    followUps: ["Nếu chỉ chạy test server dùng lệnh nào?", "Native-access warning xử lý sao?", "Release tag v1.0.2 chạy workflow nào?"],
  },
  {
    id: "testing-strategy",
    level: "Demo",
    topic: "Test strategy và cách đọc test",
    tags: ["Test", "JUnit", "Mockito", "Quality"],
    filePath: "server/src/test/java/com/auction/server/service/BidServiceTest.java",
    lineRefs: [
      { line: 1, code: "Arrange", explain: "Setup dữ liệu/fixture/mock/fake DAO." },
      { line: 1, code: "Act", explain: "Gọi method service/socket/DAO cần kiểm." },
      { line: 1, code: "Assert", explain: "Kiểm invariant hoặc response cuối cùng." },
    ],
    prompts: [
      "Khi giảng viên hỏi test chứng minh gì, em trả lời như thế nào?",
      "Unit test khác integration test trong project này ở đâu?",
      "BidServiceConcurrencyTest chứng minh behavior nào?",
      "BidServiceTransactionTest nên giải thích ra sao?",
      "DAO SQLite tests kiểm gì?",
      "SocketClientIntegrationTest kiểm gì?",
      "ItemFactoryTest liên quan design pattern nào?",
      "Nếu test fail thì liên hệ manual demo thế nào?",
      "Mockito/fake DAO dùng để làm gì?",
      "Test strategy của nhóm có đủ bảo vệ demo không?",
    ],
    intent: "Giúp thành viên đọc test như bằng chứng behavior, không chỉ nói số lượng test.",
    answer: `Trả lời test theo Arrange-Act-Assert. Arrange là setup dữ liệu: auction active, bidder có ví, fake DAO, SQLite in-memory hoặc socket test server. Act là hành động: gọi BidService.placeBid, AuctionManager tick, DAO method, SocketClient sendRequest. Assert là invariant: currentPrice đúng, rollback không để DB nửa cập nhật, request sai role bị reject, socket parse response/event đúng. Không nên nói “test này pass” mà phải nói pass nghĩa là behavior nào được bảo vệ.

Unit test tập trung một class/service với mock/fake dependency, ví dụ BidServiceTest. DAO test dùng SQLite thật để kiểm SQL mapping. Integration test kiểm nhiều thành phần hơn, ví dụ ClientHandlerIntegrationTest hoặc SocketClientIntegrationTest đi qua socket/protocol. Concurrency test mô phỏng nhiều thread bid song song; transaction test ép persistence fail; authorization test gửi request sai role.

Khi test fail, nối với demo: BidServiceConcurrencyTest fail thì demo hai bidder có nguy cơ giá sai; RequestRouterAuthorizationTest fail thì bidder có thể gọi admin; DAO test fail thì list/detail sai dữ liệu; SocketClient test fail thì UI không nhận response/event. Đây là cách dùng test làm bằng chứng vấn đáp.`,
    answerBullets: [
      "Luôn nói Arrange-Act-Assert.",
      "Unit/service test khác DAO/integration test.",
      "Mỗi test bảo vệ một behavior demo.",
      "Mock/fake DAO giúp ép lỗi khó tạo bằng UI.",
      "Test fail phải nói feature demo nào có rủi ro.",
    ],
    mustMention: ["JUnit", "Mockito", "BidServiceTest", "DAO tests", "SocketClientIntegrationTest", "Arrange-Act-Assert"],
    commonMistakes: ["Chỉ đọc tên test.", "Không phân biệt unit/integration.", "Không nói invariant được assert."],
    followUps: ["Chạy riêng một test Maven thế nào?", "Test nào dùng SQLite thật?", "Có cần UI test tự động không?"],
  },
  {
    id: "debug-playbook",
    level: "Debug",
    topic: "Debug playbook khi demo lỗi",
    tags: ["Debug", "Troubleshooting", "Demo"],
    filePath: "docs/troubleshooting.md",
    lineRefs: [
      { line: 1, code: "symptom -> layer -> file -> invariant -> test", explain: "Khung debug có thứ tự, tránh đoán mò." },
      { line: 1, code: "logback.xml", explain: "Server/client log giúp tìm handler/service lỗi." },
      { line: 1, code: "manual case", explain: "Tái hiện lỗi bằng thao tác UI cụ thể." },
    ],
    prompts: [
      "Nếu demo lỗi, em trace theo khung nào?",
      "Client login được nhưng không nhận realtime event thì kiểm gì?",
      "Bid bị reject nhưng UI không báo lỗi thì trace đâu?",
      "Auction không tự đóng khi hết giờ thì kiểm service nào?",
      "Ảnh không load thì trace những layer nào?",
      "Database locked hoặc mapping sai thì đọc file nào?",
      "Nếu CI fail nhưng local pass thì xử lý sao?",
      "Khi bug chỉ xảy ra nhiều client cùng lúc thì test nào liên quan?",
      "Log server/client nên dùng để xác nhận gì?",
      "Cách trình bày debug trong vấn đáp sao cho có điểm?",
    ],
    intent: "Giúp thành viên có quy trình xử lý tình huống thay vì hoảng khi demo lỗi.",
    answer: `Khung debug nên là: mô tả symptom người dùng thấy, khoanh vùng layer, mở file đầu tiên hợp lý, kiểm invariant, tái hiện bằng manual case hoặc test. Ví dụ UI không nhận realtime: symptom là price không đổi; layer nghi ngờ là subscription/event/client thread; mở SocketClient, SubscriptionRequestHandler, NotificationService, controller; kiểm client có subscribe đúng auctionId, server có broadcast sau commit, listener còn sống và UI update đúng Platform.runLater.

Nếu bid bị reject nhưng UI không báo lỗi: kiểm Response.error từ server, controller có xử lý success=false không, NotificationManager/label có hiển thị không. Nếu auction không tự đóng: kiểm AuctionManagerService có chạy, endTime trong DB có bị anti-sniping extend, settlement có retry lỗi không. Nếu ảnh không load: kiểm path trong DTO, AssetServer port, ImageUrlUtil normalize và ImageView.

Khi trả lời vấn đáp, đừng nói “em xem log”. Hãy nói log nào chứng minh bước nào: RequestRouter log có request type, service log có business event, DAO/test chứng minh DB state. Kết thúc bằng test/manual case sẽ chạy lại sau fix. Đây là tư duy debug có điểm.`,
    answerBullets: [
      "Mô tả symptom cụ thể.",
      "Khoanh vùng layer trước khi sửa.",
      "Mở file theo flow, không nhảy lung tung.",
      "Kiểm invariant và log/test.",
      "Tái hiện bằng manual case sau fix.",
    ],
    mustMention: ["SocketClient", "NotificationService", "RequestRouter", "AuctionManagerService", "logback", "tests"],
    commonMistakes: ["Đổ lỗi ngay cho UI.", "Không có bước tái hiện.", "Chỉ nói xem log nhưng không nói log nào."],
    followUps: ["Nếu lỗi không tái hiện được thì sao?", "Có nên sửa trực tiếp DB khi demo không?", "Debug race condition khác bug thường thế nào?"],
  },
  {
    id: "demo-script",
    level: "Demo",
    topic: "Kịch bản demo end-to-end",
    tags: ["Demo", "Manual test", "Team"],
    filePath: "README.md",
    lineRefs: [
      { line: 1, code: "java -jar server/target/auction-server.jar", explain: "Chạy server trước để mở socket/DB/scheduler." },
      { line: 1, code: "java -jar client/target/auction-client.jar", explain: "Mở nhiều client để demo realtime." },
      { line: 1, code: "seller -> bidder -> admin", explain: "Kịch bản demo phủ role chính." },
    ],
    prompts: [
      "Nếu chỉ có 3 phút demo, em chọn kịch bản nào?",
      "Demo end-to-end nên phủ những role nào?",
      "Thứ tự chạy server/client và login account ra sao?",
      "Làm sao demo realtime rõ nhất?",
      "Làm sao demo auto-bid hoặc anti-sniping ngắn gọn?",
      "Admin panel nên demo sau hay trước bidding?",
      "Khi demo lỗi insufficient funds, nên nói gì?",
      "Mỗi thành viên nên phụ trách đoạn giải thích nào?",
      "Nếu một bước demo fail thì fallback ra sao?",
      "Kết bài demo nên nhấn mạnh điểm kỹ thuật nào?",
    ],
    intent: "Giúp cả nhóm học theo một script chung, không chỉ học từng file rời rạc.",
    answer: `Kịch bản 3 phút nên đi theo câu chuyện: chạy server, mở hai client bidder và một seller/admin nếu kịp. Seller tạo hoặc dùng auction có sẵn. Bidder A mở detail/live bidding, Bidder B đặt bid cao hơn để A thấy realtime update. Nếu muốn điểm nâng cao, cho A set auto-bid trước rồi B bid thấp hơn max để hệ thống tự phản hồi; hoặc tạo auction gần hết giờ để demo anti-sniping TIME_EXTENDED. Sau đó mở admin panel để disable user hoặc cancel auction nếu còn thời gian.

Khi demo, mỗi bước phải gắn với file/layer: login nói AuthService/SessionManager, create auction nói AuctionService/ItemFactory, bid nói BidService/AuctionLockManager/WalletService, realtime nói NotificationService/SocketClient, admin nói RequestRouter/AdminRequestHandler. Đừng chỉ click UI. Với lỗi insufficient funds, cố tình bid vượt available balance và nói server WalletService reject, client hiển thị Response error.

Fallback nếu demo fail: dùng test làm bằng chứng. Race condition dùng BidServiceConcurrencyTest, rollback dùng BidServiceTransactionTest, auth dùng RequestRouterAuthorizationTest, settlement dùng AuctionSettlementTest. Kết bài nhấn mạnh: client-server boundary, role authorization server-side, transaction/lock/wallet consistency và realtime observer.`,
    answerBullets: [
      "Demo theo story seller -> bidders -> realtime -> admin.",
      "Mỗi click UI phải gắn với file/layer.",
      "Ưu tiên bid realtime vì đó là lõi hệ thống.",
      "Auto-bid/anti-sniping là điểm nâng cao nếu còn thời gian.",
      "Có fallback bằng test nếu UI demo lỗi.",
    ],
    mustMention: ["server jar", "client jar", "BidService", "NotificationService", "AuctionLockManager", "RequestRouter", "tests"],
    commonMistakes: ["Click quá nhiều nhưng không giải thích code.", "Demo data chưa chuẩn bị.", "Không có fallback khi realtime lỗi."],
    followUps: ["Video demo cần quay những màn nào?", "Ai trong nhóm nói phần concurrency?", "Nếu server port bận thì xử lý sao?"],
  },
  {
    id: "seller-center-stats",
    level: "Flow",
    topic: "Seller center, thống kê và quản lý phiên của seller",
    tags: ["Flow", "Seller", "Dashboard", "DAO", "Test"],
    filePath: "client/src/main/java/com/auction/client/controller/SellerCenterController.java",
    lineRefs: [
      { line: 1, code: "SellerCenterController", explain: "Màn tổng hợp phiên của seller, nút tạo/sửa/hủy và thống kê nhanh." },
      { line: 1, code: "SellerAuctionService", explain: "Client service gửi request lấy dữ liệu seller-owned auctions." },
      { line: 1, code: "AuctionService.findBySeller", explain: "Server query theo sellerId lấy từ session, không lấy từ input tùy ý." },
    ],
    prompts: [
      "Seller Center hiển thị những dữ liệu nào và lấy từ đâu?",
      "Vì sao request seller center phải lấy sellerId từ session thay vì từ form?",
      "Luồng refresh danh sách auction của seller chạy qua những file nào?",
      "Các thống kê active/closed/sold/revenue nên tính ở client hay server?",
      "Nếu seller thấy auction của người khác thì bug nằm ở đâu?",
      "Seller Center liên hệ Create/Edit/Cancel auction như thế nào?",
      "Sau khi cancel auction, Seller Center cập nhật lại bằng cơ chế nào?",
      "DAO query seller auctions cần lọc theo những field nào?",
      "Manual test nào chứng minh Seller Center đúng quyền?",
      "Khi vấn đáp, em giải thích Seller Center khác Auction List chung ra sao?",
    ],
    intent: "Giúp thành viên hiểu seller dashboard là view theo quyền sở hữu, không chỉ là bảng danh sách.",
    answer: `Seller Center là màn làm việc của seller sau login. Controller hiển thị các phiên thuộc seller hiện tại, thống kê nhanh như active, pending/closed, sold và doanh thu dự kiến, kèm hành động Create, Edit, Cancel, xem detail. Điểm quan trọng là sellerId không nên lấy từ input client. Client gửi request có token; RequestRouter/Auth layer xác thực session; server service lấy userId/role từ session rồi query auction theo owner. Như vậy nếu user sửa payload thủ công cũng không xem hoặc sửa phiên của seller khác.

Luồng refresh thường đi từ SellerCenterController sang SellerAuctionService hoặc AuctionClientService, qua SocketClient, đến Seller/Auction handler ở server. AuctionService gọi SQLiteAuctionDao để lấy danh sách theo sellerId, status, endTime và có thể join bids để tính currentPrice/winner/revenue. Client chỉ render DTO và điều hướng sang CreateAuctionController hoặc EditAuctionController. Sau create/update/cancel thành công, controller refresh lại list hoặc nhận realtime event để số liệu đồng bộ.

Khi có lỗi seller thấy auction của người khác, trace từ server trước: RequestRouter có kiểm role SELLER không, service có dùng session userId không, DAO có điều kiện WHERE seller_id không, DTO có leak field không. Manual test tốt là đăng nhập hai seller khác nhau, seller A tạo auction, seller B mở Seller Center và không thấy phiên của A; seller B gửi cancel request giả cũng bị reject.`,
    answerBullets: [
      "Seller Center là dashboard theo owner, không phải auction list toàn hệ thống.",
      "sellerId phải lấy từ session server-side.",
      "Controller chỉ render DTO và gọi client service.",
      "DAO cần WHERE seller_id và status/time phù hợp.",
      "Test hai seller khác nhau để chứng minh không leak quyền.",
    ],
    mustMention: ["SellerCenterController", "SellerAuctionService", "RequestRouter", "AuctionService", "SQLiteAuctionDao", "session userId"],
    commonMistakes: ["Cho client truyền sellerId tùy ý.", "Tính quyền sở hữu bằng cách ẩn nút UI.", "Không refresh thống kê sau cancel/update."],
    followUps: ["Nếu seller bị disable thì Seller Center xử lý thế nào?", "Revenue nên tính từ currentPrice hay settlement?", "Có cần phân trang seller auctions không?"],
  },
  {
    id: "app-shell-navigation",
    level: "UI",
    topic: "AppShell, SceneManager và điều hướng theo role",
    tags: ["UI", "Flow", "Design", "Authorization", "Debug"],
    filePath: "client/src/main/java/com/auction/client/controller/AppShellController.java",
    lineRefs: [
      { line: 1, code: "AppShellController", explain: "Giữ layout chung: sidebar, topbar, content host và toast host." },
      { line: 1, code: "SceneManager.showScreen", explain: "Điểm chuyển màn và nạp FXML/controller." },
      { line: 1, code: "Role-based navigation", explain: "Menu hiển thị theo role để UX đúng với Bidder/Seller/Admin." },
    ],
    prompts: [
      "AppShellController đóng vai trò gì trong JavaFX client?",
      "SceneManager khác controller màn con ở điểm nào?",
      "Điều hướng sau login dựa vào role diễn ra như thế nào?",
      "Vì sao ẩn menu theo role không thay thế authorization ở server?",
      "Content host và toast host trong AppShell dùng để làm gì?",
      "Khi chuyển màn, controller con nhận session/client service bằng cách nào?",
      "Nếu click menu nhưng không đổi màn, em trace file nào trước?",
      "Logout cần dọn những state UI/socket nào?",
      "AppShell liên quan NotificationManager và UiMotion như thế nào?",
      "Khi demo navigation, em nói điểm kỹ thuật nào để không bị xem là chỉ làm UI?",
    ],
    intent: "Giúp học viên giải thích shell/navigation như một kiến trúc client, đồng thời không nhầm với bảo mật server.",
    answer: `AppShellController là khung chính sau khi login: nó giữ sidebar, topbar, content host để đặt màn con, và toast host cho NotificationManager. Các màn như AuctionList, SellerCenter, Wallet, AdminUsers không tự tạo cửa sổ riêng; SceneManager load FXML, tạo hoặc gắn controller, inject dependency cần thiết rồi đặt node vào content host. Cách này giúp navigation nhất quán và tránh mỗi controller tự quản lý stage/window riêng.

Điều hướng theo role là UX: bidder thấy Auction List/Wallet/Place Bid, seller thấy Seller Center/Create/Edit, admin thấy Admin Users/Admin Auctions. Role lấy từ LoginResponse/session state ở client để render menu đúng. Nhưng đây không phải lớp bảo mật cuối cùng. Nếu user gửi request ADMIN_DISABLE_USER bằng tool ngoài UI, RequestRouter và server handler vẫn phải kiểm token/role ADMIN. Vì vậy câu trả lời đạt điểm phải tách rõ: AppShell làm trải nghiệm đúng role; authorization thật nằm ở server.

Nếu click menu không đổi màn, trace theo thứ tự: button onAction trong AppShellController, key route trong SceneManager, đường dẫn FXML, fx:controller/fx:id, exception khi initialize, dependency injection cho controller con. Logout phải clear session token, unsubscribe realtime nếu có, reset selected menu/toast hoặc quay về LoginView, và tránh để socket listener cũ cập nhật UI sau khi user đã logout. AppShell cũng là nơi hợp lý để cài UiMotion cho button và nối NotificationManager với toastHost.`,
    answerBullets: [
      "AppShell giữ sidebar/topbar/content host/toast host.",
      "SceneManager load FXML và đặt màn con vào content host.",
      "Role menu là UX; server authorization mới là bảo mật.",
      "Logout phải clear token, listener/subscription và UI state.",
      "Debug navigation theo onAction -> route -> FXML -> controller init.",
    ],
    mustMention: ["AppShellController", "SceneManager", "LoginResponse", "NotificationManager", "UiMotion", "RequestRouter"],
    commonMistakes: ["Nói ẩn menu là đủ phân quyền.", "Mỗi màn tự mở stage làm mất shell.", "Không dọn socket/realtime state khi logout."],
    followUps: ["Nếu user đổi role trong DB khi đang login thì sao?", "Có nên cache controller giữa các màn không?", "SceneManager xử lý lỗi load FXML thế nào?"],
  },
];

const questionVariants = topics.flatMap((topic) =>
  topic.prompts.map((prompt, promptIndex) => ({
    ...topic,
    prompt,
    promptIndex,
  })),
);

export const curatedInterviewQuestions: CuratedInterviewQuestion[] = questionVariants.map((item, index) => ({
  id: `curated-${String(index + 1).padStart(3, "0")}`,
  level: item.level,
  topic: item.topic,
  question: item.prompt,
  answer: item.answer,
  intent: item.intent,
  answerBullets: item.answerBullets,
  mustMention: item.mustMention,
  commonMistakes: item.commonMistakes,
  tags: Array.from(new Set(["LLM curated", "Line code", ...item.tags])),
  filePath: item.filePath,
  lineRefs: item.lineRefs,
  followUps: item.followUps,
}));

export const curatedInterviewQuestionCount = curatedInterviewQuestions.length;
