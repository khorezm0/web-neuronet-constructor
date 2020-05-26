export default class JsonFileLoader {

    constructor(){}

    loadFile(file : File) : Promise<any> {
        return new Promise((resolve, reject)=>{
            const fr = new FileReader();

            fr.onload = () => {
                if(fr.result){
                    try{
                        let result = JSON.parse(fr.result as string);
                        resolve(result);
                    }
                    catch (e) {
                        reject(e);
                    }
                }else{
                    reject(fr.error);
                }
            };
            fr.onerror = ()=>{
                fr.abort();
                reject(fr.error);
            };
            fr.readAsText(file)
        });
    }
}

