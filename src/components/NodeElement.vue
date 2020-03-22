<template>
    <div class="node-element" :style="positionStyle">
        <div class="header">{{title}}</div>
        <slot>
            <div class="node-outputs">
                <div class="node-output"
                     v-for="(o,index) in model.outputs"
                     :id="index"
                     ref="outputs"
                ></div>
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import {NodeElementModel} from "@/common/NodeElementModel";

    @Component
    export default class NodesElement extends Vue {
        @Prop() private gridPositionY!: number;
        @Prop() private gridPositionX!: number;
        @Prop() private model!:NodeElementModel;

        @Prop() private title!: String;

        mounted(): void {
            this.$nextTick(
                ()=>{
                    let outs = this.$refs.outputs;
                    if(outs){
                        console.log(outs);
                        this.model.updateUpdatesPointers(outs as Element[]);
                    }
                }
            );
        }

        get positionStyle() : any{
            if(!this.model){
                return { };
            }

            return {
                left : this.model.positionX + this.gridPositionX + "px",
                top : this.model.positionY + this.gridPositionY + "px"
            };
        }

    }
</script>

<style scoped>
    .node-element {
        width: 200px;
        /*height: 40px;*/
        -webkit-border-radius: 6px;
        -moz-border-radius: 6px;
        border-radius: 6px;
        border: solid black 2px;
        background-color: chocolate;

        position: absolute;
        user-select: none;
    }
    .header{
        display: block;
        width: 100%;
        background: rgba(0, 0, 0, 0.51);
        color: white;
        margin-bottom: 10px;
        padding: 6px 0;
    }
    .node-outputs {
        width: 100%;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .node-output {
        width: 20px;
        height: 20px;
        background-color: white;
    }
</style>