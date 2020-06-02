import Neuron from "@/model/Neuron";
import NeuroNet from "@/model/NeuroNet";

let neuroLayersCount = 0;


export default class NeuroLayer{

    private _neurons : Array<Neuron> = new Array<Neuron>();
    private _index : number = 0;
    public readonly Id : number;
    private _net : NeuroNet | null = null;

    activationFunc : 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' = "sigmoid";
    connectionType : 'flat' | 'dense' = "dense";

    constructor(){
        this.Id = neuroLayersCount++;
    }

    set NeuroNet(net : NeuroNet){
        this._net = net;
    }

    AddNeuron() : Neuron {
        let n = new Neuron(this,null);
        this._neurons.push(n);
        return n;
    }

    RemoveNeuron(n : Neuron) {
        this.RemoveNeuronAt(this._neurons.indexOf(n));
    }

    RemoveNeuronAt(n : number) {
        if(n >= 0 && n < this.NeuronsCount){
            this._neurons[n].Layer = null
            this._neurons.splice(n, 1);
            if(this._net) this._net.ClearNullReferences();
        }
    }

    get Neurons() : Array<Neuron>{
        return [...this._neurons];
    }

    get NeuronsCount() : number {
        return this._neurons.length;
    }

    get Index() : number{
        return this._index;
    }

    set Index(index : number){
        this._index = index;
    }
}