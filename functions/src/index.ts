import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

const v1 = express();
const main = express();

main.use('/v1', v1);

//initialize the database and the collection 
const db = admin.firestore();
const documentCollection = db.collection('documents');
export const api = functions.https.onRequest(main);

interface Document {
    title: String,
    description: String
}

// Get all documents
v1.get('/document', async (req, res) => {
    const documents = await documentCollection.get()

    try {
        const documentsData = documents.docs.map(doc => {
            const documentData = doc.data();
            documentData.id = doc.id;
            return documentData;
        })
    
        res.status(200).json(documentsData);
    } catch (error) {
        res.status(500).send(error)
    }
});

// Get document by id
v1.get('/document/:documentId', async (req, res) => {
    const documentId = req.params.documentId;
    const document = await documentCollection.doc(documentId).get();
    const data = document.data();

    try {
        if (!data) {
            throw new Error('Document not found');
        }

        data.id = document.id;
        res.status(200).json(data);
    } catch (error) {
        res.status(404).send(error);
    }
});

// Create document
v1.post('/document', async (req, res) => {
    try {
        if (!req.body.title) {
            throw new Error('Document should contain title');
        }

        const document: Document = {
            title: req.body.title,
            description: req.body.description ?? null
        };

        functions.logger.log('New Document: ', document)

        const newDocumentReference = await documentCollection.add(document);
        const newDocumentSnapshot = await newDocumentReference.get();
        const  newDocumentData = newDocumentSnapshot.data();

        if (!newDocumentData) {
            throw new Error('Failed to create document');
        }

        newDocumentData.id = newDocumentSnapshot.id;
        res.status(201).json(newDocumentData); 
    } catch (error) {
        res.status(400).send(error);
    }
})

// Delete document 
v1.delete('/document/:documentId', async (req, res) => {
    const documentId = req.params.documentId;
    const documentReference = documentCollection.doc(documentId);
    const documentSnapshot = await documentReference.get();
    const documentData = documentSnapshot.data();

    try {
        if (!documentData) {
            throw new Error('Document not found');
        }

        await documentReference.delete();

        res.status(200).json(documentData);
    } catch (error) {
        res.status(404).send(error);
    }
})

// Update document 
v1.put('/document/:documentId', async (req, res) => {
    const documentId = req.params.documentId;

    try {
        functions.logger.log(req.body.title);

        if (!req.body.title) {
            throw new Error('Document should contain title');
        }

        const newDocument: Document = {
            title: req.body.title,
            description: req.body.description ?? null
        };

        const documentReference = documentCollection.doc(documentId);
        const oldDocumentSnapshot = await documentReference.get();

        if (!oldDocumentSnapshot.exists) {
            throw new Error('Document not found');
        }

        await documentReference.update(newDocument);

        const documentData = {
            id: documentId,
            title: newDocument.title,
            description: newDocument.description
        };

        res.status(200).json(documentData);
    } catch (error) {
        res.status(404).send(error);
    }
})