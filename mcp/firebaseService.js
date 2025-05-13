// firebaseService.js
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.resolve(__dirname, process.env.FIREBASE_KEY_PATH);
const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function saveMcpResult({ question, response, spec, template, createdAt = new Date() }) {
  try {
    const docRef = db.collection('mcp_logs').doc();
    await docRef.set({
      question,
      response,
      spec,
      template,
      created_at: createdAt.toISOString()
    });
    console.log(`✅ Firestore 저장 완료: 문서 ID = ${docRef.id}`);
  } catch (err) {
    console.error('❌ Firestore 저장 실패:', err.message);
  }
}

module.exports = { saveMcpResult };
