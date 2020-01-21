import {ElementDragger,DragInfo} from "@/common/ElementDragger";

export class NodeElementModel {
    public positionX : number;
    public positionY : number;
    public title : string;
    private elmentDragger! : ElementDragger;


    constructor(positionX: number =0, positionY: number=0, title: string="") {
        this.positionX = positionX;
        this.positionY = positionY;
        this.title = title;
    }

    public readonly createDragger = (element:Element)=>{
        this.elmentDragger = new ElementDragger(element, this.onDrag);
    };

    private onDrag = (i:DragInfo):any=>{
        this.positionX += i.x;
        this.positionY += i.y;
    };

}