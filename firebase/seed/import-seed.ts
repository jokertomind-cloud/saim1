import admin from "firebase-admin";
import { seedData } from "./seed-data";

const app =
  admin.apps[0] ||
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });

const db = admin.firestore(app);

const stamp = {
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function seedCollection(name: keyof typeof seedData) {
  const entries = Object.entries(seedData[name]);
  for (const [id, data] of entries) {
    await db.collection(name).doc(id).set({
      ...data,
      ...stamp
    }, { merge: true });
  }
}

async function main() {
  await seedCollection("avatars");
  await seedCollection("maps");
  await seedCollection("mapPoints");
  await seedCollection("videos");
  await seedCollection("quizzes");
  await seedCollection("quizQuestions");
  console.log("Seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
