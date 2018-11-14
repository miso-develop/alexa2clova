const fs = require("fs")

const alexa2clova = src => {
    const jsonPath = src
    const exportDir = `./alexa2clova/`
    
    const json = require(jsonPath)
    const model = json.interactionModel.languageModel
    const skillName = model.invocationName
    const intents = model.intents
    const slots = model.types
    
    const makeIntents = intents => {
        const intentsDir = `${exportDir}intents/`
        fs.mkdirSync(intentsDir)
        
        intents.some(intent => {
            const intentName = intent.name
            if (intentName.indexOf("AMAZON.") === 0) return
            
            const slotTable = []
            
            let data = "[INTENT SLOT]\r\n"
            
            intent.slots.some(slot => {
                data += `${slot.name}\t${slot.type.replace("AMAZON.", "CLOVA.")}\r\n`
                slotTable.push({
                    name: `{${slot.name}}`,
                    tag: `<${slot.name}>${slot.name}</${slot.name}>`,
                })
            })
            
            data += "\r\n[INTENT EXPRESSION]\r\n"
            
            intent.samples.some(sample => {
                slotTable.some(slot => {
                    sample = sample.replace(slot.name, slot.tag)
                })
                data += `${sample.replace(/\s/g, "")}\r\n`
            })
            
            fs.writeFileSync(`${intentsDir}${intentName}.tsv`, data)
        })
        
    }
    
    const makeSlots = slots => {
        const slotsDir = `${exportDir}slots/`
        fs.mkdirSync(slotsDir)
        
        const snippet = {}
        
        slots.some(slot => {
            const slotName = slot.name
            
            snippet[slotName] = {}
            
            let data = ""
            slot.values.some(value => {
                const line = []
                line.push(value.id)
                line.push(value.name.value)
                if (value.name.synonyms) 
                    value.name.synonyms.some(synonym => {line.push(synonym)})
                data += line.join("\t") + "\r\n"
                
                if (value.id) 
                    snippet[slotName][value.id] = value.name.value
            })
            
            fs.writeFileSync(`${slotsDir}${slotName}.tsv`, data)
        })
        
        const snippetCode = JSON.stringify(snippet)
        fs.writeFileSync(`${exportDir}snippet.js`, `const slotTable = ${snippetCode}`)
    }
    
    const main = () => {
        fs.mkdirSync(exportDir)
        makeIntents(intents)
        makeSlots(slots)
        console.log("alexa2clova complete!")
    }
    main()
}

const clova2alexa = src => {
    const dirPath = src
    const exportFilePath = `./clova2alexa.json`
    
    const intentFileText = "_intent_"
    const slotFileText = "_slottype_"
    
    const intentSlotText = "[INTENT SLOT]"
    const intentExpressionText = "[INTENT EXPRESSION]"
    
    const model = {
        interactionModel: {
            languageModel: {
                invocationName: "your skill name",
                intents: [],
                types: []
            }
        }
    }
    
    const loadModelDir = dirPath => {
        const files = fs.readdirSync(dirPath)
        for (const fileName of files) {
            const filePath = dirPath + fileName
            
            // intent
            if (fileName.indexOf(intentFileText) > -1) {
                makeIntent(filePath)
                
            // slot
            } else if (fileName.indexOf(slotFileText) > -1) {
                makeSlot(filePath)
            }
        }
    }
    
    const makeIntent =  filePath => {
        const intent = {}
        intent.name = filePath.split(intentFileText)[1].replace(".tsv", "")
        
        const intentNameErrorMessage = `Intent Name Error!
The intent name contains letters other than uppercase letters, lowercase letters, and underscore.
Please correct intent name of TSV file.

Intent Name: ${intent.name}
File Path: ${filePath}
        `
        if (!intent.name.match(/^[a-zA-Z_]+$/)) throw intentNameErrorMessage
        
        const data = fs.readFileSync(filePath, "utf8")
        let intentType = ""
        const lines = data.split(/\r\n|\n|\r/)
        for (const line of lines) {
            
            if (line.indexOf(intentSlotText) > -1) {
                intentType = "slot"
                intent.slots = []
                
            } else if (line.indexOf(intentExpressionText) > -1) {
                intentType = "expression"
                intent.samples = []
                
            } else if (line) {
                // slot
                if (intentType === "slot") {
                    const slotArr = line.split("\t")
                    const slot = {
                        name: slotArr[0],
                        type: slotArr[1].replace("CLOVA.", "AMAZON.")
                    }
                    intent.slots.push(slot)
                
                // expression
                } else if (intentType === "expression") {
                    let sample = line
                    const reg = /<(\w+)>[^<>]+<\/\w+>/
                    while (sample.match(reg)) 
                        sample = sample.replace(reg, " {$1} ").replace("  ", " ").trim()
                    intent.samples.push(sample)
                }
            }
        }
        model.interactionModel.languageModel.intents.push(intent)
    }
    
    const makeSlot = filePath => {
        const slot = {
            name: "",
            values: []
        }
        slot.name = filePath.split(slotFileText)[1].replace(".tsv", "")
        const data = fs.readFileSync(filePath, "utf8")
        const lines = data.split(/\r\n|\n|\r/)
        for (const line of lines) {
            if (!line) break
            
            const slotValue = {
                name: {
                    value: ""
                }
            }
            const synonyms = line.split("\t")
            slotValue.name.value = synonyms[0]
            for (let i = 1, len = synonyms.length; i < len; i++) {
                if (!slotValue.name.synonyms) slotValue.name.synonyms = []
                slotValue.name.synonyms.push(synonyms[i])
            }
            slot.values.push(slotValue)
        }
        model.interactionModel.languageModel.types.push(slot)
    }
    
    const main = () => {
        loadModelDir(dirPath)
        fs.writeFileSync(exportFilePath, JSON.stringify(model, 0, "  "))
        console.log("clova2alexa complete!")
    }
    main()
}

const parseArg = () => {
    const helpMessage = `
Usage: node index.js import-data [-r | --reverse] 
        
-r, --reverse
        Convert Clova Skill Model TSV to Alexa Skill Model JSON.
        At this time, please specify the directory storing Clova Skill Model TSV in import-data.
    `
    const result = {
        src: "", 
        reverse: false,
        help: ""
    }
    for (let i = 2, len = process.argv.length; i < len; i++) {
        const arg = process.argv[i]
        if (arg.slice(0, 1) === "-") {
            if (arg === "-r" || arg === "--reverse") {
                result.reverse = true
            } else if (arg === "-h" || arg === "--help") {
                result.help = helpMessage
            } else {
                throw `Option '${arg}' not supported!`
            }
        } else {
            if (!result.src) result.src = arg
        }
    }
    return result
}

const main = () => {
    try {
        const arg = parseArg()
        if (arg.help) return  console.log(arg.help)
        if (!arg.src) throw "Argument is missing!"
        if (arg.reverse) {
            clova2alexa(`./${arg.src}/`)
        } else {
            alexa2clova(`./${arg.src}`)
        }
    } catch(e) {
        console.log(`Error: ${e}`)
    }
}
main()


