let weeds = [];
let bubbles = [];
let iframe;

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.position(0, 0); // 確保畫布定位在視窗左上角
  c.style('pointer-events', 'none'); // 關鍵：讓滑鼠事件穿透 Canvas，以便操作下方的 iframe
  c.style('z-index', '1'); // 設定 Canvas 在上層

  iframe = createElement('iframe');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('border', 'none');
  iframe.style('z-index', '0'); // 設定 iframe 在下層背景

  // 產生 50 根水草，讓它們隨機重疊
  for (let i = 0; i < 50; i++) {
    weeds.push(new Weed());
  }
}

function draw() {
  clear(); // 清除畫布，確保可以看到底下的 iframe
  // 背景顏色 #caf0f8 (R:202, G:240, B:248)，透明度 0.2 (換算成 0-255 約為 51)
  background(202, 240, 248, 51); 
  blendMode(BLEND); // 設定混合模式為 BLEND，讓透明度產生疊加效果

  for (let w of weeds) {
    w.display();
  }

  // 產生並管理水泡
  if (random(1) < 0.03) { // 約 3% 的機率產生新水泡
    bubbles.push(new Bubble());
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    if (b.isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iframe.size(windowWidth, windowHeight); // 視窗縮放時一併調整 iframe 大小
  // 視窗大小改變時，重新產生水草以符合新的高度限制
  weeds = [];
  for (let i = 0; i < 50; i++) {
    weeds.push(new Weed());
  }
}

class Weed {
  constructor() {
    this.x = random(width);
    this.w = random(30, 60); // 屬性：粗細
    this.h = random(height * 0.2, height * (2 / 3)); // 屬性：高度
    this.noiseOffset = random(1000); // 隨機偏移，確保每根水草搖晃方向不同
    this.speed = random(0.005, 0.02); // 屬性：搖晃頻率 (速度)
    this.amp = random(60, 140); // 屬性：搖晃幅度 (擺動範圍)
    this.r = random(20, 80); // 屬性：顏色 R
    this.g = random(100, 200);
    this.b = random(50, 100); // 屬性：顏色 B
    this.alpha = random(50, 150); // 屬性：透明度 (50~150)，讓水草半透明
  }

  display() {
    noFill();
    stroke(this.r, this.g, this.b, this.alpha); // 使用 RGBA 顏色
    strokeWeight(this.w);
    strokeCap(ROUND);

    beginShape();
    curveVertex(this.x, height);
    for (let y = height; y > height - this.h; y -= 10) {
      let progress = map(y, height, height - this.h, 0, 1);
      let noiseVal = noise(frameCount * this.speed + progress * 2 + this.noiseOffset);
      let xOffset = map(noiseVal, 0, 1, -this.amp, this.amp) * progress;
      curveVertex(this.x + xOffset, y);
    }
    // 結束控制點
    let topNoise = noise(frameCount * this.speed + 2 + this.noiseOffset);
    let topOffset = map(topNoise, 0, 1, -this.amp, this.amp);
    curveVertex(this.x + topOffset, height - this.h);
    endShape();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 10; // 從視窗底部下方生成
    this.size = random(5, 20); // 水泡大小
    this.speed = random(1, 4); // 上升速度
    this.popHeight = random(height * 0.1, height * 0.8); // 隨機設定破掉的高度
    this.popped = false; // 是否已經破掉
    this.popAnimFrame = 0; // 破掉動畫的計數器
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      this.x += sin(frameCount * 0.05 + this.y * 0.05); // 模擬水中左右搖晃
      
      // 當上升到指定高度時，設定為破掉
      if (this.y < this.popHeight) {
        this.popped = true;
      }
    } else {
      this.popAnimFrame++;
    }
  }

  display() {
    if (!this.popped) {
      // 繪製水泡
      stroke(255, 180);
      strokeWeight(1);
      noFill();
      circle(this.x, this.y, this.size);
      
      // 加上一點高光，讓它看起來像氣泡
      noStroke();
      fill(255, 200);
      circle(this.x + this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3);
    } else {
      // 繪製破掉的效果：向外擴散的線條
      stroke(255, map(this.popAnimFrame, 0, 10, 255, 0)); // 隨時間變透明
      strokeWeight(2);
      noFill();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i;
        let rIn = this.size / 2;
        let rOut = this.size / 2 + this.popAnimFrame * 2; // 線條向外延伸
        line(this.x + cos(angle) * rIn, this.y + sin(angle) * rIn, this.x + cos(angle) * rOut, this.y + sin(angle) * rOut);
      }
    }
  }

  isDead() {
    // 如果破掉動畫播放完畢，則移除此物件
    return this.popped && this.popAnimFrame > 10;
  }
}