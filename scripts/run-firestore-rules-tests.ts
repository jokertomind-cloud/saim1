import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const PROJECT_ID = "demo-pixel-learning-map-test";

const rules = readFileSync("firebase/firestore.rules", "utf8");

const seedData = async (testEnv: RulesTestEnvironment) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "users", "admin-user"), {
      displayName: "Admin",
      email: "admin@example.com",
      gender: "other",
      avatarId: "avatar-boy-01",
      role: "admin"
    });

    await setDoc(doc(adminDb, "users", "normal-user"), {
      displayName: "Normal",
      email: "normal@example.com",
      gender: "other",
      avatarId: "avatar-boy-01",
      role: "user"
    });

    await setDoc(doc(adminDb, "users", "other-user"), {
      displayName: "Other",
      email: "other@example.com",
      gender: "male",
      avatarId: "avatar-girl-01",
      role: "user"
    });

    await setDoc(doc(adminDb, "userProgress", "normal-user"), {
      currentLevel: 1,
      unlockedVideoIds: ["video-1"],
      completedVideoIds: [],
      passedQuizIds: [],
      discoveredPointIds: [],
      currentMapId: "main-map",
      playerPosition: { mapId: "main-map", x: 0, y: 0 }
    });

    await setDoc(doc(adminDb, "maps", "main-map"), {
      name: "Main Map",
      description: "desc",
      width: 5,
      height: 5,
      tileSize: 56,
      backgroundImageUrl: null,
      startX: 0,
      startY: 0,
      obstacles: [],
      isActive: true,
      sortOrder: 1
    });

    await setDoc(doc(adminDb, "avatars", "avatar-boy-01"), {
      name: "Blue",
      imageUrl: "/avatars/avatar-boy-01.svg",
      thumbnailUrl: "/avatars/avatar-boy-01.svg",
      sortOrder: 1,
      isActive: true
    });

    await setDoc(doc(adminDb, "videos", "video-1"), {
      title: "Video 1",
      description: "desc",
      youtubeUrl: "https://www.youtube.com/watch?v=test",
      youtubeVideoId: "test",
      mapPointId: "point-1",
      level: 1,
      order: 1,
      requiredWatchCount: 1,
      targetGender: "all",
      prerequisiteVideoIds: [],
      prerequisiteQuizIds: [],
      prerequisiteLevel: null,
      playbackMode: "embed",
      isPublished: true
    });
  });
};

const main = async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080
    }
  });

  try {
    await seedData(testEnv);

    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    const userDb = testEnv.authenticatedContext("normal-user").firestore();
    const otherUserDb = testEnv.authenticatedContext("other-user").firestore();
    const adminDb = testEnv.authenticatedContext("admin-user").firestore();
    const claimsAdminDb = testEnv.authenticatedContext("claims-admin", { admin: true }).firestore();
    const claimsOnlyUserDb = testEnv.authenticatedContext("claims-user", { admin: false }).firestore();

    await assertSucceeds(getDoc(doc(anonymousDb, "maps", "main-map")));
    await assertSucceeds(getDoc(doc(anonymousDb, "avatars", "avatar-boy-01")));

    await assertSucceeds(getDoc(doc(userDb, "users", "normal-user")));
    await assertFails(getDoc(doc(userDb, "users", "other-user")));
    await assertSucceeds(getDoc(doc(userDb, "userProgress", "normal-user")));
    await assertFails(getDoc(doc(otherUserDb, "userProgress", "normal-user")));

    await assertSucceeds(
      setDoc(doc(userDb, "userVideoStats", "normal-user_video-1"), {
        uid: "normal-user",
        videoId: "video-1",
        watchCount: 1,
        completedRequiredWatch: true,
        unlockedAt: null,
        firstWatchedAt: null,
        lastWatchedAt: null
      })
    );

    await assertFails(
      setDoc(doc(userDb, "videos", "video-2"), {
        title: "Bad write"
      })
    );

    await assertFails(
      updateDoc(doc(userDb, "users", "normal-user"), {
        role: "admin"
      })
    );

    await assertSucceeds(
      updateDoc(doc(userDb, "users", "normal-user"), {
        displayName: "Updated Name"
      })
    );

    await assertSucceeds(
      setDoc(doc(adminDb, "videos", "video-2"), {
        title: "Admin video",
        description: "desc",
        youtubeUrl: "https://www.youtube.com/watch?v=admin",
        youtubeVideoId: "admin",
        mapPointId: "point-1",
        level: 2,
        order: 2,
        requiredWatchCount: 1,
        targetGender: "all",
        prerequisiteVideoIds: [],
        prerequisiteQuizIds: [],
        prerequisiteLevel: null,
        playbackMode: "embed",
        isPublished: true
      })
    );

    await assertSucceeds(getDoc(doc(adminDb, "userProgress", "normal-user")));
    await assertSucceeds(
      setDoc(doc(claimsAdminDb, "videos", "video-claims-admin"), {
        title: "Claims admin video",
        description: "desc",
        youtubeUrl: "https://www.youtube.com/watch?v=claims",
        youtubeVideoId: "claims",
        mapPointId: "point-1",
        level: 3,
        order: 3,
        requiredWatchCount: 1,
        targetGender: "all",
        prerequisiteVideoIds: [],
        prerequisiteQuizIds: [],
        prerequisiteLevel: null,
        playbackMode: "embed",
        isPublished: true
      })
    );
    await assertSucceeds(getDoc(doc(claimsAdminDb, "userProgress", "normal-user")));
    await assertFails(
      setDoc(doc(claimsOnlyUserDb, "videos", "video-claims-user"), {
        title: "Claims user video"
      })
    );

    console.log("Firestore rules tests passed.");
  } finally {
    await testEnv.clearFirestore();
    await testEnv.cleanup();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
