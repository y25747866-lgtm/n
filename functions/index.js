
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { generateEbook } = require("./lib/generateEbook"); // Assuming your compiled JS is in lib

admin.initializeApp();

exports.generateEbook = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  const { topic } = data;
  if (!topic) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "topic" argument.');
  }

  try {
    const ebookContent = await generateEbook(topic);
    return { success: true, ebook: ebookContent };
  } catch (error) {
    console.error("Error in generateEbook callable function:", error);
    throw new functions.https.HttpsError('internal', 'Failed to generate ebook', error.message);
  }
});
