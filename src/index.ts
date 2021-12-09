import { DataObject } from './Types';
import { serialParser, mqttClient } from './Clients';

var insideArray = false;
var buffer: string[] = new Array();
var childObjects: string[] = new Array();

serialParser.on('data', (data: Buffer) => {
    const newData = data.toString().trim();

    if (newData.startsWith("#")) // We don't need to parse comments
        return;

    if (newData === "}") { // A single curly brace means the broadcast is over and we can try and build the Object from the buffer
        const builtString = buffer.join("") + "}";
        buffer.splice(0, buffer.length);
        childObjects.splice(0, childObjects.length);
        insideArray = false;
        try {
            const builtObject: DataObject = JSON.parse(builtString);
            mqttClient.publish(`${builtObject.Type}/${builtObject.DevAddr}`, builtString);
        } catch(parsingError) {
            console.log(`Couldn't parse ${builtString} with error ${parsingError}.`);
        }
        return;
    }

    if (!insideArray && newData.endsWith("}")) { // We are not inside an array and we have received a complete Object, meaning we can just try to parse it directly
        try {
            const builtObject: DataObject = JSON.parse(newData);
            mqttClient.publish(`${builtObject.Type}/${builtObject.DevAddr}`, newData);
        } catch(parsingError) {
            console.log(`Couldn't parse ${newData} with error ${parsingError}.`);
        }
        return;
    }

    if (newData.endsWith(":")) { // This means the current Objects contains an Object Array and we need to process it accordingly in the following calls
        insideArray = true;
        buffer.push(newData);
        return;
    }

    if (insideArray) { // We are inside an array, so we must append the child Object to it
        childObjects.push(newData);
        if (!newData.endsWith(",")) {
            if (childObjects.length > 1)
                buffer.push(`[${childObjects.join("")}]`); // We have more than one child object in the array so we have to enclose them in an array
            else 
                buffer.push(childObjects[0]); // We have only one child in the array so we don't need the square brackets
            childObjects.splice(0, childObjects.length);
            insideArray = false;
        }
        return;
    }
})
