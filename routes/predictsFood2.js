const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config()

const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.CLARIFAI_KEY}`);


// --------------------Check File is image or not ---------------------
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Image Only!');
    }
}


// -----------------------------uploading image using multer
const upload = multer({
    storage: multer.memoryStorage({}),
    limits: { fileSize: 2000000 },
    fileFilter: function (_req, file, cb) {
        checkFileType(file, cb)
    }
})


// ------------------Predict through URL -------------------
function predictImage(inputs) {
    return new Promise((resolve, reject) => {

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
                console.log("Predicted concepts, with confidence values:")
                for (const c of response.outputs[0].data.concepts) {
                    console.log(c.name + ": " + c.value);
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

// router.post('/', async function (req, res, next) {
//     try {
//         const { imageUrl } = req.body;
//         const inputs = [
//             {
//                 data: {
//                     image: {
//                         url: imageUrl
//                     }

//                 }
//             }
//         ]
//         const results = await predictImage(inputs);
//         return res.send({
//             results
//         })
//     } catch (err) {
//         return res.status(400).send({
//             error: err
//         })
//     }
// })


router.post('/upload', upload.single('file'), async function (req, res, next) {
    try {
        console.log('pakistan')
        const inputs = [
            {
                data: {
                    image: {
                        base64: req.file.buffer
                    }
                }
            }
        ]
        // const results = "Success....."
        const results = await predictImage(inputs);
        return res.send({ 
            results
        })
    } catch (err) {
        return res.status(400).send({
            error: err.message
        })
    }
})

module.exports = router;