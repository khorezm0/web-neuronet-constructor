<template>
    <section class="section">
        <h1 class="title is-1">Отчет об обучении</h1>
        <p v-if="isTraining">Идет обучение...</p>
        <div v-else>
            <p>Тренировачный датасет содержит {{trainDataInputs}} строк.</p>
            <p>Точность сети составляет {{trainAcc}} процентов.</p>
            <p>Обучение сети заняло {{trainTime}}.</p>
        </div>

        <canvas ref="canvas"></canvas>
        <br>
        <br>
        <br>

        <div v-if="!isTraining">
            <h1 class="title is-1">Отчет о тестировании</h1>
            <p>Тестовый датасет содержит {{testDataInputs}} строк.</p>
            <p>Точность сети составляет {{trainValAcc}} процентов.</p>
        </div>


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

        @Prop()
        trainingBus : Vue;

        isTraining : boolean = false;
        trainTime : string = "";
        trainAcc : number = 0;
        trainValAcc : number = 0;

        get trainDataInputs() : number{
            let model = this.$store.state.trainedModel;
            if(model && model.currTrainingDataset){
                return model.currTrainingDataset.inputs.length;
            }
            return 0;
        }

        get testDataInputs() : number{
            let model = this.$store.state.trainedModel;
            if(model && model.currValDataset){
                return model.currValDataset.inputs.length;
            }
            return 0;
        }

        mounted(){
            let canvas : HTMLCanvasElement = this.$refs.canvas as HTMLCanvasElement;
            let dataset = {
                label:"% Ошибок",
                data: [100]
            };
            let epochs = 0;
            let labels = ['Старт'];
            let startTime = new Date();


            let chart = new Chart(canvas, {
                type: 'line',
                data : {
                    labels : labels,
                    datasets : [dataset]
                },
                options:{
                    aspectRatio: 4
                }
            });


            this.trainingBus.$on("newTrain", ()=>{
                epochs = 0;
                dataset.data = [100];
                if(labels.length) labels.splice(0, labels.length);
                labels.push("Старт")
                chart.update();
                this.isTraining = true;
                startTime = new Date();
            });

            this.trainingBus.$on("trainEpoch", (epoch : any)=>{
                epochs++;
                this.trainAcc = Math.floor(epoch.acc * 10000) / 100;
                this.trainValAcc = Math.floor(epoch.val_acc * 10000) / 100;
                dataset.data.push((1-epoch.acc) * 100);
                labels.push(epochs.toString());
                chart.update();
            });


            this.trainingBus.$on("trainEnd", ()=>{
                this.isTraining = false;
                this.trainTime = this.getTimeSpan((new Date() - startTime));
            });
        }


        getTimeSpan(diff : number) : string{
            let days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -=  days * (1000 * 60 * 60 * 24);

            let hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * (1000 * 60 * 60);

            let mins = Math.floor(diff / (1000 * 60));
            diff -= mins * (1000 * 60);

            let seconds = Math.floor(diff / (1000));
            diff -= seconds * (1000);

            hours += days * 24;

            let hourStr = hours.toString();
            let minStr = mins.toString();
            let secStr = seconds.toString();

            if(hours > 0) {
                return `${hourStr} часов ${minStr} минут`;
            }else if(mins > 0){
                return `${minStr} минут ${secStr} секунд`;
            }

            return `${secStr} секунд`;
        }
    }
</script>

<style scoped>

</style>