<template>
    <section class="section">
        <input type="file" ref="file" style="opacity: 0;display:block;width: 1px;height: 1px;zoom:0.1">
        <div class="main-content">

            <div class="box editor-panel">
                <div class="editor-group">
                    <input class="input layers-count-input" max="5" min="1" type="number" v-model="AddLayersCount">
                    <button @click="addLayer" class="button is-primary  btn-add-layer">Добавить слой</button>
                </div>
                <button @click="loadWeights" class="button is-primary  btn-add-layer">Загрузить веса</button>
                <button @click="trainNet" class="button is-primary  btn-add-layer">Перейти к обучению</button>
                <div class="select">
                    <select v-model="currActivationFunction">
                        <optgroup label = "Функция авктивации">
                            <option v-for="(type,i) in ActivationFunctions" :value="i">
                                {{type}}
                            </option>
                        </optgroup>
                    </select>
                </div>
                <div class="flex-grow"></div>
                <div class="editor-group">
                    <label for="zoom" class="icon is-medium" style="">
                        <i class="fa fa-2x fa-search-plus fa-inverse" aria-hidden="true"></i></label>
                    <input id="zoom" type="range" v-model="SliderZoomValue" max="20" min="1" @input="zoomChange">
                </div>
            </div>

            <div class="root" ref="root" @mousemove="onRelatingMove">
                <div class="layers" :style="`zoom: ${Zoom};`">
                    <div v-for="(layer, index) in Layers.ToArray()" :key="layer.Id" class="layers-col" ref="layers">
                        <div class="btn-add-neuron" @click="addNeuron(layer)">+</div>
                        <div class="btn-set-relations" @click="openLayersContext(layer, index, $event)" ><i class="fa fa-cog" aria-hidden="true"></i></div>
                        <div v-for="neuron in layer.Neurons"
                             :id="`n${neuron.Id}`"
                             class="neuron"
                             :style="`width:${NeuronSize}px;height:${NeuronSize}px;`"
                             @mousedown="setRelations"
                        ></div>
                    </div>


                    <svg class="lines">
                        <g v-for="n in getAllNeurons()" v-if="n.Next && n.Next.length">
                            <g v-for="to in n.Next">
                                <line
                                        :x1="n.RightBorderX"
                                        :y1="n.Y"
                                        :x2="to.Neuron.LeftBorderX"
                                        :y2="to.Neuron.Y"
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
            </div>
        </div>

        <div ref="layerSettingsContext" class="box context-menu">
            <div class="context-content">
                <label class="label">Связь:</label>
                <button class="button" @click="selLayerRelations(0)">Прямая</button>
                <button class="button" @click="selLayerRelations(1)">Каждый с каждым</button>
                <button class="button" @click="randomizeWeights()">Случайные значения весов</button>
                <span class="context-line">
                    <input @click.stop.prevent
                           class="input layers-count-input"
                           min="1" max="100" type="number" v-model="currSettingsLayerCount"
                           @change="selLayerNeuronCount()"
                    >

                    <button class="button" @click="selLayerNeuronCount()">Нейронов</button>
                </span>

                <label class="checkbox" @click.stop>
                    <input type="checkbox" v-model="isSaveSettingsLayersForAll" >
                    Применить для всех
                </label>
            </div>
        </div>
        <v-dialog/>
        <modal name="trainSettings" class="train-settings" :adaptive="true">
            <div class="hero-body">
                <h1 class="title train-title">Тренировка</h1>
                <p class="dialog-c-text">
                    <span v-if="currActivationFunction === 'step'">
                        Настройки для ступенчетой фукнции активации:
                        <br>
                    </span>

                    <span v-if="currActivationFunction === 'linear'">
                        Настройки для линейной фукнции активации:
                        <br>
                    </span>

                    <input class="input" type="number" v-model="trainData.activationFunctionValue"
                           v-if="['step','linear'].includes(currActivationFunction)">

                    Эпох:
                    <input min="10" max="10000" class="input" type="number" v-model="trainData.iterations">
                    <br>
                    Степень обучения:
                    <input min="0.1" max="2" class="input" type="number" v-model="trainData.trainSpeed">
                    Датасет обучения(<a href="#">формат</a>)
                    <input type="file" class="input">
                    <br>
                    Датасет тестирования
                    <input type="file" class="input">
                </p>
            </div>
            <div class="dialog-buttons">
                <button type="button" class="button" @click="closeTrainDialog">Отмена</button>
                <button type="button" class="button is-primary" @click="applyTrain">Ок</button>
            </div>
        </modal>
    </section>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "@/model/Neuron";
    import NeuroNet from "@/model/NeuroNet";
    import JsonFileLoader from "@/common/JsonFileLoader";

    import {NeuronRelation} from "@/model/Neuron";
    import SimpleTrainer from "@/common/SimpleTrainer";
    import Dataset from "@/model/Dataset";
    const VueModal = require("vue-js-modal");

    @Component({
        components: {"vue-js-modal": VueModal}
    })
    export default class NeuroNetBuilder extends Vue {

        readonly ActivationFunctions : any = {
            "step":"Ступенчатая",
            "sigmoid":"Сигмоида",
            "linear":"Линейная",
            "hyperbolTan":"Гиперболический тангенс",
            "relu":"ReLu"
        };

        Layers: NeuroNet = new NeuroNet();
        currActivationFunction : String = "step";
        trainData : any = {
            activationFunctionValue : 0.5,
            iterations : 100,
            trainSpeed : 1
        };

        SliderZoomValue: number = 8;
        AddLayersCount : number = 1;
        NeuronSize: number = 24;
        Zoom: number = 1;

        currSettingsLayer : NeuroLayer | null = null;
        currSettingsLayerIndex : number = 0;
        currSettingsLayerCount : number = 0;

        currContextMenu : HTMLElement | null = null;
        isSaveSettingsLayersForAll : boolean = true;

        //не нужны ща:------
        IsRelating: boolean = false;
        RelatingNeuron: Neuron | null = null;
        RelatingTarget: HTMLElement | null = null;
        RelateX: number = 0;
        RelateY: number = 0;
        //------------------

        setRelations(e: MouseEvent) {
            // if (this.IsRelating) {
            //     this.IsRelating = false;
            //     let targEl = (e.target as HTMLElement);
            //     let targ = this.getNeuronByElement(targEl);
            //     if (targ !== this.RelatingNeuron && targ && this.RelatingNeuron
            //         && targ.Layer !== this.RelatingNeuron.Layer
            //     ) {
            //         this.RelatingNeuron.AddNext(new NeuronRelation(targ, 0));
            //         this.getAllNeurons();
            //     }
            //     e.preventDefault();
            // } else {
            //     this.IsRelating = true;
            //     this.RelatingTarget = (e.target as HTMLElement);
            //     this.RelatingNeuron = this.getNeuronByElement(this.RelatingTarget);
            //     this.onRelatingMove(e);
            // }
            //console.log(e);
        }

        openLayersContext(layer : NeuroLayer, layerIndex : number, event : MouseEvent){
            let menu : any = this.$refs.layerSettingsContext;

            if(menu){
                this.currSettingsLayer = layer;
                this.currSettingsLayerIndex = layerIndex;
                this.currSettingsLayerCount = layer.Neurons.length;
                event.stopPropagation();
                this.openContext(menu, event.clientX, event.clientY);
            }
        }

        openContext(el:HTMLElement, x:Number, y:Number) {
            el.style.display = "block";
            el.style.left = x+"px";
            el.style.top = y+"px";
            this.currContextMenu = el;
            window.document.body.addEventListener("click", this.onContextClick);
        }

        onContextClick(event : MouseEvent) {
            window.document.body.removeEventListener("click", this.onContextClick);
            if(this.currContextMenu) {
                this.currContextMenu.style.display="none";
            }
        }
        selLayerNeuronCount() {
            let l = this.currSettingsLayer;
            let applyFunc = (l:NeuroLayer)=>{
                if(l.Neurons.length > this.currSettingsLayerCount){
                    while (l.Neurons.length > 0 && l.Neurons.length > this.currSettingsLayerCount){
                        l.RemoveNeuronAt(l.Neurons.length - 1);
                    }
                    this.Layers.ClearNullReferences();
                }else if(l.Neurons.length < this.currSettingsLayerCount){
                    while (l.Neurons.length < this.currSettingsLayerCount){
                        l.AddNeuron();
                    }
                }
            };
            //
            if(l) {
                if(this.isSaveSettingsLayersForAll) {
                    this.Layers.ForEach((l:NeuroLayer)=> applyFunc(l));
                }else{
                    applyFunc(l);
                }
            }


            this.$nextTick(()=>{
                setTimeout(this.getAllNeurons,100);
            });
        }


        randomizeWeights(): void {
            if (!this.Layers) return;

            let applyFunc = (currLayer:NeuroLayer)=>{
                if (currLayer && currLayer.Neurons) {
                    currLayer.Neurons.forEach((n: Neuron) => {
                        n.Next.forEach(r => {
                            r.Weight = Math.random();
                        });
                    });
                }
            };

            if(this.isSaveSettingsLayersForAll){
                for (let i = 0; i < this.Layers.Count; i++) {
                    let currLayer = this.Layers.GetLayer(i);
                    if(currLayer)
                        applyFunc(currLayer);
                }
            }else{
                if(this.currSettingsLayer)
                    applyFunc(this.currSettingsLayer);
            }
        }

        trainNet(){
            this.$modal.show("trainSettings");
        }

        closeTrainDialog(){
            this.$modal.hide("trainSettings");
        }

        applyTrain(){
            this.$modal.hide("trainSettings");
            this.showMessageDialog("Успех", "Тренировка началась!");

            let trainer : SimpleTrainer = new  SimpleTrainer(this.Layers);
            trainer.trainModel(new Dataset(), new Dataset(), {

            });

        }

        selLayerRelations(type : number) {

            let applyFunc = (currLayer:NeuroLayer, nxtLayer:NeuroLayer)=>{
                if(type === 1){
                    currLayer.Neurons.forEach((n: Neuron) => {
                        if (n && currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons) {
                            n.Next.forEach(x => {
                                n.RemoveNext(x.Neuron)
                            });

                            nxtLayer.Neurons.forEach(k => {
                                if (k) n.AddNext(new NeuronRelation(k, 1));
                            });
                        }
                    });
                } else {
                    currLayer.Neurons.forEach((n: Neuron, i:number) => {
                        if (n && currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons) {
                            n.Next.forEach(x => {
                                n.RemoveNext(x.Neuron)
                            });

                            if(nxtLayer.Neurons.length > i){
                                n.AddNext(new NeuronRelation(nxtLayer.Neurons[i], 1));
                            }
                        }
                    });
                }
            };

            let currLayer = this.currSettingsLayer;

            if(this.isSaveSettingsLayersForAll) {
                if(this.Layers.Count > 1){
                    currLayer = this.Layers.GetLayer(0);
                    this.Layers.ForEach((l:NeuroLayer, i : Number)=>{
                        if(i > 0 && currLayer){
                            applyFunc(currLayer, l);
                        }
                        currLayer = l;
                    });
                }
            }else if(this.currSettingsLayerIndex + 1 < this.Layers.Count) {
                let nxtLayer = this.Layers.GetLayer(this.currSettingsLayerIndex + 1);
                if (currLayer && currLayer.Neurons && nxtLayer && nxtLayer.Neurons) {
                    applyFunc(currLayer, nxtLayer);
                }
            }
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

                if (target.classList.contains("neuron") && target.parentElement) {
                    this.RelateX += target.parentElement.offsetLeft;
                    this.RelateY += target.offsetTop;
                }
            }
        }

        addLayer() {
            if(this.AddLayersCount > 5) this.AddLayersCount = 5;

            let neurons = 1;

            if(this.Layers.Count > 0){
                let prev = this.Layers.GetLayer(this.Layers.Count - 1);
                if(prev && prev.Neurons)
                    neurons = prev.Neurons.length;
            }

            for(let i =0;i<this.AddLayersCount;i++){
                let layer = new NeuroLayer();
                for(let i =0;i< neurons;i++)
                    layer.AddNeuron();
                this.Layers.PushLayer(layer);
            }

            //this.autoConnectNeurons();
            this.$nextTick(() => {
                this.getAllNeurons();
            });
        }

        addNeuron(layer: NeuroLayer) {
            layer.AddNeuron();
            //this.autoConnectNeurons();

            this.$nextTick(() => {
                this.getAllNeurons();
            });
        }

        zoomChange() {
            //(this.$refs["layers"] as Element).style.zoom = (this.Zoom).toString();
            this.Zoom = this.SliderZoomValue / 8;
            // window.requestAnimationFrame(() => {
            //     this.getAllNeurons()
            // });
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
                                n.RemoveNext(x.Neuron)
                            });

                            nxtLayer.Neurons.forEach(k => {
                                if (k) n.AddNext(new NeuronRelation(k, 1));
                            });
                        }
                    });
                }
            }
        }


        loadWeights(): void {
            let fileLoader = new JsonFileLoader();
            let fileInput: HTMLInputElement = this.$refs.file as HTMLInputElement;
            if (fileInput) {
                fileInput.value = "";
                fileInput.onchange = () => {
                    if (fileInput.files && fileInput.files.length > 0) {
                        fileLoader.loadFile(fileInput.files[0])
                            .then(x => {
                                if (!x || !Array.isArray(x)) {
                                    this.errorDialog("Не верный формат данных!");
                                    return;
                                }

                                this.applyWeights(x);

                            })
                            .catch(e => {
                                window.console.error(e);
                                this.errorDialog(String(e));
                            });
                    }
                };
                fileInput.click();

            }
        }

        applyWeights(w: Array<any>): void {
            this.Layers = new NeuroNet();
            let oldLayer : NeuroLayer | null = null;
            let oldLayerData : Array<any> | null = null;// [{next:[{i:0, w:1},{i:1, w:0.5}]}, {next:[{i:0, w:1}]}, ...}]

            w.forEach((layer : Array<any>) =>{
                let i = 0;
                let l = new NeuroLayer();
                this.Layers.PushLayer(l);
                layer.forEach((n)=>{
                    let neuron = l.AddNeuron();

                    if(oldLayer && oldLayerData) {
                        for(let j =0;j<oldLayerData.length;j++){
                            let isFound = false;
                            if(oldLayerData[j].next){
                                for(let k = 0;k<oldLayerData[j].next.length;k++){
                                    if(oldLayerData[j].next[k] && oldLayerData[j].next[k].i === i) {
                                        oldLayer.Neurons[j].AddNext(new NeuronRelation(neuron, oldLayerData[j].next[k].w));
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                            if(isFound) break;
                        }
                    }
                    i++;
                });

                oldLayer = l;
                oldLayerData = layer;
            });

            this.$nextTick(()=>{
                this.getAllNeurons();
            });
        }

        errorDialog(err: string): void {
            this.showMessageDialog("Ошибка", err);
        }

        showMessageDialog(title:string, message : string){
            this.$modal.show('dialog', {
                title: title,
                text: message,
                buttons: [
                    {
                        title: 'Ok',
                    },
                ]
            });
        }

        mounted(): void {
            this.$nextTick(() => {
                if (this.$store.state.netType != 0) {
                    this.$router.push("create");
                }
            });

            for (let i = 0; i < Math.max(1, Math.min(80, this.$store.state.layers)); i++) {
                let layer = new NeuroLayer();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                layer.AddNeuron();
                this.Layers.PushLayer(layer);
            }

            this.autoConnectNeurons();

            this.$nextTick(() => {
                this.getAllNeurons();
            });
            this.setMouseScrolls();
        }

        setMouseScrolls() {
            let curDown = false,
                curYPos = 0,
                curXPos = 0,
                element = (this.$refs.root as HTMLElement)
            ;

            window.addEventListener("mousemove", (m) => {
                if (curDown) {
                    element.scrollBy((curXPos - m.pageX), (curYPos - m.pageY));
                    curYPos = m.pageY;
                    curXPos = m.pageX;
                }
            });

            element.addEventListener("mousedown", function (m) {
                curYPos = m.pageY;
                curXPos = m.pageX;
                curDown = true;
            });

            window.addEventListener("mouseup", function () {
                curDown = false;
            });
        }

    }
</script>

<style scoped>

    .main-content {
        display: flex;
        align-items: baseline;
        flex-direction: column;
    }

    .root {
        width: fit-content;
        height: 100%;
        margin: auto;
        max-width: 100%;
        overflow-x: auto;
        user-select: none;
        background-color: white;
        box-shadow: inset 2px 2px 7px 3px rgba(0, 0, 0, 0.26);
    }

    .layers-count-input {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        width: 50px;
        text-align: center;
        padding: 2px 2px 2px 9px;
    }

    input#zoom {
        width: 200px;
    }

    .editor-panel {
        width: 100%;
        background-color: #292F36;
        display: flex;
    }


    .editor-panel > .button,
    .editor-panel > .editor-group:first-of-type {
        margin-right: 20px;
    }

    .editor-panel > .editor-group .button:first-of-type {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
    }

    .editor-panel > .flex-grow {
        flex-grow: 1;
    }

    .editor-panel > .editor-group{
        display: flex;
    }

    .editor-panel > .editor-group button {
        flex-grow: 1;
    }

    @media screen and (max-width:1268px) {
        .editor-panel {
            flex-direction: column;
            width: 250px;
            margin-right: 20px;
        }
        .editor-panel select {
            width: 100%;
        }
        .editor-panel > *:not(:last-child) {
            margin-bottom: 10px;
            margin-right: 0 !important;
        }
        .main-content {
            flex-direction: row;
        }
        .root{
        }
    }
    @media screen and (max-width:700px) {
        .main-content {
            flex-direction: column;
        }
        .editor-panel {
            width: 100%;
            margin-right: 0px;
        }
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
        position: relative;
        box-sizing: border-box;

        margin: auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        min-width: 272px;
        width: fit-content;
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

    .layers-col:first-of-type .btn-add-neuron,
    .layers-col:hover .btn-add-neuron {
        opacity: 1;
    }
    .layers-col:first-of-type .btn-set-relations,
    .layers-col:hover .btn-set-relations {
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
        font-size: 30px;
        line-height: 23px;
        left: 0px;
        background-color: #494949;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        user-select: none;
        text-align: center;

        padding: 1px 0 0 1px;
    }

    .layers-col:first-child > .btn-add-neuron {
        left: 26px;
    }

    .btn-add-neuron:hover {
        opacity: 1;
    }

    .btn-set-relations {
        position: absolute;
        top: 2px;
        opacity: 0;
        width: 24px;
        height: 24px;
        font-size: 18px;
        line-height: 23px;
        left: 26px;
        background-color: #494949;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        text-align: center;
        padding: 1px 0 0 0px;
    }
    .btn-set-relations:hover {
        opacity: 1;
    }

    .layers-col:first-child > .btn-set-relations {
        left: 56px;
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

    .relation-settings {
        padding: 5px;
    }
    .relation-settings button:not(:last-child) {
        margin-bottom: 5px;
    }
    .context-menu {
        position: fixed;
        display: none;
    }

    .context-content {
        display: flex;
        flex-direction: column;
        text-align: left;
        justify-content: left;
    }

    .context-content > *:not(:last-child) {
        margin-bottom: 10px;
    }

    .context-content .context-line{
        display: flex;
        flex-direction: row;
    }
    .context-content .context-line button {
        flex-grow: 1;
    }

    .hero-body {
        flex-grow: 1;
        padding-bottom: 1rem;
    }

    .train-settings .dialog-buttons {
        display: flex;
        flex-direction: row;
        width:100%;
        padding: 10px;
    }
    .train-settings .dialog-buttons > button {
        flex-grow: 1;
        margin: 5px;
    }

</style>

<style>
    .train-settings .vm--modal {
        display: flex;
        flex-direction: column;
        height: auto !important;
    }
</style>