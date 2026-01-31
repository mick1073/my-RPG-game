const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- 1. 遊戲資料 ---
let gameState = "map"; 
let worldX = 100, worldY = 100;
const npcWorldX = 250, npcWorldY = 150;

// 道具資料
let items = [
  { id: 1, x: 100, y: 330, width: 50, height: 50, color: "orange", isDragging: false },
  { id: 2, x: 200, y: 330, width: 50, height: 50, color: "green", isDragging: false }
];
let offsetX, offsetY;

// 搖桿資料 (設定在左下角)
let joystick = {
  active: false,
  x: 100, y: 350, size: 60,
  dir: "" // 目前移動方向
};

// --- 2. 繪製流程 ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "map") {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 畫 NPC
    ctx.fillStyle = "red";
    const nX = npcWorldX - worldX + centerX;
    const nY = npcWorldY - worldY + centerY;
    ctx.fillRect(nX, nY, 30, 30);
    ctx.fillStyle = "black";
    ctx.fillText("NPC", nX, nY - 5);

    // 畫玩家
    ctx.fillStyle = "blue";
    ctx.fillRect(centerX, centerY, 30, 30);

    // 畫四向搖桿底座 (十字感)
    ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
    ctx.fillRect(joystick.x - 20, joystick.y - 60, 40, 120); // 直條
    ctx.fillRect(joystick.x - 60, joystick.y - 20, 120, 40); // 橫條
    ctx.fillStyle = "white";
    ctx.fillText(joystick.dir || "搖桿", joystick.x - 10, joystick.y + 5);

  } else if (gameState === "dialog") {
    drawDialogScreen();
  }
}

function drawDialogScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFCCCC";
  ctx.fillRect(50, 50, 150, 200); // 諾亞
  for(let i=0; i<3; i++) { ctx.strokeStyle = "white"; ctx.strokeRect(300 + (i * 70), 50, 60, 60); } // 需求格
  ctx.fillStyle = "#444";
  ctx.fillRect(50, 300, 700, 120); // 背包
  items.forEach(item => { ctx.fillStyle = item.color; ctx.fillRect(item.x, item.y, item.width, item.height); });
  ctx.fillStyle = "white";
  ctx.fillText("ESC 回地圖", 10, 20);
}

// --- 3. 控制邏輯 ---

// 電腦鍵盤
document.addEventListener("keydown", (e) => {
  if (gameState === "map") {
    if (e.key === "ArrowUp") worldY -= 10;
    if (e.key === "ArrowDown") worldY += 10;
    if (e.key === "ArrowLeft") worldX -= 10;
    if (e.key === "ArrowRight") worldX += 10;
  } else if (e.key === "Escape") {
    gameState = "map";
  }
  draw();
});

// 滑鼠/觸控點下
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mX = e.clientX - rect.left;
  const mY = e.clientY - rect.top;

  if (gameState === "map") {
    // A. 判定是否點擊搖桿 (四向判定)
    let dist = Math.sqrt((mX - joystick.x)**2 + (mY - joystick.y)**2);
    if (dist < 60) {
      joystick.active = true;
      handleJoystick(mX, mY);
    } else {
      // B. 判定是否點擊 NPC (點擊人物觸發)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const nX = npcWorldX - worldX + centerX;
      const nY = npcWorldY - worldY + centerY;
      if (mX > nX && mX < nX + 30 && mY > nY && mY < nY + 30) gameState = "dialog";
    }
  } else {
    // 道具拖曳開始
    items.forEach(item => {
      if (mX > item.x && mX < item.x + item.width && mY > item.y && mY < item.y + item.height) {
        item.isDragging = true; offsetX = mX - item.x; offsetY = mY - item.y;
      }
    });
  }
  draw();
});

// 滑鼠移動
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mX = e.clientX - rect.left;
  const mY = e.clientY - rect.top;

  if (joystick.active) {
    handleJoystick(mX, mY);
  }

  if (gameState === "dialog") {
    items.forEach(item => { if (item.isDragging) { item.x = mX - offsetX; item.y = mY - offsetY; } });
  }
  draw();
});

// 滑鼠放開
canvas.addEventListener("mouseup", () => {
  joystick.active = false;
  joystick.dir = "";
  items.forEach(item => item.isDragging = false);
  draw();
});

// 搖桿四向判定函式
function handleJoystick(mX, mY) {
  let dx = mX - joystick.x;
  let dy = mY - joystick.y;
  
  // 判斷是橫向移動還是縱向移動較大
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 10) { worldX += 5; joystick.dir = "右"; }
    else if (dx < -10) { worldX -= 5; joystick.dir = "左"; }
  } else {
    if (dy > 10) { worldY += 5; joystick.dir = "下"; }
    else if (dy < -10) { worldY -= 5; joystick.dir = "上"; }
  }
}

draw();
