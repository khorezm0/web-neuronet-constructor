<template>
    <div class="main-nodes-container" :style="size">
        <div class="grid main-grid nodes-canvas"
             :style="[{
                backgroundPositionX : positionX + 'px',
                backgroundPositionY : positionY + 'px',
                zoom : positionZ
            }, size]"
             @mousedown="startDrag"
             @mousemove="doDrag"
             @mouseup="endDrag"
             @wheel="zooming"
             ref="canvasElement"
        >
            <NodeElement v-for="e in elements"
                         :positionX="e.posX"
                         :positionY="e.posY"
                         :gridPositionX="positionX"
                         :gridPositionY="positionY"
                         :title="e.title"
            >

            </NodeElement>
        </div>
    </div>
</template>

<script lang="ts">

    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NodeElement from "@/components/NodeElement.vue";
    @Component({
        components: {NodeElement}
    })
    export default class NodesCanvas extends Vue {
        @Prop() private msg!: string;

        positionX : Number = -2;
        positionY : Number = -2;
        positionZ : Number = 1;

        size : any = {
          width : "100%",
          height : "calc(100vh - 80px)"
        };

        elements : any = [
            {
                posX : 0,
                posY : 0,
                title : "Node1"
            },
            {
                posX : 500,
                posY : 0,
                title : "Node2"
            },
        ];

        private isDragging : Boolean = false;
        private mouseOldPos : any = {
            x : 0,
            y : 0
        };

        startDrag(e : MouseEvent){
            if((e.target as Element) === this.$refs.canvasElement){
                this.isDragging = true;
                this.mouseOldPos = {
                    x : e.clientX,
                    y : e.clientY
                };
            }
        }

        doDrag(e : MouseEvent){
            if(this.isDragging){
                this.positionX += (e.clientX - this.mouseOldPos.x) / this.positionZ;
                this.positionY += (e.clientY - this.mouseOldPos.y)  / this.positionZ;

                this.positionX = Math.min(Math.max(this.positionX,-1000),1000);
                this.positionY = Math.min(Math.max(this.positionY,-1000),1000);

                this.mouseOldPos = {
                    x : e.clientX,
                    y : e.clientY
                };
            }
        }

        zooming(e : WheelEvent){
            this.positionZ = Math.min(Math.max(this.positionZ - e.deltaY / 1000.0, 1),4);
        }

        endDrag(e : MouseEvent){
            this.isDragging = false;
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