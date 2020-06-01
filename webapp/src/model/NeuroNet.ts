import NeuroLayer from "@/model/NeuroLayer";

interface NeuroNetIterator {
    (layer : NeuroLayer, i : any, arr : NeuroNet) : void;
}

export default class NeuroNet {
    private _layers : Array<NeuroLayer> = new Array<NeuroLayer>();
    epochs : number = 10;


    constructor(layers : Array<NeuroLayer> | null = null){
        if(layers){
            this._layers = layers;
            this.countIndexes();
        }
    }

    private countIndexes(){
        this._layers.forEach((x,i)=>{
            x.Index = i;
        });
    }

    PushLayer(layer : NeuroLayer){
        layer.NeuroNet = this;
        this._layers.push(layer);
        this.countIndexes();
    }

    RemoveLayerAt(i : number){
        if(i >= 0 && i < this._layers.length){
            this._layers.splice(i, 1);
            this.countIndexes();
        }
    }

    GetLayer(i : number) : NeuroLayer | null{
        if(i >= 0 && i < this._layers.length) {
            return this._layers[i];
        }

        return null;
    }

    InsertLayer(item : NeuroLayer, i : number){
        if(i >= 0 && i < this._layers.length) {
            this._layers.splice(i, 0, item);
            this.countIndexes();
        }
    }

    ForEach(action : NeuroNetIterator){
        for(let i in this._layers){
            action(this._layers[i], i, this);
        }
    }

    ToArray() : Array<NeuroLayer> {
        return [...this._layers];
    }

    get Count() : number{
        return this._layers.length;
    }

    ClearNullReferences(){
        this.ForEach(x=>{
           x.Neurons.forEach(n=>{
               n.Next.forEach(next=>{
                   if(!next.Neuron.Layer){
                       n.RemoveNext(next.Neuron);
                   }
               });
           });
        });
    }

}