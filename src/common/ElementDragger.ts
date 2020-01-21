export class DragInfo{
    private readonly _x : number;
    private readonly _y : number;
    private readonly _element : Element;

    constructor(x:number,y:number,element:Element){
        this._x = x;
        this._y = y;
        this._element = element;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get element(): Element {
        return this._element;
    }
}


export class ElementDragger{

    private readonly _element : Element;
    private readonly _allowChilds : Boolean;
    private readonly _onDragging : (drag : DragInfo)=> any;

    private _isDragging : Boolean = false;
    private _posX : number = 0;
    private _posY : number = 0;

    constructor(element:Element, onDragging : (drag:DragInfo)=>any, allowChilds : Boolean = false){
        this._element = element;
        this._allowChilds = allowChilds;
        this._onDragging = onDragging;

        element.addEventListener("mousedown", this.mousedown as EventListener);
        element.addEventListener("mousemove", this.mousemove as EventListener);
        element.addEventListener("mouseup", this.mouseup as EventListener);
    }

    private mousemove = (e:MouseEvent):any =>{
        if(!this._allowChilds || e.target == this._element){
            if(this._isDragging){
                this._onDragging(new DragInfo(e.clientX - this._posX, e.clientY - this._posY, this._element));

                this._posX = e.clientX;
                this._posY = e.clientY;
            }
        }
    };

    private mousedown = (e:MouseEvent):any=>{
        if(this._allowChilds || e.target == this._element){
            this._isDragging = true;
            this._posX = e.clientX;
            this._posY = e.clientY;
        }
    };

    private mouseup = (e:MouseEvent):any=>{
        this._isDragging = false;
    };
}