const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- 1. 遊戲資料 ---
let gameState = "map"; 
let worldX = 100, worldY = 100;
const npcWorldX = 250, npcWorldY = 150;

let items = [
  { id: 1, x: 100, y: 330, width: 60, height: 60, color: "orange", isDragging: false },
  { id: 2, x: 200, y: 330, width: 60, height: 60, color: "green", isDragging: false }
];
let offsetX, offsetY;

let joystick = { active: false, x: 100, y: 350, size: 60, dir: "" };

// --- 2. 核心邏輯函式 (抽離出來供滑鼠與觸控共用) ---

function handleStart(mX, mY) {
  if (gameState === "map") {
    let dist = Math.sqrt((mX - joystick.x)**2 + (mY - joystick.y)**2);
    if (dist < 60) {
      joystick.active = true;
      updateJoystick(mX, mY);
    } else {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const nX = npcWorldX - worldX + centerX;
      const nY = npcWorldY - worldY + centerY;
      if (mX > nX && mX < nX + 30 && mY > nY && mY < nY + 30) gameState = "dialog";
    }
  } else {
    items.forEach(item => {
      if (mX > item.x && mX < item.x + item.width && mY > item.y && mY < item.y + item.height) {
        item.isDragging = true;
        offsetX = mX - item.x;
        offsetY = mY - item.y;
      }
    });
  }
}

function handleMove(mX, mY) {
  if (joystick.active) updateJoystick(mX, mY);
  if (gameState === "dialog") {
    items.forEach(item => {
      if (item.isDragging) { item.x = mX - offsetX; item.y = mY - offsetY; }
    });
  }
}

function handleEnd() {
  joystick.active = false;
  joystick.dir = "";
  items.forEach(item => item.isDragging = false);
}

function updateJoystick(mX, mY) {
  let dx = mX - joystick.x;
  let dy = mY - joystick.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 10) { worldX += 5; joystick.dir = "右"; }
    else if (dx < -10) { worldX -= 5; joystick.dir = "左"; }
  } else {
    if (dy > 10) { worldY += 5; joystick.dir = "下"; }
    else if (dy < -10) { worldY -= 5; joystick.dir = "上"; }
  }
}

// --- 3. 事件監聽 (整合觸控與滑鼠) ---

// 觸控事件 (手機/平板)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); 
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  handleStart(t.clientX - rect.left, t.clientY - rect.top);
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  handleMove(t.clientX - rect.left, t.clientY - rect.top);
  draw();
}, { passive: false });

canvas.addEventListener("touchend", handleEnd);

// 滑鼠事件 (電腦測試用)
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  handleStart(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  handleMove(e.clientX - rect.left, e.clientY - rect.top);
  draw();
});

canvas.addEventListener("mouseup", handleEnd);

// --- 4. 繪製部分 (保持不變) ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === "map") {
    const cX = canvas.width / 2, cY = canvas.height / 2;
    ctx.fillStyle = "red";
    ctx.fillRect(npcWorldX - worldX + cX, npcWorldY - worldY + cY, 30, 30);
    ctx.fillStyle = "blue";
    ctx.fillRect(cX, cY, 30, 30);
    ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
    ctx.fillRect(joystick.x - 20, joystick.y - 60, 40, 120);
    ctx.fillRect(joystick.x - 60, joystick.y - 20, 120, 40);
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFCCCC"; ctx.fillRect(50, 50, 150, 200);
    for(let i=0; i<3; i++) { ctx.strokeStyle = "white"; ctx.strokeRect(300 + (i * 70), 50, 60, 60); }
    ctx.fillStyle = "#444"; ctx.fillRect(50, 300, 700, 120);
    items.forEach(item => { ctx.fillStyle = item.color; ctx.fillRect(item.x, item.y, item.width, item.height); });
  }
}

draw();
