/**
 * length: 初始化数据
 */
function initData(length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr[i] = i;
  }
  arr.sort(function () { return 0.5 - Math.random() });
  return {
    arr,
    blank: 8,
    blankIndex: arr.indexOf(8)
  };
}

const options = {
  canvas: document.querySelector('#canvas'),
  canvasWidth: 540, // 图片宽度
  canvasHeight: 540, // 图片高度
  width: 180, 
  height: 180,
  gap: 4, // 空隙
  imgPath: "./1.jpg",
  data: initData(9) 
}

class Game {
  constructor() {
    this.opt = options;
    this.arr = [];
    const img = new Image();
    img.src = this.opt.imgPath;
    img.onload = () => {
      this.render();
      this.renderBox();
    }
    this.stage = new createjs.Stage(this.opt.canvas);
    createjs.Touch.enable(this.stage); //  开启滑动事件的支持
    createjs.Ticker.addEventListener("tick", (e) => {
      this.tick(e);
    });
    this.bindEvent();
  }

  bindEvent() {
    document.onkeyup = (event) => {
      const keyCode = event.keyCode;
      let direction;
      switch (keyCode) {
        case 37:   // 向左
          direction = 3;
          break;
        case 38: // 向上
          direction = 1;
          break;
        case 39: // 向右
          direction = 4;
          break;
        case 40: // 向下
          direction = 2;
          break;
        default:
          break;
      }
      if (direction) {
        const blankIndex = this.findBlank();
        this.handerTouch(direction, blankIndex);
      }
    }
  }

  renderBox() {
    let startx;
    let starty;
    //创建一个Shape对象，此处也可以创建文字Text,创建图片Bitmap
    const rect = new createjs.Shape();
    //用画笔设置颜色，调用方法画矩形，矩形参数：x,y,w,h
    rect.graphics.beginFill("#f00").drawRect(0, 0, this.opt.canvasWidth + 8, this.opt.canvasHeight + 8);
    rect.alpha = 0.01;
    //绑定touch
    rect.on('mousedown', (e) => {
      startx = e.stageX;
      starty = e.stageY
    });
    rect.on('pressup', (e) => {
      const endx = e.stageX;
      const endy = e.stageY;
      const direction = getDirection(startx, starty, endx, endy); // 获得滑动方向
      const blankIndex = this.findBlank(); // 找出空白所在的位置
      this.handerTouch(direction, blankIndex);
    });
    //添加到舞台
    this.stage.addChild(rect);
    //刷新舞台
    this.stage.update();
  }

  handerTouch(direction, blankIndex) {
    let targetIndex;
    // 向上！
    if (direction === 1 && blankIndex + 3 <= 8) {
      targetIndex = blankIndex + 3;
    }
    // 向下！
    if (direction === 2 && blankIndex - 3 >= 0) {
      targetIndex = blankIndex - 3;
    }
    // 向左！
    if (direction === 3 && blankIndex !== 2 && blankIndex !== 5 && blankIndex !== 8) {
      targetIndex = blankIndex + 1;
    }
    // 向右！
    if (direction === 4 && blankIndex !== 0 && blankIndex !== 3 && blankIndex !== 6) {
      targetIndex = blankIndex - 1;
    }
    if (targetIndex > -1) {
      if (direction === 1 || direction === 2) {
        this.arr[targetIndex].y = Math.floor(blankIndex / 3) * this.opt.height + Math.floor(blankIndex / 3) * this.opt.gap;
        this.arr[blankIndex].y = Math.floor(targetIndex / 3) * this.opt.height + Math.floor(targetIndex / 3) * this.opt.gap;
      }
      if (direction === 3 || direction === 4) {
        this.arr[targetIndex].x = (blankIndex % 3) * this.opt.width + (blankIndex % 3) * this.opt.gap;
        this.arr[blankIndex].x = (targetIndex % 3) * this.opt.width + (targetIndex % 3) * this.opt.gap;
      }
      const obj = this.arr[targetIndex];
      this.arr[targetIndex] = this.arr[blankIndex];
      this.arr[blankIndex] = obj;
      this.opt.data.blankIndex = targetIndex;
      this.update = true;
    }
  }

  findBlank() {
    for(let i = 0; i < this.arr.length; i++) {
      if (i === this.opt.data.blankIndex) {
        return this.opt.data.blankIndex;
      }
    }
  }

  render() {
    for (let i = 0; i < 9; i++) {
      let bg;
      const index = this.opt.data.arr[i];
      const x = (i % 3) * this.opt.width + (i % 3) * this.opt.gap;
      const y = Math.floor(i / 3) * this.opt.height + Math.floor(i / 3) * this.opt.gap;
      if (this.opt.data.blankIndex === i) {
        bg = new createjs.Shape();
        bg.graphics.beginFill("#fff").drawRect(0, 0, this.opt.width, this.opt.height);
      } else {
        bg = new createjs.Bitmap(this.opt.imgPath);
        const rect = new createjs.Rectangle((index % 3) * this.opt.width, Math.floor(index / 3) * this.opt.height, this.opt.width, this.opt.height);
        bg.sourceRect = rect;
      }
      bg.x = x;
      bg.y = y;
      bg.name = index;
      this.arr.push(bg);
      this.stage.addChild(bg);
    }
    this.update = true;
  }

  // 补充完整
  full() {
    const index = this.opt.data.blankIndex;
    const bg = new createjs.Bitmap(this.opt.imgPath);
    const rect = new createjs.Rectangle((index % 3) * this.opt.width, Math.floor(index / 3) * this.opt.height, this.opt.width, this.opt.height);
    bg.sourceRect = rect;
    bg.x = (index % 3) * this.opt.width + (index % 3) * this.opt.gap;
    bg.y = Math.floor(index / 3) * this.opt.height + Math.floor(index / 3) * this.opt.gap;
    this.stage.addChild(bg);
    this.update = true;
  }

  // 检测是否完成
  check() {
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i].name !== i) {
        return false;
      }
    }
    return true;
  }

  tick(event) {
    if (this.update) {
      this.update = false; // only update once
      this.stage.update(event);
      if (this.check()) {
        console.log('恭喜你完成了');
        setTimeout(() => {
          this.full();  
        }, 1000);
      }
    }
  }
}

new Game();
