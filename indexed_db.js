
function open_db(db_name, obj_store) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(db_name, 1);

        request.onerror = function (event) {
            reject("Erro ao abrir o banco de dados: " + event.target.error);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            const objectStore = db.createObjectStore(obj_store, { keyPath: "objectId" });
            objectStore.createIndex("objectId", "objectId", { unique: true });
        };
    });
}

async function get_all(filtro, db_name, obj_store) {
    return new Promise((resolve, reject) => {
        open_db(db_name, obj_store).then(db => {
            const transaction = db.transaction([obj_store], "readwrite");
            const store = transaction.objectStore(obj_store);

            let request = null
            switch (filtro.flag) {
                case "all":
                    request = store.openCursor();
                    break;
                case "data":
                    request = store.openCursor();
                    break;
                default:
                    console.log("não vem ao caso");
                    break;
            }

            let data_return = []
            request.onsuccess = function (event) {
                const request_result = event.target.result;

                switch (filtro.flag) {
                    case "data":
                        if (request_result) {
                            if (`${request_result.value["nome_completo"]}`.includes(filtro.valor)) {
                                data_return.push(request_result.value)
                            }
                            request_result.continue();
                        } else {
                            resolve(data_return);
                        }
                        break;
                    case "all":
                        if (request_result) {
                            data_return.push(request_result.value)
                            request_result.continue();
                        } else {
                            resolve(data_return);
                        }
                        break;
                    default:
                        if (request_result) {
                            //console.log("Dado encontrado:", request_result);
                            resolve(request_result);
                        } else {
                            console.log("Dado não encontrado.");
                        }
                        break;
                }
            };

            request.onerror = function (event) {
                console.error("Erro ao verificar dado:", event.target.error);
            };
        })
    })
}
// Função para inserir dados
async function atualizar_database(jsondata, db_name, obj_store) {
    const db = await open_db(db_name, obj_store);

    const transaction = db.transaction([obj_store], "readwrite");
    const store = transaction.objectStore(obj_store);

    for (let data of jsondata) {
        const request = store.get(data.objectId);
        request.onsuccess = function (event) {
            const pessoa = event.target.result;
            if (pessoa) {
                //console.log("Dado encontrado:", pessoa);
            } else {
                console.log("Dado não encontrado.");
                let request = store.put(data);
                request.onsuccess = function (event) {
                    console.log("Dados inseridos com sucesso!");
                };

                request.onerror = function (event) {
                    console.error(data, "Erro ao inserir dados:", event.target.error);
                };
            }
        };
    }
}

function get_acolhido(objectId, db_name, obj_store) {
    return new Promise((resolve, reject) => {
        open_db(db_name, obj_store).then(db => {
            var transaction = db.transaction([obj_store], 'readonly');
            var objectStore = transaction.objectStore(obj_store);
            var getRequest = objectStore.get(objectId);

            getRequest.onsuccess = function (event) {
                var pessoas = event.target.result;
                if (pessoas) {
                    resolve(pessoas)
                } else {
                    console.log('Nenhuma pessoa encontrado no IndexedDB');
                    resolve(null)
                }
            };

            getRequest.onerror = function (event) {
                console.error('Erro ao recuperar pessoa do IndexedDB');
            };
        })
    })
}