class LibrarianAvatarEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.x = 100;
    this.y = 120;
    this.targetX = 100;
    this.state = 'IDLE'; 
    this.speed = 4;
    this.frame = 0;
    this.onArrivalCallback = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.loop();
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    this.canvas.width = this.canvas.parentElement.clientWidth || window.innerWidth;
    this.canvas.height = 200;
  }

  fetchBookForUser(targetClientX, onComplete) {
    this.targetX = targetClientX - 40;
    this.state = 'WALKING';
    this.onArrivalCallback = onComplete;
  }

  update() {
    if (this.state === 'WALKING') {
      const dx = this.targetX - this.x;
      if (Math.abs(dx) > this.speed) {
        this.x += Math.sign(dx) * this.speed;
        this.frame += 0.2;
      } else {
        this.x = this.targetX;
        this.state = 'FETCHING';
        setTimeout(() => {
          if (this.onArrivalCallback) this.onArrivalCallback();
          this.state = 'IDLE';
        }, 800);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.x, this.y);

    // Dynamic Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(0, 50, 20, 6, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
    this.ctx.fill();

    // Head
    this.ctx.beginPath();
    this.ctx.fillStyle = '#d4af37';
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fill();

    // Torso (Coat)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-12, 16, 24, 34);

    // Legs animation
    const legOffset = Math.sin(this.frame) * 6;
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(-6, 50); 
    this.ctx.lineTo(-6 + legOffset, 68);
    this.ctx.moveTo(6, 50); 
    this.ctx.lineTo(6 - legOffset, 68);
    this.ctx.stroke();

    // Book in hand state
    if (this.state === 'FETCHING') {
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(10, 20, 14, 18);
    }

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

let librarianInstance = null;
document.addEventListener("DOMContentLoaded", () => {
  librarianInstance = new LibrarianAvatarEngine('librarianCanvas');
});