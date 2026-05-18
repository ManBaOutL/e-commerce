<template>
  <div class="title-wrapper">
    <div class="title">
      <h2><slot></slot></h2>
    </div>
    <div class="title-decoration">
      <span class="decor-line"></span>
      <span class="decor-dot"></span>
      <span class="decor-line"></span>
    </div>
  </div>
</template>

<style scoped>
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  text-align: center;
  margin-bottom: 15px;
}

.title h2 {
  font-size: 26px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 3px;
  position: relative;
}

.title h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 2px;
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decor-line {
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0);
}

.decor-dot {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
}
</style>
