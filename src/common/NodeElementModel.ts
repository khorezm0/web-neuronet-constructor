import {ElementDragger,DragInfo} from "@/common/ElementDragger";

export class NodeElementModel {
    public positionX : number;
    public positionY : number;
    public title : string;
    private elmentDragger! : ElementDragger;

    private _outputs : NodeElementModel[] = [];
    private _outputsPointer : Element[] = [];

    constructor(positionX: number =0, positionY: number=0, title: string="") {
        this.positionX = positionX;
        this.positionY = positionY;
        this.title = title;
    }

    public readonly createDragger = (element:Element, allowChilds:boolean=false)=>{
        this.elmentDragger = new ElementDragger(element, this.onDrag, allowChilds);
    };

    private onDrag = (i:DragInfo):any=>{
        this.positionX += i.x;
        this.positionY += i.y;
    };

    public get outputs() : NodeElementModel[]{
        return this._outputs.slice();
    }

    public addOutput(n:NodeElementModel) : void{
        if(n && this._outputs.indexOf(n) < 0){
            this._outputs.push(n);
        }
    }

    public updateUpdatesPointers(pointers:Element[]){
        this._outputsPointer = pointers;
    }

}