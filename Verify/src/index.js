const fs = require('fs')
const path = require('path')
const axios = require('axios')

const Start = async () => {
    const dirdb = path.resolve(__dirname,'files','db')
    const dirstripe = path.resolve(__dirname,'files','stripe')
    let stripecontent = []
    let dbcontent = []
    
    fs.readdirSync(dirstripe).forEach(file => {
        if(file.includes('.json')){
            JSON.parse(fs.readFileSync(path.resolve(dirstripe,file),'utf8'))
                                    .map(item => {
                                        for(let index in item){
                                            stripecontent.push({id: index, token:item[index].id})
                                        }
                                    })
        }
    })

    fs.readdirSync(dirdb).forEach(file => {
        if(file.includes('.json')){
            JSON.parse(fs.readFileSync(path.resolve(dirdb,file),'utf8'))
                            .map(item => {dbcontent.push(item)}) 
        }
    })
    
    generateFile([...hasDupsObjects(stripecontent)], 'duplicates','Duplicate entry Stripe')
    generateFile([...hasDupsObjects(dbcontent)], 'duplicates','Duplicate entry DB')

    let not_found = []
    for(let item of dbcontent){
        let response = await checkCustomer(item.token)
        if(response.status != 200){
            not_found.push(`${item.id} - ${item.token} - ERROR: ${response.data ? JSON.stringify(response.data) : false } , ${response.statusText}`)
        }
    }

    for(let item of stripecontent){
        let response = await checkCustomer(item.token)
        if(response.status != 200){
            not_found.push(`${item.id} - ${item.token} - ERROR: ${response.data ? JSON.stringify(response.data) : false } , ${response.statusText}`)
        }
    }
    
    generateFile(not_found,'not_found','[Customer verification]')

}

const hasDupsObjects = (array) => {
    let repeated = []
    array.map((value) => {
      return `${value.id} - ${value.token}`
    }).some((value, index, array) => { 
         if(array.indexOf(value) !== array.lastIndexOf(value)){
            repeated.push(value)
         }
       })
    return new Set(repeated)
}

const generateFile = (objects, name,type) => {
    const filepath = path.resolve(__dirname,'files','output',name,`${new Date().toLocaleDateString()}-${name}.txt`)
    if(!fs.existsSync(filepath)){
        fs.open(filepath,'wx+',(err,file)=> {
            if(err)
                throw err
        })
    }
   const queries = objects.map(item => `${type} ${item}\n`)

   fs.appendFileSync(filepath,new Uint8Array(Buffer.from(queries.join(''))), (err)=>{
       if(err)
            throw err
   })
}

const checkCustomer = async (customer) => {
    return await axios({
        method: 'get',
        url: `https://payments.test.cebroker.com/customer/${customer}`,
        headers: { 'Authorization' : 'Basic ZnJlZDpmcmVk' }
    }).then(resp => {return resp}).catch(resp => {return resp.response})
}

Start()