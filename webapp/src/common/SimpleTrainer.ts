import tf from "@tensorflow/tfjs";
import NeuroNet from "@/model/NeuroNet";
import Dataset from "@/model/Dataset";
import {BaseCallback} from '@tensorflow/tfjs-layers/dist/base_callbacks';
import {UnresolvedLogs} from '@tensorflow/tfjs-layers/dist/logs';

export interface EpochCallback {
    (epoch : number) : void;
}

class SimpleCallback extends BaseCallback {

    epochCallback : EpochCallback;

    constructor(epochEndCallback  : EpochCallback){
        super();
        this.epochCallback = epochEndCallback;
    }


    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void> {
     return new Promise((resolve, reject)=>{
         try{
             this.epochCallback(epoch);
         }catch (e) {
             console.error(e);
         }
         resolve();
     });
    }
}

export default class SimpleTrainer {

    //activations:
    //'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6'
    // | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh'


    tfModel : tf.Sequential | null = null;

    constructor(net : NeuroNet){
        this._buildModel(net);
    }

    _buildModel(net : NeuroNet){
        let model = tf.sequential();

        net.ForEach(layer => {
            model.add(tf.layers.dense({
                units : Number(layer.NeuronsCount),
                activation : layer.activationFunc
            }));
        });

        const optimizer = tf.train.adam();
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        this.tfModel = model;
    }

    trainModel(dataset : Dataset, testDataset : Dataset, fitCallbacks : EpochCallback | null){

        if(!this.tfModel){
            throw new Error("Модель не была создана!");
        }

        let trainXs = tf.tensor1d(dataset.inputs);
        let trainYs = tf.tensor1d(dataset.outputs);

        let testXs = tf.tensor1d(testDataset.inputs);
        let testYs = tf.tensor1d(testDataset.outputs);

        let func : SimpleCallback;
        if(fitCallbacks){
            func = new SimpleCallback(fitCallbacks);
        }else{
            func = new SimpleCallback((x:number)=>{});
        }

        return this.tfModel.fit(trainXs, trainYs, {
            //batchSize: BATCH_SIZE,
            validationData: [testXs, testYs],
            epochs: 10,
            shuffle: true,
            callbacks: func
        });
    }

}