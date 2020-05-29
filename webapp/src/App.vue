<template>
  <div id="app">
    <div id="nav">
      <router-link to="/create" class="site-header">Веб конструктор нейросетей</router-link>
      <router-link to="/create">Создать</router-link> |
      <router-link to="/edit">Редактировать</router-link> |
      <router-link to="/about">Помощь</router-link> |
      <router-link to="/login">Войти</router-link>
    </div>
    <router-view class="current-view" />
    <hr>
  </div>
</template>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
    min-height: calc(100vh - 30px);
    display: flex;
    flex-direction: column;
  }

  #nav {
    padding: 30px;
    background: #ffffffeb;
    border-bottom: solid 1px black;
    display: flex;
    align-items: center;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
  #nav a:not(:first-child) {
    margin: 0 10px;
  }

  .site-header {
    color: #42b983;
    text-transform: uppercase;
    font-weight: bold;
    font-size: x-large;
    flex-grow: 1;
  }

  .current-view {
    flex-grow: 1;
  }
</style>
