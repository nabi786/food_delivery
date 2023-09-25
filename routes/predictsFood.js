const express = require('express')
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config()

const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.CLARIFAI_KEY}`);

function predictImage(inputs) {
    return new Promise((resolve, reject) => {
console.log("hello Predict")
        stub.PostModelOutputs(
            {
                // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
                model_id: "food-item-recognition",
                // model_id: "food-item-v1-recognition",
                inputs: inputs
            },
            metadata,
            (err, response) => {
                if (err) {
                    reject("Errror: " + err);
                    return;
                }

                if (response.status.code !== 10000) {
                    reject("Received failed status: " + response.status.description + "\n" + response.status.details);
                    return;
                }

                let results = [];
                // console.log("Predicted concepts, with confidence values:")
                for (const c of response.outputs[0].data.concepts) {
                    // console.log(c.name + ": " + c.value);
                    results.push({
                        name: c.name,
                        value: c.value
                    })
                }
                resolve(results);
            }
        );

    })
}

// myID: afd45fc9b4f44b279073801c5335eaac
//general: aaa03c23b3724a16a56b629203edc62c
// food: 

router.post('/', async function(req, res, next){
    try{
        const {imageUrl} = req.body;
        const inputs = [ 
            {
                data: {
                    image: {
                        url: imageUrl
                    }
            }
        }
        ]
        const results = await predictImage(inputs);
        return res.send({
            results
        })
    }catch(err){
        return res.status(400).send({
            error: err
        })
    }
})

module.exports = router;