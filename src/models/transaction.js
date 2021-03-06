const {
    runQuery
} = require("../config/db");

exports.CreateTransactionModel = (id_user, id_pelapak, list_item, total_item, courier, total_price) => {
  return new Promise((resolve, reject) => {
    runQuery(`INSERT INTO transaction(id_user,id_pelapak,list_item,total_item,courier,total_price) values('${id_user}','${id_pelapak}','${list_item}','${total_item}','${courier}','${total_price}')`,
      (err, result) => {
        if (err) {
          return reject(new Error(err));
        }
        return resolve(result);
      } 
  );
  });
};

exports.GetDetailTransactionModel = (id) => {
    return new Promise((resolve, reject) => {
        runQuery(`SELECT * FROM transaction JOIN items ON items.id_item = transaction.list_item WHERE id=${id}`, (err, result) => {
            if (err) {
                return reject(new Error(err));
            }
            return resolve(result);
        });
    });
}

exports.GetAllTransactionSellModel = (params) => {
    return new Promise((resolve, reject) => {
        const {
            limit,
            page,
            sort,
            search,
            id_pelapak
        } = params; 

        const join = `JOIN items ON items.id_item = transaction.list_item WHERE transaction.id_pelapak = ${id_pelapak}`;
        const condition = `
        ${search ? `AND name LIKE '%${search}%'` : ""}
        ${sort ? `ORDER BY ${sort.key} ${sort.value}` : "" } LIMIT ${parseInt(limit)} OFFSET ${parseInt(page) - 1}`;
        runQuery(`
        SELECT COUNT(*) AS total FROM transaction ${join} ${condition.substring(0,  condition.indexOf("LIMIT"))};
        SELECT * FROM transaction ${join} ${condition}
        `, (err, result) => {
            if (err) {
                return reject(new Error(err));
            }
            return resolve(result); 
        });
    });
}

exports.GetAllTransactionBuyModel = (params) => {
    return new Promise((resolve, reject) => {
        const {
            limit,
            page,
            sort,
            search,
            id_user
        } = params; 

        const join = `JOIN items ON items.id_item = transaction.list_item WHERE transaction.id_user = ${id_user}`;
        const condition = `
        ${search ? `AND name LIKE '%${search}%'` : ""}
        ${sort ? `ORDER BY ${sort.key} ${sort.value}` : "" } LIMIT ${parseInt(limit)} OFFSET ${parseInt(page) - 1}`;
        runQuery(`
        SELECT COUNT(*) AS total FROM transaction ${join} ${condition.substring(0,  condition.indexOf("LIMIT"))};
        SELECT * FROM transaction ${join} ${condition}
        `, (err, result) => {
            if (err) {
                return reject(new Error(err));
            }
            return resolve(result); 
        });
    });
}
