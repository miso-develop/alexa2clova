"use strict"

const fs = require("fs")

const jsonPath = process.argv[2] ? `./${process.argv[2]}` : "./alexa.json"
const json = require(jsonPath)
const model = json.interactionModel.languageModel
const skillName = model.invocationName
const intents = model.intents
const slots = model.types

//////// functions ////////////////////////

const makeDir = dir => {
    try {
        fs.mkdirSync(dir)
    }
    catch(e) {}
}

const makeIntents = intents => {
    const intentsDir = "./intents/"
    makeDir(intentsDir)
    
    intents.some(intent => {
        const intentName = intent.name
        if (intentName === "AMAZON.CancelIntent") return
        if (intentName === "AMAZON.HelpIntent") return
        if (intentName === "AMAZON.StopIntent") return
        
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
    const slotsDir = "./slots/"
    makeDir(slotsDir)
    
    slots.some(slot => {
        const slotName = slot.name
        let data = ""
        slot.values.some(value => {
            const line = []
            line.push(value.name.value)
            if (value.name.synonyms)
                value.name.synonyms.some(synonym => {line.push(synonym)})
            data += line.join("\t") + "\r\n"
        })
        
        fs.writeFileSync(`${slotsDir}${slotName}.tsv`, data)
    })
    
    
    
}

//////// main ////////////////////////

try {
    makeIntents(intents)
    makeSlots(slots)
    console.log("Complete!")
} catch(e) {
    console.log(`Error!\n${e}`)
}
