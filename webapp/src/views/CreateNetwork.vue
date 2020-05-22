<template>
    <section class="section">
        <form>
            <h1 class="title is-1">
                Создать новую сеть
            </h1>

            <div class="field">
                <label class="label">Название:</label>
                <div class="control">
                    <input class="input" type="text" v-model="form.netName" />
                </div>
            </div>

            <div class="field">
                <label class="label">Тип сети:</label>
                <div class="control">
                    <div class="select">
                        <select v-model="form.netType">
                            <option v-for="(type,i) in netTypes" :value="i">
                                {{type}}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="field">
                <label class="label">Слоев: {{form.layers}}</label>
                <div class="control">
                    <input type="range" min="0" max="80" v-model="form.layers"/>
                </div>
            </div>

            <transition name="fade" mode="out-in">
                <article class="message is-primary" v-show="showSubmitFeedback">
                    <div class="message-header">
                        <p>Статус:</p>
                    </div>
                    <div class="message-body">
                        Ошибка
                    </div>
                </article>
            </transition>

            <input class="button is-primary margin-bottom" type="button" value="Создать" @click.prevent="fakeSubmit" />

        </form>


        <!--<h5>
            JSON
        </h5>
        <pre><code>{{form}}</code></pre>-->
    </section>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "../model/Neuron";
    import NeuroNet from "../model/NeuroNet";

    @Component
    export default class CreateNetwork extends Vue {

        form: any = {
            netName: 'Моя сеть',
            netType: 0,
            layers: 3
        };
        netTypes : any = {
                0:"Перцептрон",
                1:"Сверточная",
                2: "Рекуррентная",
                3: "Сеть Хопфилда"
        };
        showSubmitFeedback: boolean = false;

        mounted() {

            this.form.netType = this.$store.state.netType;
            this.form.layers = this.$store.state.layers;

            this.$store.commit("setNetType", this.form.netType);
            this.$store.commit("setNetName", this.form.netName);
            this.$store.commit("setLayers", this.form.layers);
        }

        fakeSubmit() {

            this.$store.commit("setNetType", this.form.netType);
            this.$store.commit("setNetName", this.form.netName);
            this.$store.commit("setLayers", this.form.layers);

            this.$router.push("edit");
            //window.console.log(this.$store.state.netType);

            // this.showSubmitFeedback = true;
            // setTimeout(() => {
            //     this.showSubmitFeedback = false;
            // }, 5000);
        }

    }
</script>

<style scoped>
    .margin-bottom {
        margin-bottom: 15px;
    }

    .fade-enter, .fade-leave-active {
        opacity: 0;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
</style>