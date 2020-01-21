<template>
    <div class="main-nodes-container" :style="size">
        <div class="grid main-grid nodes-canvas"
             :style="[{
                backgroundPositionX : positionX + 'px',
                backgroundPositionY : positionY + 'px',
                zoom : positionZ
            }, size]"
             @wheel="zooming"
             ref="canvasElement"
        >
            <NodeElement v-for="(e, id) in elements"
                         :positionX="e.positionX"
                         :positionY="e.positionY"
                         :gridPositionX="positionX"
                         :gridPositionY="positionY"
                         :title="e.title"
                         ref="nodesElements"
            >

            </NodeElement>
        </div>
    </div>
</template>

<script lang="ts">

    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NodeElement from "@/components/NodeElement.vue";
    import {DragInfo, ElementDragger} from "@/common/ElementDragger";
    import {NodeElementModel} from "@/common/NodeElementModel";

    @Component({
        components: {NodeElement}
    })
    export default class NodesCanvas extends Vue {
        @Prop() private msg!: string;

        positionX : number = -2;
        positionY : number = -2;
        positionZ : number = 1;

        size : any = {
          width : "100%",
          height : "calc(100vh - 80px)"
        };

        elements : NodeElementModel[] = [];

        mounted(): void {
            this.elements = [
                new NodeElementModel(0,0,"Node1"),
                new NodeElementModel(0,0,"Node2"),
            ];
            this.$nextTick(()=> {
                new ElementDragger(this.$refs.canvasElement as Element, this.doDrag, false);
                let elements : Vue[] = this.$refs.nodesElements as Vue[];
                this.elements.forEach((el: NodeElementModel, id: number) => {
                    //console.log(elements[id].$el);
                    el.createDragger(elements[id].$el);
                });
            });
        }


        doDrag(e : DragInfo) : any{

                this.positionX += e.x / this.positionZ;
                this.positionY += e.y / this.positionZ;

                this.positionX = Math.min(Math.max(this.positionX,-1000),1000);
                this.positionY = Math.min(Math.max(this.positionY,-1000),1000);
        }

        zooming(e : WheelEvent){
            this.positionZ = Math.min(Math.max(this.positionZ - e.deltaY / 1000.0, 1),4);
        }

    }
</script>

<style scoped>
    .main-nodes-container{
        overflow: hidden;
        width: 100%;
        height: 500px;
    }

    .nodes-canvas{
        position: relative;
    }

    .grid {
        background-color: #47536d;
        background-image:
        linear-gradient(white 1px, transparent 1px),
        linear-gradient(90deg, white 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, .3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, .3) 1px, transparent 1px);
        background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
        background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
    }
</style>