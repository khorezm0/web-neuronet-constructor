<template>
  <section class="section home">
    <!--<img alt="Vue logo" src="../assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <!--<nodes-canvas></nodes-canvas>-->
    <perceptron-builder></perceptron-builder>
  </section>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import NodesCanvas from "../components/NodesCanvas.vue";
import PerceptronBuilder from "../components/PerceptronBuilder.vue";

export default {
  name: 'home',
  components: {
    NodesCanvas,
    PerceptronBuilder,
    HelloWorld
  }
}
</script>
