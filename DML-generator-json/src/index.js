const fs = require('fs')
const path = require('path')

const getChunks = (data, value) => {
  let chunks = [];
  let id = 1;

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
        amount: 0,
        id: id
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
      id++
      chunks.push({
        data: [_data],
        amount: 1,
        id: id
      });
    }
  });

  const returnChunks = chunks.map(chunk => { return {data: chunk.data, _id: chunk.id} });
  return returnChunks;
};

const generateDML = (objects) => {
  objects.forEach(({ data, _id }) => {
    const filepath = path.resolve(__dirname, 'dml', `${_id}-${new Date().toISOString()}-dml.sql`)
    if (!fs.existsSync(filepath)) {
      fs.open(filepath, 'wx+', (err, file) => {
        if (err)
          throw err
      })
    }
    const queries = data.map(item => `insert into ZZ_MR_V3_INITIAL_BULK (ID_ENTITY,CD_EVENT_TYPE) values (${item},'UCQ');\ncommit;\n`)
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
    let content = fs.readFileSync(path.resolve(dir, file), 'utf8');
    content = JSON.parse(content)

    content = content.map(item => {
      return item.id_user
    })

    const Chuncks = getChunks(content, 999);

    generateDML(Chuncks);
  });
}

Start();