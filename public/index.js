let lang = window.navigator.language;

$("document").ready(apiAuth());

function apiAuth() {
  console.log("bắt đầu apiAuth");
  if (!window.h5sdk) {
    console.log("h5sdk không hợp lệ");
    alert("vui lòng mở trong Feishu");
    return;
  }

  // URL của trang web hiện tại cần xác thực
  const url = encodeURIComponent(location.href.split("#")[0]);
  console.log("Frontend sẽ gửi URL cần xác thực đến server, URL là:", url);
  
  // Gửi yêu cầu đến server để lấy thông tin xác thực (appId, timestamp, nonceStr, signature)
  fetch(`/get_config_parameters?url=${url}`)
    .then((response) =>
      response.json().then((res) => {
        console.log("Server trả về thông tin xác thực cho frontend:", res);
        
        // Xử lý lỗi khi xác thực API thất bại
        window.h5sdk.error((err) => {
          throw ("Lỗi h5sdk:", JSON.stringify(err));
        });

        // Gọi API config để xác thực
        window.h5sdk.config({
          appId: res.appid,
          timestamp: res.timestamp,
          nonceStr: res.noncestr,
          signature: res.signature,
          jsApiList: [],
          // Callback khi xác thực thành công
          onSuccess: (res) => {
            console.log(`Xác thực thành công: ${JSON.stringify(res)}`);
          },
          // Callback khi xác thực thất bại
          onFail: (err) => {
            throw `Xác thực thất bại: ${JSON.stringify(err)}`;
          },
        });

        // Khi xác thực hoàn tất, có thể gọi JSAPI trong window.h5sdk.ready
        window.h5sdk.ready(() => {
          // Callback được gọi khi môi trường đã sẵn sàng
          // Gọi API getUserInfo để lấy thông tin người dùng đã đăng nhập
          tt.getUserInfo({
            // Callback khi gọi API thành công
            success(res) {
              console.log(`Lấy thông tin người dùng thành công: ${JSON.stringify(res)}`);
              // Hàm showUser dùng để hiển thị thông tin người dùng trên giao diện
              showUser(res.userInfo);
            },
            // Callback khi gọi API thất bại
            fail(err) {
              console.log(`Lấy thông tin người dùng thất bại:`, JSON.stringify(err));
            },
          });

          // Gọi API showToast để hiển thị thông báo toàn cục
          tt.showToast({
            title: "Xác thực thành công",
            icon: "success",
            duration: 3000,
            success(res) {
              console.log("Gọi showToast thành công", res.errMsg);
            },
            fail(res) {
              console.log("Gọi showToast thất bại", res.errMsg);
            },
            complete(res) {
              console.log("Gọi showToast kết thúc", res.errMsg);
            },
          });
        });
      })
    )
    .catch(function (e) {
      console.error(e);
    });
}

function showUser(res) {
  // Hiển thị thông tin người dùng
  // Ảnh đại diện
  $("#img_div").html(
    `<img src="${res.avatarUrl}" width="100%" height="100%"/>`
  );

  // Tên
  $("#hello_text_name").text(
    lang === "zh_CN" || lang === "zh-CN"
      ? `${res.nickName}`
      : `${res.i18nName.en_us}`
  );

  // Lời chào
  $("#hello_text_welcome").text(
    lang === "zh_CN" || lang === "zh-CN" ? "Chào mừng bạn đến với Feishu" : "Welcome to Feishu"
  );

  // Thêm nút vào giao diện
  $("#redirect_button").html(`
    <button id="goToProfile" style="
      margin-top: 50px;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    ">
      Tasks
    </button>
  `);

  // Xử lý sự kiện khi nhấn nút
  $("#goToProfile").click(function () {
    window.location.href = "tasks.html"; // Chuyển đến trang giao diện khác
  });
}

// Khi nhấn nút "Tải dữ liệu"
$("#loadData").click(() => {
  // Định nghĩa thông tin yêu cầu
  const requestBody = {
      app_id: "cli_a76125048c7dd010",
      app_secret: "ZS1dDPjNHmcygGe4JNYDlgASZc4QxpcA"
  };

  // Gửi yêu cầu POST đến Lark API
  fetch('https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
      if (data.code === 0) {
          console.log("App Access Token:", data.app_access_token);
          console.log("Token expires in:", data.expire, "seconds");
      } else {
          console.error("Error:", data.msg);
      }
  })
  .catch(error => console.error('Error:', error));
  // fetchDataFromLarkBase();
});

function fetchDataFromLarkBase() {
  fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${TABLE_ID}/records`, {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
      }
  })
  .then(response => response.json())
  .then(data => {
      console.log("Dữ liệu từ Base:", data);
      displayData(data.data.items);
  })
  .catch(error => {
      console.error("Lỗi khi lấy dữ liệu:", error);
  });
}

function displayData(items) {
  let tableBody = $("#taskTableBody");
  tableBody.empty(); // Xóa dữ liệu cũ

  items.forEach(item => {
      let row = `
          <tr>
              <td>${item.record_id}</td>
              <td>${item.fields["Task Name"] || "Không có tên"}</td>
              <td>${item.fields["Status"] || "Chưa xác định"}</td>
          </tr>
      `;
      tableBody.append(row);
  });
}
