<template>
    <div class="node-element" :style="positionStyle">
        <span>{{title}}</span>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component
    export default class NodesElement extends Vue {
        @Prop() private gridPositionY!: number;
        @Prop() private gridPositionX!: number;
        @Prop() private positionY!: number;
        @Prop() private positionX!: number;
        @Prop() private title!: String;

        get positionStyle() : any{
            return {
                left : this.positionX + this.gridPositionX + "px",
                top : this.positionY + this.gridPositionY + "px"
            };
        }

    }
</script>

<style scoped>
    .node-element{
        width: 200px;
        height: 40px;
        line-height: 40px;
        -webkit-border-radius: 6px;
        -moz-border-radius: 6px;
        border-radius: 6px;
        border: solid black 2px;
        background-color: chocolate;

        position: absolute;
        user-select: none;
    }
</style>