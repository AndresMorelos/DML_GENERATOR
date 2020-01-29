const fs = require('fs')
const path = require('path')

const getChunks = (data, value) => {
  let chunks = [];

  /**
   * **Chunck Detail**
   * {
   *  messages: [], **Array, Messages to send**
   *  weigth: 0, **Number, Total weigth of messages**
   *  amount: 0 **Number, Total messages in chunk**
   * }
   *  */

  /**
   *  **Message Detail**
   *   {
   *     Id: '0', **String, Message unique ID**
   *     MessageBody: JSON.stringify(message) **String, Message information**
   *   }
   */

  data.forEach(_data => {
    if (chunks.length === 0) {
      chunks.push({
        data: [],
        amount: 0
      });
    }

    let added = chunks.map(chunk => {
      if (
        chunk.amount < value
      ) {
        chunk.data.push(_data);
        chunk.amount++;
        return true;
      }
      return false;
    });

    if (!added.includes(true)) {
      chunks.push({
        data: [_data],
        amount: 1
      });
    }
  });

  const returnChunks = chunks.map(chunk => chunk.data);
  return returnChunks;
};

const generateDML = (objects) => {
  objects.forEach(chunk => {
    const filepath = path.resolve(__dirname, 'dml', `${new Date().toISOString()}-dml.sql`)
    if (!fs.existsSync(filepath)) {
      fs.open(filepath, 'wx+', (err, file) => {
        if (err)
          throw err
      })
    }
    const queries = chunk.map(item => `update employer set cd_stripe_token = '${item}' where id_employer = ${item};\ncommit;\n`)
    queries.unshift('begin\n\n')
    queries.push('\nend;')

    fs.writeFile(filepath, new Uint8Array(Buffer.from(queries.join(''))), (err) => {
      if (err)
        throw err
    })
  });
}


const Start = () => {
  const dir = path.resolve(__dirname, 'file')

  fs.readdirSync(dir).forEach(file => {
    const content = fs.readFileSync(path.resolve(dir, file), 'utf8').split('\n');

    const Chuncks = getChunks(content, 999);

    generateDML(Chuncks);
  });
}

Start();