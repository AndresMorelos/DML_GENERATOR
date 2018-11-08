const fs = require('fs')
const path = require('path')


const generateDML = (objects) => {
    const filepath = path.resolve(__dirname,'dml',`${new Date().toLocaleDateString()}-dml.sql`)
    if(!fs.existsSync(filepath)){
        fs.open(filepath,'wx+',(err,file)=> {
            if(err)
                throw err
        })
    }
   const queries = objects.map(item => `update employer set cd_stripe_token = '${item.token}' where id_employer = ${item.id};\ncommit;\n`)
   queries.unshift('begin\n\n')
   queries.push('\nend;')

   fs.writeFile(filepath,new Uint8Array(Buffer.from(queries.join(''))), (err)=>{
       if(err)
            throw err
   })
}


const Start = () => {
    const dir = path.resolve(__dirname,'file')

    fs.readdirSync(dir).forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.resolve(dir,file),'utf8'))
                        .map(item => {
                            for(let index in item){
                                return {id: index, token:item[index].id}
                            }
                        }) 
                        
       generateDML(content)
    })  
}

Start()