define(['axios'],
    function (Axios) {

        callGetService = async () => {
            //const localFilePath = '../data/products/tabela-precos.json';
            const localFilePath = 'file:///android_asset/www/data/products/tabela-precos.json';

            url = `${localFilePath}`;

            return new Promise ((resolve, reject) => {

                Axios.get(url)
                    .then((data) => {
                        resolve(data.data);
                    })
                    .catch((error) => {
                        reject(error);
                    })
            })
        }
        return {
            callGetService
        }
    });