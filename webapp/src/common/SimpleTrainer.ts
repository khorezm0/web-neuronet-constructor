import * as tf from "@tensorflow/tfjs";
import NeuroNet from "@/model/NeuroNet";
import Dataset from "@/model/Dataset";
import {data} from "@tensorflow/tfjs";

export interface EpochCallback {
    onEpochEnd(epoch : number, log:any) : void;
    onTrainEnd(logs:any) : void;
}

export default class SimpleTrainer {

    //activations:
    //'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6'
    // | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh'


    tfModel : tf.Sequential | null = null;
    epochs : number = 10;
    inputLen : number = 1;

    currTrainingLoss : number = 0;
    currTrainingAcc : number = 0;
    currTrainingEpoch : number = 0;
    currTrainingDataset : Dataset = new Dataset();
    currValDataset : Dataset = new Dataset();
    outputLen : number = 0;


    constructor(net : NeuroNet){
        this._buildModel(net);
        this.epochs = net.epochs;
    }

    _buildModel(net : NeuroNet){
        let model = tf.sequential();

        for(let i = 0;i<net.Count;i++) {
            let layer = net.GetLayer(i);
            if(!layer) continue;

            let denseLayer : tf.layers.Layer;

            if(i == 0) {
                denseLayer = tf.layers.dense({
                    units : layer.NeuronsCount,
                    activation : layer.activationFunc,
                    inputShape : [layer.NeuronsCount]
                });
                this.inputLen = layer.NeuronsCount;
            }else{
                denseLayer = tf.layers.dense({
                    units : layer.NeuronsCount,
                    activation : layer.activationFunc,
                });
                this.outputLen = layer.NeuronsCount;
            }

            console.log(i+":"+denseLayer.name);
            model.add(denseLayer);
        }

        const optimizer = tf.train.adam();
        model.compile({
            optimizer: optimizer,
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        this.tfModel = model;
    }

    trainModel(dataset : Dataset, testDataset : Dataset, fitCallbacks : EpochCallback | null) : Promise<void>{

        if(!this.tfModel){
            throw new Error("Модель не была создана!");
        }

        //[ `кол-во объектов типо`, `колво нейронов`]
        let trainXs = tf.reshape(dataset.inputs, [dataset.inputs.length, this.inputLen]);
        let trainYs = tf.reshape(dataset.outputs,[dataset.outputs.length, this.outputLen]);

        let testXs = tf.reshape(testDataset.inputs,[testDataset.inputs.length, this.inputLen]);
        let testYs = tf.reshape(testDataset.outputs,[testDataset.outputs.length, this.outputLen]);

        this.currTrainingDataset = dataset;
        this.currValDataset = testDataset;

        let self = this;
        return new Promise((resolve, reject)=> {

            let func: any = {...fitCallbacks};
            func.onTrainBegin = (l)=>{
                resolve();
            };
            func.onEpochEnd = (epoch : number, log : any)=>{
                self.currTrainingAcc = log.acc || 0;
                self.currTrainingLoss = log.loss || 0;
                self.currTrainingEpoch = epoch;
                if(fitCallbacks && fitCallbacks.onEpochEnd) fitCallbacks.onEpochEnd(epoch, log);
            };

            this.tfModel.fit(trainXs, trainYs, {
                //batchSize: BATCH_SIZE,
                validationData: [testXs, testYs],
                epochs: this.epochs,
                shuffle: true,
                callbacks: func
            }).catch(err=>{
                reject(err);
            });
        });
    }

}