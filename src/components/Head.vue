<template>
  <header class="header">
    <div class="logo">
      <h1>Escape</h1>
    </div>
    <nav class="header-nav">
      <ul>
        <li><a href="#">Escape Road 2</a></li>
        <li><a href="#">Tap Road</a></li>
        <li><a href="#">Crossy Road</a></li>
        <li><a href="#">Traffic Road</a></li>
        <li><a href="#">All Games</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {}
</script>

<style scoped>
.header {
  padding: 0 50px;
  height: 55px;
  background-color: #fff;
  box-shadow: 0 6px 12px 0 rgb(0 0 0 / 24%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 30px;
  font-weight: 700;
  color: #000; 
}

.header-nav ul {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-nav ul li {
  margin-left: 50px;
  font-size: 18px;
  font-weight: 500;
}

.header-nav ul li a {
  color: #fff;
  text-transform: uppercase;
  text-shadow: 1.75px 2.625px 0 #191919, 1.616825px 0.669725px 0 #191919,
    1.237425px 1.237425px 0 #191919, 0.669725px 1.616825px 0 #191919, 2.625px 1.75px 0 #191919,
    -0.669725px 1.616825px 0 #191919, -1.237425px 1.237425px 0 #191919,
    -1.616825px 0.669725px 0 #191919, -1.75px 0 0 #191919, -1.616825px -0.669725px 0 #191919,
    -1.237425px -1.237425px 0 #191919, -0.669725px -1.616825px 0 #191919, 0 -1.75px 0 #191919,
    0.669725px -1.616825px 0 #191919, 1.237425px -1.237425px 0 #191919,
    1.616825px -0.669725px 0 #191919;
  font-family: 'Santafe';
  font-weight: bold;
  transition: all 0.3s ease;
}

.header-nav ul li a:hover {
  color: #00ffb3;
  transform: translateY(-3px);
  text-shadow: 
    1.75px 2.625px 0 #191919,  /* 保留原始阴影 */
    0 0 8px rgba(0, 255, 179, 0.7), /* 半透明发光效果 */
    0 0 12px rgba(0, 255, 179, 0.5);
}

.header-nav ul{
  list-style: none;
}

.header-nav ul li a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background-color: rgba(0, 255, 179, 0.7);
  transition: width 0.3s ease;
}

.header-nav ul li a:hover::after {
  width: 100%;
}
</style>>
