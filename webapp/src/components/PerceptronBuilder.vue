<template>
    <div class="root" ref="root" @mousemove="onRelatingMove">

        <br>

        <button @click="addLayer" class="btn-add-layer">Add Layer</button>

        <input type="range" v-model="Zoom" max="10" min="1" @change="zoomChange">

        <br>
        <br>

        <div class="layers">
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
                          :x1="n.RightBorderX"
                          :y1="n.Y"
                          :x2="to.LeftBorderX"
                          :y2="to.Y"
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
                  :x1="RelatingNeuron.RightBorderX"
                  :y1="RelatingNeuron.Y"
                  :x2="RelateX"
                  :y2="RelateY"
                  stroke="black"></line>
        </svg>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "@/model/Neuron";
    import NeuroNet from "@/model/NeuroNet";

    @Component
    export default class PerceptronBuilder extends Vue {

        Zoom : number = 5;

        Layers : NeuroNet = new NeuroNet();

        IsRelating : boolean = false;
        RelatingNeuron : Neuron | null = null;
        RelatingTarget : HTMLElement | null = null;
        RelateX : number = 0;
        RelateY : number = 0;

        NeuronSize : number = 24;

        setRelations(e : MouseEvent){
            if(this.IsRelating) {
                this.IsRelating = false;
                let targEl = (e.target as HTMLElement);
                let targ = this.getNeuronByElement(targEl);
                if(targ !== this.RelatingNeuron && targ && this.RelatingNeuron
                    && targ.Layer !== this.RelatingNeuron.Layer
                ){
                    this.RelatingNeuron.AddNext(targ);
                    this.getAllNeurons();
                }
                e.preventDefault();
            } else {
                this.IsRelating = true;
                this.RelatingTarget = (e.target as HTMLElement);
                this.RelateX = e.pageX / (this.Zoom / 5);
                this.RelateY = e.pageY / (this.Zoom / 5);
                this.RelatingNeuron = this.getNeuronByElement(this.RelatingTarget);
            }
            //console.log(e);
        }

        getNeuronByElement(el : HTMLElement) : Neuron | null{
            let neurs = this.getAllNeurons();
            for(let key in neurs) {
                let x : Neuron = neurs[key];
                if(el.id == `n${x.Id}`){
                    return x;
                }
            }

            return null;
        }

        calcAngle(x1 : number,y1 : number,x2 : number,y2 : number) : number {
            let a = {x:x2 - x1, y:y2 - y1};
            let b = {x:-1, y:0};
            if(x1 && x2 && y1 && y2){
                let sig = -1;
                if(y1 > y2) sig = 1;
                let lenA = Math.sqrt(a.x * a.x + a.y * a.y);
                let lenB = Math.sqrt(b.x * b.x + b.y * b.y);
                let dot = (a.x * b.x)+(a.y * b.y);
                let res = 3.14159265358979323846 + sig * Math.round(Math.acos(dot / (lenA * lenB)) * 100) / 100;
                return res;
            }
            return 0;
        }

        onRelatingMove(e : MouseEvent){
            if(this.IsRelating){
                this.RelateX = e.pageX / (this.Zoom / 5);
                this.RelateY = e.pageY / (this.Zoom / 5);
            }
        }

        addLayer(){
            let layer = new NeuroLayer();
            layer.AddNeuron(0);
            this.Layers.PushLayer(layer);
            this.autoConnectNeurons();

            this.$nextTick(()=>{
                this.getAllNeurons();
            });
        }

        addNeuron(layer : NeuroLayer){
            layer.AddNeuron(0);
            this.autoConnectNeurons();

            this.$nextTick(()=>{
                this.getAllNeurons();
            });
        }

        zoomChange(){
            document.body.style.zoom = (this.Zoom / 5).toString();
            setTimeout(()=>{
                this.getAllNeurons()
            }, 1000);
        }

        getAllNeurons() : Array<Neuron>{
            let arr : Array<Neuron> = new Array<Neuron>();
            this.Layers.ForEach(x=>{
                x.Neurons.forEach((y : Neuron)=>{
                    if(!y.Element){
                        let el = (this.$refs.root as Element).querySelector(`#n${y.Id}`);
                        if(el) {
                            Vue.set(y, "Element", el);
                        }
                    }
                    arr.push(y);
                });
            });
            return arr;
        }

        autoConnectNeurons(){
            if(!this.Layers) return;

            for(let i = 0;i<this.Layers.Count - 1;i++){
                let currLayer = this.Layers.GetLayer(i);
                let nxtLayer = this.Layers.GetLayer(i+1);
                if(currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons){
                    currLayer.Neurons.forEach((n : Neuron) =>{
                        if(n && currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons){
                            n.Next.forEach(x=>{ n.RemoveNext(x)});

                            nxtLayer.Neurons.forEach(k=>{
                                if(k) n.AddNext(k);
                            });
                        }
                    });
                }
            }
        }

        mounted(): void {
            let layer = new NeuroLayer();
            let n0 = layer.AddNeuron(1);
            layer.AddNeuron(1);
            layer.AddNeuron(2);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            this.Layers.PushLayer(layer);

            layer = new NeuroLayer();
            let n1 = layer.AddNeuron(1);
            layer.AddNeuron(2);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            this.Layers.PushLayer(layer);

            layer = new NeuroLayer();
            let n2 = layer.AddNeuron(1);
            layer.AddNeuron(2);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            layer.AddNeuron(3);
            this.Layers.PushLayer(layer);

            n0.AddNext(n1);
            n1.AddNext(n2);

            this.autoConnectNeurons();

            this.$nextTick(()=> {
                this.getAllNeurons();
            });
        }
    }
</script>

<style scoped>

    .root {
        width: fit-content;
        height: 100%;
        margin: auto;
    }

    .lines {
        position: absolute;
        left: 0;
        top: 0;
        width:100%;
        height: 100%;
        pointer-events: none;
    }

    .layers{

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
        background: linear-gradient(to right, transparent 18px, rgba(0, 27, 58, 0.27) 20px, transparent 22px);
        border-top: solid 2px rgba(0, 27, 58, 0.27);
        border-bottom: solid 2px rgba(0, 27, 58, 0.27);
        background-origin: content-box;
        background-repeat: no-repeat;
    }

    .btn-add-neuron{
        position: absolute;
        top: 2px;
        opacity: 0;
        width: 24px;
        height: 24px;
        font-size: 36px;
        line-height: 24px;
        left: 8px;
        background-color: #494949;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        user-select: none;
    }

    .btn-add-neuron:hover {
        opacity: 1;
    }

    .layers-col:hover .btn-add-neuron {
        opacity: 1;
    }

    .layers-col:first-child {
        padding-left: 36px;
        border-left: solid 2px rgba(0, 27, 58, 0.27);
    }

    .layers-col:last-child {
        padding-right: 8px;
        border-right: solid 2px rgba(0, 27, 58, 0.27);
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
    .layers-col:last-child .neuron{
        background-color: #8b5454;
    }
</style>