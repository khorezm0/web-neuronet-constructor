<template>
  <div class="home">
    <!--<img alt="Vue logo" src="../assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <!--<nodes-canvas></nodes-canvas>-->
    <net-builder></net-builder>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import NodesCanvas from "../components/NodesCanvas";
import NetBuilder from "../components/NetBuilder";

export default {
  name: 'home',
  components: {
    NodesCanvas,
    NetBuilder,
    HelloWorld
  }
}
</script>
