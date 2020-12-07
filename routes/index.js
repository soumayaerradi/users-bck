const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./../serviceAccount.json");

const router = express.Router();

const users = [];

// inizializzo l'app con configurazione firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// generatore id univoci
function genId(users) {
    return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1
}

// GET LIST
router.get("/users", async (req, res) => {
    const list = await db.collection('users').get();
    list.forEach(doc => users.push(doc.data()));
    return res.json(users);
});

// GET ONE BY ID
router.get("/users/:id", (req, res) => {
    db.collection('users').doc(req.params.id).get()
        .then(
            user => {
                if (!user.exists) {
                    res.status(404).json({message: "User not found"});
                }
                return res.status(200).json(user.data());
            }
        ).catch(error => res.status(500).send(error));
});

// POST
// mancano gli errori
router.post("/users", async (req, res) => {
    // aggiorno la lista
    const list = await db.collection('users').get();
    list.forEach(doc => users.push(doc.data()));

    const newId = genId(users);
    let user = {
        id: newId,
        name: req.body.name
    };
    users.push(user);
    // POST con personalizzazione nome doc
    db.collection('users').doc(newId.toString()).set(user);

    // POST con generazione automatica del nome del doc
    // db.collection('users').add(user);

    return res.status(201).json({ message: "Created" });
});

// PATCH
router.patch("/users/:id", async (req, res) => {
    // aggiorno la lista
    users.length = 0;
    const list = await db.collection('users').get();
    list.forEach(doc => users.push(doc.data()));

    if(!req.body.name) {
        return res.status(400).json({message: "You have to pass a name"});
    }

    const u = await db.collection('users').doc(req.params.id).get();
    if(!u.data()) {
        return res.status(404).json({message: "User not found"});
    }

    db.collection('users').doc(req.params.id).set({name: req.body.name}, {merge: true});

    // errore
    const user = users.find(val => val.id === Number(req.params.id));
    user.name = req.body.name;
    return res.json({ massage: "Updated" });
});

// DELETE
router.delete("/users/:id", async (req, res) => {
    // aggiorno la lista
    users.length = 0;
    const list = await db.collection('users').get();
    list.forEach(doc => users.push(doc.data()));

    const u = await db.collection('users').doc(req.params.id).get();
    if(!u.data()) {
        return res.status(404).json({message: "User not found"});
    }

    db.collection('users').doc(req.params.id).delete();
    // errore
    const userIndex = users.findIndex(val => val.id === Number(req.params.id));
    users.splice(userIndex, 1);
    return res.status(200).json({ message: "Deleted" });
})

module.exports = router; 