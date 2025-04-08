<template>
    <main>
      <Headers />
      <section>
        <div class="container">
          <div class="wrap">
            <div class="content-left">
              <div class="cr-item">
                <a href="/">
                  <img src="@/assets/images/game-01.webp" title="Tube Fall" alt="Tube Fall" />
                </a>
              </div>
              <div class="cr-item">
                <a href="/game2">
                  <img src="@/assets/images/game-01.webp" title="Tube Fall" alt="Tube Fall" />
                </a>
              </div>
            </div>
            <div class="game-play">
              <GameMain />
            </div>
            <div class="content-right">
              <p style="color: #fff;">2222222222222222</p>
            </div>
          </div>
          <div class="below">
            <About />
            <Recommend />
          </div>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  
  import Headers from '../components/Head.vue'
  import About from '../components/About.vue'
  import Recommend from '../components/Recommend.vue'
  import GameMain from '../components/GameMain.vue'
  
  </script>
  
  <style scoped>
  .container {
    background: #31698b;
  }
  
  .wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    padding-top: 100px;
    margin-bottom: 100px;
  }
  
  .game-play {
    width: 1280px;
    box-shadow: 0 6px 12px 0 rgb(0 0 0 / 24%);
    padding: 10px 10px 0 10px;
    background-color: #fff;
  }
  
  .content-left {
    margin-right: 20px;
  }
  
  .content-right {
    margin-left: 20px;
  }
  
  .cr-item {
    width: 100px;
    height: 100px;
    margin: 0 0 10px 0;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
  }
  
  .cr-item a{
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .cr-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }
  
  .cr-item:hover {
    transform: scale(1.05) rotate(3deg);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }
  
  .cr-item:hover img {
    transform: scale(1.1);
  }
  
  .cr-item:hover a::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
    border-radius: 10px;
  }
  
  .cr-item:nth-child(odd):hover {
    transform: scale(1.05) rotate(-3deg);
  }
  
  .below {
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
  }
  
  
  </style>
  