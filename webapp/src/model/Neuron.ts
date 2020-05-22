import NeuroLayer from "@/model/NeuroLayer";

let neuronsCount = 0;

export default class Neuron {

    public Layer : NeuroLayer | null;
    private _next : Array<Neuron> = new Array<Neuron>();
    private _weight : Number;

    public readonly Id : number;
    public Element : HTMLElement | null = null;

    get X() : number{
        if(this.Element && this.Element.parentElement)
            return this.Element.parentElement.offsetLeft + this.Element.offsetLeft + this.Element.clientWidth * 0.5;
        return 0;
    }

    get Y() : number{
        if(this.Element){
            //let bodyRect = document.body.getBoundingClientRect();
            //let elemRect = this.Element.getBoundingClientRect();
            //let offset   = elemRect.top - bodyRect.top;
            let offset   = this.Element.offsetTop;

            return offset + this.Element.clientHeight * 0.5;
        }
        return 0;
    }

    get LeftBorderX() :number{
        if(this.Element){
            return this.X - this.Element.clientWidth * 0.5;
        }
        return 0;
    }

    get RightBorderX() :number{
        if(this.Element)
            return this.X + this.Element.clientWidth * 0.5;
        return 0;
    }

    constructor(layer : NeuroLayer, next: Array<Neuron> | null, weight : Number = 0) {
        this.Id = neuronsCount++;
        this.Layer = layer;
        if(next) this._next = next;
        this._weight = weight;
    }

    get Next() : Array<Neuron> {
        return [...this._next];
    }

    AddNext(next : Neuron) {
        if(next){
            if(next == this
                || this.Next.indexOf(next) !== -1
                ||
                (next &&
                    (!next.Layer
                    || !this.Layer
                    || next.Layer == this.Layer
                    || next.Layer.Index - this.Layer.Index !== 1
                    )
                )) return;

            this._next.push(next);
        }
    }

    RemoveNext(next : Neuron) {
        this.RemoveNextAt(this._next.indexOf(next));
    }

    RemoveNextAt(i : number){
        if(i>=0 && i < this._next.length){
            this._next = this._next.splice(i, 1);
        }
    }

    get Weight() : Number {
        return this._weight;
    }

    set Weight(weight : Number) {
        this._weight = weight;
    }

}