<template>
    <div>

            <div class="box editor-panel">
                <button @click="addLayer" class="button is-primary  btn-add-layer">Добавить слой</button>
                <button @click="randomizeWeight" class="button is-primary  btn-add-layer">Случайные значения весов</button>
                <div class="flex-grow"></div>
                <label for="zoom" class="icon is-medium" style=""><i class="fa fa-2x fa-search-plus fa-inverse" aria-hidden="true"></i></label>
                <input id="zoom" type="range" v-model="SliderZoomValue" max="20" min="1" @change="zoomChange">
            </div>

        <div class="root" ref="root" @mousemove="onRelatingMove">
            <div class="layers" :style="`zoom: ${Zoom};`">
                <div v-for="layer in Layers.ToArray()" :key="layer.Id" class="layers-col" ref="layers">
                    <div class="btn-add-neuron" @click="addNeuron(layer)">+</div>
                    <div v-for="neuron in layer.Neurons"
                         :id="`n${neuron.Id}`"
                         class="neuron"
                         :style="`width:${NeuronSize}px;height:${NeuronSize}px;`"
                         @mousedown="setRelations"
                    ></div>
                </div>

            </div>

            <svg class="lines">
                <g v-for="n in getAllNeurons()" v-if="n.Next && n.Next.length">
                    <g v-for="to in n.Next">
                        <line
                                :x1="n.RightBorderX * Zoom"
                                :y1="n.Y * Zoom"
                                :x2="to.LeftBorderX * Zoom"
                                :y2="to.Y * Zoom"
                                stroke="black"></line>
                        <!--<polygon :points="`0,0
                            -8,8
                            -8,-8`"
                         :style="`fill:black;
                         transform: translate(${to.LeftBorderX}px, ${to.Y}px) ` +
                            `rotate(${calcAngle(n.RightBorderX, n.Y,to.LeftBorderX, to.Y)}rad);`" >
                            &lt;!&ndash;угол между двумя векторами&ndash;&gt;
                        </polygon>-->
                    </g>
                </g>

                <line v-if="IsRelating"
                      :x1="RelatingNeuron.RightBorderX * Zoom"
                      :y1="RelatingNeuron.Y * Zoom"
                      :x2="RelateX * Zoom"
                      :y2="RelateY * Zoom"
                      stroke="black"></line>
            </svg>
        </div>



    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "@/model/Neuron";
    import NeuroNet from "@/model/NeuroNet";

    @Component
    export default class PerceptronBuilder extends Vue {

        Zoom: number = 1;
        SliderZoomValue: number = 8;

        Layers: NeuroNet = new NeuroNet();

        IsRelating: boolean = false;
        RelatingNeuron: Neuron | null = null;
        RelatingTarget: HTMLElement | null = null;
        RelateX: number = 0;
        RelateY: number = 0;

        NeuronSize: number = 24;

        setRelations(e: MouseEvent) {

            if(20 + 10 < 1000) {
                return;
            }

            if (this.IsRelating) {
                this.IsRelating = false;
                let targEl = (e.target as HTMLElement);
                let targ = this.getNeuronByElement(targEl);
                if (targ !== this.RelatingNeuron && targ && this.RelatingNeuron
                    && targ.Layer !== this.RelatingNeuron.Layer
                ) {
                    this.RelatingNeuron.AddNext(targ);
                    this.getAllNeurons();
                }
                e.preventDefault();
            } else {
                this.IsRelating = true;
                this.RelatingTarget = (e.target as HTMLElement);
                this.RelatingNeuron = this.getNeuronByElement(this.RelatingTarget);
                this.onRelatingMove(e);
            }
            //console.log(e);
        }

        getNeuronByElement(el: HTMLElement): Neuron | null {
            let neurs = this.getAllNeurons();
            for (let key in neurs) {
                let x: Neuron = neurs[key];
                if (el.id == `n${x.Id}`) {
                    return x;
                }
            }

            return null;
        }

        onRelatingMove(e: MouseEvent) {
            if (this.IsRelating) {
                let target = (e.target as HTMLElement);
                this.RelateX = e.offsetX + target.offsetLeft;
                this.RelateY = e.offsetY;

                if(target.classList.contains("neuron") && target.parentElement){
                    this.RelateX += target.parentElement.offsetLeft;
                    this.RelateY += target.offsetTop;
                }
            }
        }

        addLayer() {
            let layer = new NeuroLayer();
            layer.AddNeuron(0);
            this.Layers.PushLayer(layer);
            this.autoConnectNeurons();

            this.$nextTick(() => {
                this.getAllNeurons();
            });
        }

        addNeuron(layer: NeuroLayer) {
            layer.AddNeuron(0);
            this.autoConnectNeurons();

            this.$nextTick(() => {
                this.getAllNeurons();
            });
        }

        zoomChange() {
            //(this.$refs["layers"] as Element).style.zoom = (this.Zoom).toString();
            this.Zoom = this.SliderZoomValue / 8;
            window.requestAnimationFrame(()=>{
                this.getAllNeurons()
            });
        }

        getAllNeurons(): Array<Neuron> {
            let arr: Array<Neuron> = new Array<Neuron>();
            this.Layers.ForEach(x => {
                x.Neurons.forEach((y: Neuron) => {
                    if (!y.Element) {
                        let el = (this.$refs.root as Element).querySelector(`#n${y.Id}`);
                        if (el) {
                            Vue.set(y, "Element", el);
                        }
                    }
                    arr.push(y);
                });
            });
            return arr;
        }

        autoConnectNeurons() {
            if (!this.Layers) return;

            for (let i = 0; i < this.Layers.Count - 1; i++) {
                let currLayer = this.Layers.GetLayer(i);
                let nxtLayer = this.Layers.GetLayer(i + 1);
                if (currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons) {
                    currLayer.Neurons.forEach((n: Neuron) => {
                        if (n && currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons) {
                            n.Next.forEach(x => {
                                n.RemoveNext(x)
                            });

                            nxtLayer.Neurons.forEach(k => {
                                if (k) n.AddNext(k);
                            });
                        }
                    });
                }
            }
        }

        randomizeWeight(): void {
            if (!this.Layers) return;

            for (let i = 0; i < this.Layers.Count; i++) {
                let currLayer = this.Layers.GetLayer(i);
                if (currLayer && currLayer.Neurons) {
                    currLayer.Neurons.forEach((n: Neuron) => {
                        n.Weight = Math.random();
                    });
                }
            }

        }

        mounted(): void {
            this.$nextTick(() => {
                if (this.$store.state.netType != 0) {
                    this.$router.push("create");
                }
            });

            for (let i = 0; i < Math.max(1, Math.min(80, this.$store.state.layers)); i++) {
                let layer = new NeuroLayer();
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                layer.AddNeuron(1);
                this.Layers.PushLayer(layer);
            }

            this.autoConnectNeurons();

            this.$nextTick(() => {
                this.getAllNeurons();
            });
        }
    }
</script>

<style scoped>

    .root {
        position: relative;
        width: fit-content;
        height: 100%;
        margin: auto;
        max-width: 100%;
        overflow-x: scroll;
    }

    .lines {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .layers {

        box-sizing: border-box;

        background-color: white;
        margin: auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        min-width: 272px;
    }

    .layers-col {
        position: relative;

        width: 54px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: linear-gradient(to right, transparent 10px, rgba(0, 27, 58, 0.27) 12px, transparent 14px) no-repeat;
        border-top: solid 2px rgba(0, 27, 58, 0.27);
        border-bottom: solid 2px rgba(0, 27, 58, 0.27);
        padding-top: 20px;
        background-origin: border-box;
    }

    .layers-col:hover .btn-add-neuron {
        opacity: 1;
    }

    .layers-col:first-child {
        padding-left: 36px;
        padding-right: 48px;
        border-left: solid 2px rgba(0, 27, 58, 0.27);
        background: linear-gradient(to right, transparent 46px, rgba(0, 27, 58, 0.27) 48px, transparent 50px) no-repeat;
    }

    .layers-col:last-child {
        padding-right: 8px;
        border-right: solid 2px rgba(0, 27, 58, 0.27);
    }

    .btn-add-neuron {
        position: absolute;
        top: 2px;
        opacity: 0;
        width: 24px;
        height: 24px;
        font-size: 36px;
        line-height: 24px;
        left: 0px;
        background-color: #494949;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        user-select: none;
        text-align: center;
    }

    .layers-col:first-child > .btn-add-neuron {
        left: 36px;
    }

    .btn-add-neuron:hover {
        opacity: 1;
    }

    .neuron {
        box-sizing: border-box;
        height: 24px;
        width: 24px;
        background-color: #24466c;
        margin: 10px 0;
        border-radius: 50%;
    }

    .layers-col:first-child .neuron {
        background-color: #588b54;
    }

    .layers-col:last-child .neuron {
        background-color: #8b5454;
    }

    input#zoom {
        width: 200px;
    }

    .editor-panel {
        width: 100%;
        background-color: #292F36;
        display: flex;
    }
    .editor-panel > .button:first-child {
        margin-right: 20px;
    }
    .editor-panel > .flex-grow {
        flex-grow: 1;
    }

</style>