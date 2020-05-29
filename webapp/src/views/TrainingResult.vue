<template>
    <section class="section">
        <h1 class="title is-1">Отчет об обучении</h1>
        <p>Из выборки 2031 различных обхектов, 1924 были определены верно.</p>
        <p>Точность сети составляет 94.7 процентов.</p>
        <p>Обучение сети заняло 7.1 минут.</p>
        <canvas ref="canvas"></canvas>
        <br>
        <br>
        <br>

        <h1 class="title is-1">Отчет о тестировании</h1>
        <p>Из выборки 100 различных обхектов, 88 были определены верно.</p>
        <p>Точность сети составляет 88 процентов.</p>

    </section>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "../model/Neuron";
    import NeuroNet from "../model/NeuroNet";
    const Chart = require('chart.js');

    @Component
    export default class TrainingResult extends Vue {
        mounted(){
            let canvas : HTMLCanvasElement = this.$refs.canvas as HTMLCanvasElement;
            let chart = new Chart(canvas, {
                type: 'line',
                data : {
                    labels:["1 итераций", "10 итераций", "100 итераций", "200 итераций", "300 итераций", "350 итераций"],
                    datasets : [{
                        label:"% Ошибок",
                        data: [90,85,80,75,30,15]
                    }]
                },
                options:{
                    aspectRatio: 4
                }
            });
        }
    }
</script>

<style scoped>

</style>