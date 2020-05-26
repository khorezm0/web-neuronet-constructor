import NeuroLayer from "@/model/NeuroLayer";

let neuronsCount = 0;

export class NeuronRelation {
    public Neuron : Neuron;
    public Weight : Number;
    constructor(neuron : Neuron, weigth : Number){
        this.Neuron = neuron;
        this.Weight = weigth;
    }
}

export default class Neuron {

    public Layer : NeuroLayer | null;
    private _next : Array<NeuronRelation> = new Array<NeuronRelation>();

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

    constructor(layer : NeuroLayer, next: Array<NeuronRelation> | null) {
        this.Id = neuronsCount++;
        this.Layer = layer;
        if(next) this._next = next;
    }

    get Next() : Array<NeuronRelation> {
        return [...this._next];
    }

    AddNext(next : NeuronRelation) {
        if(next){
            if(next.Neuron == this
                || this.Next.indexOf(next) !== -1
                ||
                (next &&
                    (!next.Neuron.Layer
                    || !this.Layer
                    || next.Neuron.Layer == this.Layer
                    || next.Neuron.Layer.Index - this.Layer.Index !== 1
                    )
                )) return;

            this._next.push(next);
        }
    }

    RemoveNext(next : Neuron) {
        this.RemoveNextAt(this._next.findIndex(x=> x.Neuron == next));
    }

    RemoveNextAt(i : number){
        if(i>=0 && i < this._next.length){
            this._next.splice(i, 1);
        }
    }


}